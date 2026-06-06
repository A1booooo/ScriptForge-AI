import type {
  AdaptationMode,
  ScreenplayCharacter,
  ScreenplayDocument
} from "@scriptforge/shared";

const CONFLICT_KEYWORDS = [
  "argue",
  "attack",
  "betray",
  "conflict",
  "confront",
  "danger",
  "demand",
  "escape",
  "expose",
  "fight",
  "hide",
  "refuse",
  "risk",
  "secret",
  "storm",
  "threat",
  "truth",
  "warning"
] as const;

export interface SubmittedSourceSnapshotChapter {
  id: string;
  title: string;
  content: string;
}

export interface SubmittedSourceSnapshot {
  title: string;
  adaptationMode: AdaptationMode;
  chapters: SubmittedSourceSnapshotChapter[];
}

export interface ChapterCoverageItem {
  chapterId: string;
  chapterTitle: string;
  status: "covered" | "unreferenced";
  summary: string;
  evidence: string[];
}

export interface ChapterAnalysisResult {
  isDemoAnalysis: true;
  sourceTitle: string;
  adaptationMode: AdaptationMode;
  chapterCount: number;
  sceneCount: number;
  coveredChapterCount: number;
  unreferencedChapterCount: number;
  adaptationChoices: string[];
  coverage: ChapterCoverageItem[];
  missingConflicts: string[];
  sceneOpportunities: string[];
}

interface AnalyzeChapterAdaptationInput {
  sourceSnapshot: SubmittedSourceSnapshot;
  screenplay: ScreenplayDocument;
}

interface ChapterReferenceEvidence {
  sceneTitles: Set<string>;
  beatLabels: Set<string>;
}

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function getMatchedConflictKeywords(content: string): string[] {
  const normalizedContent = normalizeText(content);

  return CONFLICT_KEYWORDS.filter((keyword) => normalizedContent.includes(keyword));
}

function formatEvidenceList(values: Iterable<string>): string[] {
  return Array.from(values).sort((left, right) => left.localeCompare(right));
}

function collectExplicitChapterReferences(
  screenplay: ScreenplayDocument
): Map<string, ChapterReferenceEvidence> {
  const evidenceByChapterId = new Map<string, ChapterReferenceEvidence>();

  function getEvidence(chapterId: string): ChapterReferenceEvidence {
    const current = evidenceByChapterId.get(chapterId);

    if (current) {
      return current;
    }

    const next: ChapterReferenceEvidence = {
      sceneTitles: new Set<string>(),
      beatLabels: new Set<string>()
    };

    evidenceByChapterId.set(chapterId, next);

    return next;
  }

  screenplay.scenes.forEach((scene) => {
    scene.chapter_refs.forEach((chapterId) => {
      getEvidence(chapterId).sceneTitles.add(scene.title);
    });

    scene.beats.forEach((beat) => {
      beat.source_chapter_ids.forEach((chapterId) => {
        getEvidence(chapterId).beatLabels.add(`${scene.title} -> ${beat.id}`);
      });
    });
  });

  return evidenceByChapterId;
}

function getAdaptationNotesCount(screenplay: ScreenplayDocument): number {
  return (
    screenplay.metadata.adaptation_notes.length +
    screenplay.scenes.reduce(
      (count, scene) => count + scene.adaptation_notes.length,
      0
    )
  );
}

function getMergedSceneCount(screenplay: ScreenplayDocument): number {
  return screenplay.scenes.filter((scene) => scene.chapter_refs.length > 1).length;
}

function getUncoveredCharacters(
  screenplay: ScreenplayDocument
): ScreenplayCharacter[] {
  const referencedCharacterIds = new Set(
    screenplay.scenes.flatMap((scene) => scene.characters)
  );

  return screenplay.characters.filter(
    (character) => !referencedCharacterIds.has(character.id)
  );
}

