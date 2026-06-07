import type { ScreenplayDocument } from "@scriptforge/shared";

import type { AdaptationQualityScoreResult } from "./adaptationQualityScore";
import type { ChapterAnalysisResult } from "./chapterAnalysis";

export type RewriteSuggestionMode =
  | "dialogue-enhancement"
  | "pacing-adjustment"
  | "scene-compression";

export interface RewriteSuggestionItem {
  mode: RewriteSuggestionMode;
  target: string;
  reason: string;
  signalSource: string;
}

export interface RewriteSuggestionsResult {
  title: string;
  badgeLabel: string;
  description: string;
  suggestions: RewriteSuggestionItem[];
}

interface GetRewriteSuggestionsInput {
  screenplay: ScreenplayDocument;
  chapterAnalysis: ChapterAnalysisResult;
  adaptationQualityScore: AdaptationQualityScoreResult;
}

function getDimensionScore(
  score: AdaptationQualityScoreResult,
  dimensionId: AdaptationQualityScoreResult["dimensions"][number]["id"]
): number {
  return (
    score.dimensions.find((dimension) => dimension.id === dimensionId)?.score ?? 100
  );
}

function createDialogueEnhancementSuggestion(
  screenplay: ScreenplayDocument,
  adaptationQualityScore: AdaptationQualityScoreResult
): RewriteSuggestionItem {
  const targetScene =
    screenplay.scenes
      .slice()
      .sort((left, right) => {
        if (left.dialogue.length !== right.dialogue.length) {
          return left.dialogue.length - right.dialogue.length;
        }

        return left.id.localeCompare(right.id);
      })[0] ?? null;
  const conflictClarityScore = getDimensionScore(
    adaptationQualityScore,
    "conflict-clarity"
  );
  const characterCoverageScore = getDimensionScore(
    adaptationQualityScore,
    "character-coverage"
  );
  const target = targetScene ? `scene:${targetScene.id}` : "draft:dialogue-layer";
  const dialogueLineCount = targetScene?.dialogue.length ?? 0;
  const characterHintCount = targetScene
    ? targetScene.characters
        .map(
          (characterId) =>
            screenplay.characters.find((character) => character.id === characterId)
              ?.speech_style
        )
        .filter((speechStyle) => typeof speechStyle === "string" && speechStyle.length > 0)
        .length
    : 0;
  const tone =
    dialogueLineCount <= 2 || conflictClarityScore < 90 || characterCoverageScore < 90
      ? "Strengthen"
      : "Conservative pass";

  return {
    mode: "dialogue-enhancement",
    target,
    reason: targetScene
      ? `${tone}: ${targetScene.id} currently carries ${dialogueLineCount} dialogue line(s). The rule uses scene dialogue density plus ${characterHintCount} available speech-style hint(s), alongside T11 conflict clarity (${conflictClarityScore}) and character coverage (${characterCoverageScore}), to suggest tightening subtext or speaker contrast without generating replacement lines.`
      : `${tone}: no scene-level dialogue target was found, so this suggestion stays at draft level and only reflects T11 conflict clarity (${conflictClarityScore}) and character coverage (${characterCoverageScore}) signals.`,
    signalSource:
      "generated screenplay scenes[].dialogue, scenes[].characters, characters[].speech_style, and T11 AdaptationQualityScoreResult dimensions"
  };
}

