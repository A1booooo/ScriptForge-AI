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
  isDeterministicScore: true;
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
    (item) => item !== "当前规则未发现明显的冲突缺口。"
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
    isDeterministicScore: true,
    title: "结构评分",
    badgeLabel: "结构就绪度评分",
    description:
      "基于规则的就绪度和结构信号。从生成的剧本结构、章节分析器信号以及当前的 YAML 校验状态中提取，不代表模型二次创作结果。",
    overall: {
      label: "结构就绪度",
      score: overallScore,
      reason:
        "此总评分是基于生成的剧本草稿结构、章节分析器信号和当前 YAML 校验状态的确定性就绪度评估。"
    },
    dimensions
  };
}
