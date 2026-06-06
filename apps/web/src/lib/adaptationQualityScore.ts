import type {
  ScreenplayDocument,
  ScreenplayValidationResult
} from "@scriptforge/shared";

import type { ChapterAnalysisResult } from "./chapterAnalysis";

export type AdaptationQualityDimensionId =
  | "structure"
  | "character-coverage"
  | "conflict-clarity"
  | "schema-completeness";

export interface AdaptationQualityDimension {
  id: AdaptationQualityDimensionId;
  label: string;
  score: number;
  reason: string;
  signalSource: string;
}

export interface AdaptationQualityOverallScore {
  label: string;
  score: number;
  reason: string;
}

export interface AdaptationQualityScoreResult {
  isDeterministicDemoScore: true;
  title: string;
  badgeLabel: string;
  description: string;
  overall: AdaptationQualityOverallScore;
  dimensions: AdaptationQualityDimension[];
}

interface GetAdaptationQualityScoreInput {
  screenplay: ScreenplayDocument;
  chapterAnalysis: ChapterAnalysisResult;
  validationResult: ScreenplayValidationResult;
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function createStructureDimension(
  screenplay: ScreenplayDocument
): AdaptationQualityDimension {
  const sceneCount = screenplay.scenes.length;
  const chapterCount = screenplay.metadata.source_chapters.length;
  const mergedSceneCount = screenplay.scenes.filter(
    (scene) => scene.chapter_refs.length > 1
  ).length;
  const sceneWithBeatsCount = screenplay.scenes.filter(
    (scene) => scene.beats.length > 0
  ).length;
  let score = 100;

  if (sceneCount === 0) {
    score = 0;
  } else {
    if (sceneCount < chapterCount) {
      score -= 10;
    }

    if (mergedSceneCount > 0) {
      score -= mergedSceneCount * 4;
    }

    if (sceneWithBeatsCount < sceneCount) {
      score -= (sceneCount - sceneWithBeatsCount) * 8;
    }
  }

  return {
    id: "structure",
    label: "Structure",
    score: clampScore(score),
    reason:
      sceneCount === 0
        ? "The generated draft has no scenes, so the current structure readiness is incomplete."
        : `The generated draft currently maps ${chapterCount} source chapter(s) into ${sceneCount} scene(s), with ${sceneWithBeatsCount}/${sceneCount} scene(s) carrying beats and ${mergedSceneCount} merged scene(s).`,
    signalSource:
      "generated screenplay metadata.source_chapters, scenes[].chapter_refs, and scenes[].beats"
  };
}

function createCharacterCoverageDimension(
  screenplay: ScreenplayDocument,
  chapterAnalysis: ChapterAnalysisResult
): AdaptationQualityDimension {
  const charactersWithoutScenes = screenplay.characters.filter(
    (character) =>
      !screenplay.scenes.some((scene) => scene.characters.includes(character.id))
  );
  const charactersWithoutDialogue = screenplay.characters.filter(
    (character) =>
      !screenplay.scenes.some((scene) =>
        scene.dialogue.some((line) => line.character_id === character.id)
      )
  );
  let score = 100;

  score -= charactersWithoutScenes.length * 20;
  score -= charactersWithoutDialogue.length * 8;
  score -= chapterAnalysis.unreferencedChapterCount * 5;

  const reasonParts: string[] = [];

  if (charactersWithoutScenes.length === 0) {
    reasonParts.push(
      "Every generated character currently has at least one scene appearance."
    );
  } else {
    reasonParts.push(
      `${charactersWithoutScenes.length} generated character(s) have no scene appearance.`
    );
  }

  if (charactersWithoutDialogue.length > 0) {
    reasonParts.push(
      `${charactersWithoutDialogue.length} character(s) also have no dialogue presence in the generated draft.`
    );
  }

  if (chapterAnalysis.unreferencedChapterCount > 0) {
    reasonParts.push(
      `${chapterAnalysis.unreferencedChapterCount} source chapter(s) remain unreferenced in the current Chapter Analyzer coverage pass.`
    );
  }

  return {
    id: "character-coverage",
    label: "Character Coverage",
    score: clampScore(score),
    reason: reasonParts.join(" "),
    signalSource:
      "generated screenplay scenes[].characters, scenes[].dialogue, characters[], and T10 Chapter Analyzer coverage"
  };
}

function createConflictClarityDimension(
  screenplay: ScreenplayDocument,
  chapterAnalysis: ChapterAnalysisResult
): AdaptationQualityDimension {
  const scenesWithoutConflict = screenplay.scenes.filter(
    (scene) => scene.conflict.trim().length === 0
  ).length;
  const missingConflictSignals = chapterAnalysis.missingConflicts.filter(
    (item) => item !== "No conflict gaps were flagged by the current deterministic rules."
  );
  let score = 100;

  score -= scenesWithoutConflict * 20;
  score -= missingConflictSignals.length * 12;

  const reasonParts: string[] = [];

  if (scenesWithoutConflict > 0) {
    reasonParts.push(
      `${scenesWithoutConflict} generated scene(s) currently lack a scene conflict field.`
    );
  } else {
    reasonParts.push(
      "Every generated scene currently includes an explicit conflict field."
    );
  }

  if (missingConflictSignals.length > 0) {
    reasonParts.push(
      `T10 Chapter Analyzer still flags ${missingConflictSignals.length} missing conflicts from deterministic source-to-draft checks.`
    );
  }

  return {
    id: "conflict-clarity",
    label: "Conflict Clarity",
    score: clampScore(score),
    reason: reasonParts.join(" "),
    signalSource:
      "generated screenplay scenes[].conflict and T10 Chapter Analyzer missing conflicts"
  };
}

function createSchemaCompletenessDimension(
  validationResult: ScreenplayValidationResult
): AdaptationQualityDimension {
  const baseScore = validationResult.ok ? 100 : 70;
  const score =
    baseScore -
    validationResult.summary.errorCount * 20 -
    validationResult.summary.warningCount * 8;

  if (validationResult.ok) {
    return {
      id: "schema-completeness",
      label: "Schema Completeness",
      score: 100,
      reason:
        "Validation currently passes without parse, schema, or consistency issues.",
      signalSource:
        "validationResult.ok, validationResult.summary, validationResult.issues"
    };
  }

  return {
    id: "schema-completeness",
    label: "Schema Completeness",
    score: clampScore(score),
    reason: `The current validation state reports ${validationResult.summary.total} issue(s), including ${validationResult.summary.errorCount} error(s) and ${validationResult.summary.warningCount} warning(s).`,
    signalSource:
      "validationResult.ok, validationResult.summary, validationResult.issues"
  };
}

export function getAdaptationQualityScore({
  screenplay,
  chapterAnalysis,
  validationResult
}: GetAdaptationQualityScoreInput): AdaptationQualityScoreResult {
  const dimensions = [
    createStructureDimension(screenplay),
    createCharacterCoverageDimension(screenplay, chapterAnalysis),
    createConflictClarityDimension(screenplay, chapterAnalysis),
    createSchemaCompletenessDimension(validationResult)
  ];

  const overallScore = clampScore(
    dimensions.reduce((sum, dimension) => sum + dimension.score, 0) /
      dimensions.length
  );

  return {
    isDeterministicDemoScore: true,
    title: "Adaptation Quality Score",
    badgeLabel: "Deterministic Demo score",
    description:
      "Rule-based readiness and quality signal. Derived from generated draft structure, T10 Chapter Analyzer signals, and the current YAML validation state. This is not a real LLM quality judgment.",
    overall: {
      label: "Readiness / Quality Score",
      score: overallScore,
      reason:
        "This overall score is a deterministic Demo readiness signal based on generated draft structure, T10 Chapter Analyzer signals, and the current YAML validation state."
    },
    dimensions
  };
}
