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
  isDeterministicAnalysis: true;
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
          ? [`场景引用 scene_refs: ${sceneTitles.join(", ")}`]
          : []),
        ...(beatLabels.length > 0 ? [`节拍引用 beat_refs: ${beatLabels.join(", ")}`] : [])
      ];

      return {
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        status,
        summary: `已在生成剧本的场景章节引用 chapter_refs 或节拍来源章节 beat.source_chapter_ids 中找到明确引用。`,
        evidence: evidenceLines
      } satisfies ChapterCoverageItem;
    }

    return {
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      status,
      summary:
        "未在生成剧本的场景章节引用 chapter_refs 或节拍来源章节 beat.source_chapter_ids 中找到明确引用。",
      evidence: ["当前确定性规则未发现明确的场景或节拍引用。"]
    } satisfies ChapterCoverageItem;
  });

  const coveredChapterCount = coverage.filter(
    (chapter) => chapter.status === "covered"
  ).length;
  const unreferencedChapterCount = chapterCount - coveredChapterCount;

  const adaptationChoices = [
    "此面板基于提交的源章节及生成的剧本结构进行确定性规则分析，不涉及模型二次创作推理。"
  ];

  const modeLabels: Record<string, string> = {
    faithful: "忠实改编",
    dramatic: "戏剧强化",
    short_drama: "微短剧化"
  };
  const modeLabel = modeLabels[sourceSnapshot.adaptationMode] || sourceSnapshot.adaptationMode;
  adaptationChoices.push(
    `提交的改编模式为：${modeLabel}。源章节标题为：${sourceSnapshot.title}。`
  );

  if (sceneCount < chapterCount) {
    adaptationChoices.push(
      `生成剧本压缩为 ${sceneCount} 个场景（源章节共 ${chapterCount} 章）。`
    );
  } else if (sceneCount > chapterCount) {
    adaptationChoices.push(
      `生成剧本扩展为 ${sceneCount} 个场景（源章节共 ${chapterCount} 章）。`
    );
  } else {
    adaptationChoices.push(
      `生成剧本保持 ${chapterCount} 个源章节与 ${sceneCount} 个场景的一对一对应。`
    );
  }

  if (mergedSceneCount > 0) {
    adaptationChoices.push(
      `${mergedSceneCount} 个生成场景合并了多个章节引用，这是当前剧本中的压缩改编选择。`
    );
  }

  if (adaptationNotesCount > 0) {
    adaptationChoices.push(
      `在元数据 metadata.adaptation_notes 或场景改编备注 scene.adaptation_notes 中发现了 ${adaptationNotesCount} 条明确的改编说明。`
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
        `${chapter.chapterId} 包含冲突关键字 (${matchedKeywords.join(", ")})，但在生成的剧本草稿中未找到明确的章节引用。`
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
        `${chapter.chapterId} 包含冲突关键字 (${matchedKeywords.join(", ")})，但显式关联的生成场景中未提供场景冲突字段。`
      ];
    }

    return [];
  });

  if (missingConflicts.length === 0) {
    missingConflicts.push(
      "当前规则未发现明显的冲突缺口。"
    );
  }

  const sceneOpportunities: string[] = [];

  coverage
    .filter((chapter) => chapter.status === "unreferenced")
    .forEach((chapter) => {
      sceneOpportunities.push(
        `如果该章节在生成的剧本草稿中需要保持可见，请添加或修改一个显式引用 ${chapter.chapterId} 的场景或节拍。`
      );
    });

  if (mergedSceneCount > 0) {
    sceneOpportunities.push(
      "由于部分场景合并了多个章节引用，如需保留过渡细节，可以补充桥段场景。"
    );
  }

  if (uncoveredCharacters.length > 0) {
    sceneOpportunities.push(
      `生成的剧本草稿中有 ${uncoveredCharacters.length} 个角色没有在场景中出场 (${uncoveredCharacters
        .map((character) => character.name)
        .join(", ")})，这是可能需要恢复场景或重新分配角色的确定性信号。`
    );
  }

  if (sceneOpportunities.length === 0) {
    sceneOpportunities.push(
      "当前确定性规则未触发其他场景拓展建议。"
    );
  }

  return {
    isDeterministicAnalysis: true,
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