function createPacingAdjustmentSuggestion(
  screenplay: ScreenplayDocument,
  chapterAnalysis: ChapterAnalysisResult,
  adaptationQualityScore: AdaptationQualityScoreResult
): RewriteSuggestionItem {
  const structureScore = getDimensionScore(adaptationQualityScore, "structure");
  const unreferencedChapter = chapterAnalysis.coverage.find(
    (chapter) => chapter.status === "unreferenced"
  );
  const mergedScene = screenplay.scenes.find((scene) => scene.chapter_refs.length > 1);
  const target = unreferencedChapter
    ? `chapter:${unreferencedChapter.chapterId}`
    : mergedScene
      ? `scene:${mergedScene.id}`
      : "draft:pacing";
  const conflictGapCount = chapterAnalysis.missingConflicts.filter(
    (item) => item !== "当前规则未发现明显的冲突缺口。"
  ).length;
  const opportunityCount = chapterAnalysis.sceneOpportunities.filter(
    (item) =>
      item !== "当前确定性规则未触发其他场景拓展建议。"
  ).length;
  const tone =
    unreferencedChapter || conflictGapCount > 0 || structureScore < 90
      ? "Adjust"
      : "Conservative pacing check";

  return {
    mode: "pacing-adjustment",
    target,
    reason: unreferencedChapter
      ? `${tone}: ${unreferencedChapter.chapterId} is currently unreferenced in T10 coverage. The rule combines that gap with ${conflictGapCount} missing-conflict signal(s), ${opportunityCount} scene-opportunity signal(s), and T11 structure (${structureScore}) to suggest revisiting where this chapter enters the generated draft.`
      : mergedScene
        ? `${tone}: ${mergedScene.id} merges ${mergedScene.chapter_refs.length} chapter reference(s). The rule uses this visible compression point, plus ${conflictGapCount} missing-conflict signal(s), ${opportunityCount} scene-opportunity signal(s), and T11 structure (${structureScore}), to suggest checking rhythm and transition clarity.`
        : `${tone}: no strong chapter-level pacing gap was found, so this stays at draft level and reflects T10 scene-opportunity signals with T11 structure (${structureScore}).`,
    signalSource:
      "generated screenplay scenes[].chapter_refs plus T10 ChapterAnalysisResult coverage, missingConflicts, sceneOpportunities, and T11 structure dimension"
  };
}

function createSceneCompressionSuggestion(
  screenplay: ScreenplayDocument,
  chapterAnalysis: ChapterAnalysisResult,
  adaptationQualityScore: AdaptationQualityScoreResult
): RewriteSuggestionItem {
  const structureScore = getDimensionScore(adaptationQualityScore, "structure");
  const mergedScene =
    screenplay.scenes.find((scene) => scene.chapter_refs.length > 1) ??
    screenplay.scenes
      .slice()
      .sort((left, right) => {
        if (left.beats.length !== right.beats.length) {
          return right.beats.length - left.beats.length;
        }

        return left.id.localeCompare(right.id);
      })[0] ??
    null;
  const target = mergedScene ? `scene:${mergedScene.id}` : "draft:scene-compression";
  const sceneOpportunityCount = chapterAnalysis.sceneOpportunities.filter(
    (item) =>
      item !== "当前确定性规则未触发其他场景拓展建议。"
  ).length;
  const tone =
    mergedScene && mergedScene.chapter_refs.length > 1
      ? "Compression review"
      : "Conservative compression check";

  return {
    mode: "scene-compression",
    target,
    reason: mergedScene
      ? `${tone}: ${mergedScene.id} currently carries ${mergedScene.beats.length} beat(s) across ${mergedScene.chapter_refs.length} chapter reference(s). The rule uses that density, scene adaptation notes, ${sceneOpportunityCount} T10 scene-opportunity signal(s), and T11 structure (${structureScore}) to suggest checking whether the current compression boundary is still readable.`
      : `${tone}: no single scene target was available, so this remains a draft-level suggestion derived from T10 scene-opportunity signals and T11 structure (${structureScore}).`,
    signalSource:
      "generated screenplay scenes[].chapter_refs, scenes[].beats, scenes[].adaptation_notes, T10 ChapterAnalysisResult sceneOpportunities, and T11 structure dimension"
  };
}

export function getRewriteSuggestions({
  screenplay,
  chapterAnalysis,
  adaptationQualityScore
}: GetRewriteSuggestionsInput): RewriteSuggestionsResult {
  return {
    title: "规则建议",
    badgeLabel: "结构规则建议",
    description:
      "基于规则的改写与重写建议。从生成的剧本结构、章节分析器信号以及改编质量评分维度中提取，不代表模型二次创作结果。",
    suggestions: [
      createDialogueEnhancementSuggestion(screenplay, adaptationQualityScore),
      createPacingAdjustmentSuggestion(
        screenplay,
        chapterAnalysis,
        adaptationQualityScore
      ),
      createSceneCompressionSuggestion(
        screenplay,
        chapterAnalysis,
        adaptationQualityScore
      )
    ]
  };
}