export function analyzeChapterAdaptation({
  sourceSnapshot,
  screenplay
}: AnalyzeChapterAdaptationInput): ChapterAnalysisResult {
  const evidenceByChapterId = collectExplicitChapterReferences(screenplay);
  const chapterCount = sourceSnapshot.chapters.length;
  const sceneCount = screenplay.scenes.length;
  const adaptationNotesCount = getAdaptationNotesCount(screenplay);
  const mergedSceneCount = getMergedSceneCount(screenplay);
  const uncoveredCharacters = getUncoveredCharacters(screenplay);

  const coverage = sourceSnapshot.chapters.map((chapter) => {
    const evidence = evidenceByChapterId.get(chapter.id);
    const sceneTitles = evidence ? formatEvidenceList(evidence.sceneTitles) : [];
    const beatLabels = evidence ? formatEvidenceList(evidence.beatLabels) : [];
    const status =
      sceneTitles.length > 0 || beatLabels.length > 0 ? "covered" : "unreferenced";

    if (status === "covered") {
      const evidenceLines = [
        ...(sceneTitles.length > 0
          ? [`Scene refs: ${sceneTitles.join(", ")}`]
          : []),
        ...(beatLabels.length > 0 ? [`Beat refs: ${beatLabels.join(", ")}`] : [])
      ];

      return {
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        status,
        summary: `Explicit references were found for this chapter in generated screenplay chapter_refs or beat source_chapter_ids.`,
        evidence: evidenceLines
      } satisfies ChapterCoverageItem;
    }

    return {
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      status,
      summary:
        "No explicit chapter reference found in generated screenplay chapter_refs or beat source_chapter_ids.",
      evidence: ["No explicit scene or beat reference was found by the current deterministic rules."]
    } satisfies ChapterCoverageItem;
  });

  const coveredChapterCount = coverage.filter(
    (chapter) => chapter.status === "covered"
  ).length;
  const unreferencedChapterCount = chapterCount - coveredChapterCount;

  const adaptationChoices = [
    "This panel is deterministic Demo analysis based on the submitted source snapshot and explicit generated screenplay references."
  ];

  adaptationChoices.push(
    `Submitted adaptation mode: ${sourceSnapshot.adaptationMode}. Source snapshot title: ${sourceSnapshot.title}.`
  );

  if (sceneCount < chapterCount) {
    adaptationChoices.push(
      `The generated draft compresses ${chapterCount} submitted chapters into ${sceneCount} scenes.`
    );
  } else if (sceneCount > chapterCount) {
    adaptationChoices.push(
      `The generated draft expands ${chapterCount} submitted chapters into ${sceneCount} scenes.`
    );
  } else {
    adaptationChoices.push(
      `The generated draft keeps an even ${chapterCount}-chapter to ${sceneCount}-scene count.`
    );
  }

  if (mergedSceneCount > 0) {
    adaptationChoices.push(
      `${mergedSceneCount} generated scene(s) merge multiple chapter references, which is an explicit compression choice visible in chapter_refs.`
    );
  }

  if (adaptationNotesCount > 0) {
    adaptationChoices.push(
      `${adaptationNotesCount} explicit adaptation note(s) were found in metadata.adaptation_notes or scene.adaptation_notes.`
    );
  }

  const missingConflicts = coverage.flatMap((chapter) => {
    const matchedKeywords = getMatchedConflictKeywords(
      sourceSnapshot.chapters.find((item) => item.id === chapter.chapterId)?.content ?? ""
    );

    if (matchedKeywords.length === 0) {
      return [];
    }

    if (chapter.status === "unreferenced") {
      return [
        `${chapter.chapterId} contains conflict keywords (${matchedKeywords.join(", ")}) but no explicit chapter reference was found in the generated draft.`
      ];
    }

    const linkedScenes = screenplay.scenes.filter((scene) =>
      scene.chapter_refs.includes(chapter.chapterId)
    );
    const hasConflictField = linkedScenes.some(
      (scene) => scene.conflict.trim().length > 0
    );

    if (!hasConflictField) {
      return [
        `${chapter.chapterId} contains conflict keywords (${matchedKeywords.join(", ")}) but the explicitly linked generated scenes do not provide a scene conflict field.`
      ];
    }

    return [];
  });

  if (missingConflicts.length === 0) {
    missingConflicts.push(
      "No conflict gaps were flagged by the current deterministic rules."
    );
  }

  const sceneOpportunities: string[] = [];

  coverage
    .filter((chapter) => chapter.status === "unreferenced")
    .forEach((chapter) => {
      sceneOpportunities.push(
        `Add or revise a scene/beat that explicitly references ${chapter.chapterId} if this chapter should remain visible in the generated draft.`
      );
    });

  if (mergedSceneCount > 0) {
    sceneOpportunities.push(
      `Because ${mergedSceneCount} scene(s) merge multiple chapter references, a bridge scene could be added if you want to preserve omitted transitions without changing the schema.`
    );
  }

  if (uncoveredCharacters.length > 0) {
    sceneOpportunities.push(
      `The generated draft has ${uncoveredCharacters.length} character(s) with no scene appearance (${uncoveredCharacters
        .map((character) => character.name)
        .join(", ")}), which is a deterministic signal for a possible scene restore or reassignment.`
    );
  }

  if (sceneOpportunities.length === 0) {
    sceneOpportunities.push(
      "No additional scene opportunities were triggered by the current deterministic rules."
    );
  }

  return {
    isDemoAnalysis: true,
    sourceTitle: sourceSnapshot.title,
    adaptationMode: sourceSnapshot.adaptationMode,
    chapterCount,
    sceneCount,
    coveredChapterCount,
    unreferencedChapterCount,
    adaptationChoices,
    coverage,
    missingConflicts,
    sceneOpportunities
  };
}
