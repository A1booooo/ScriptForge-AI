import { describe, expect, test } from "vitest";
import { sampleScreenplay } from "@scriptforge/shared";

import {
  analyzeChapterAdaptation,
  type SubmittedSourceSnapshot
} from "../lib/chapterAnalysis";
import { getAdaptationQualityScore } from "../lib/adaptationQualityScore";
import { getRewriteSuggestions } from "../lib/rewriteSuggestions";

function createSubmittedSourceSnapshot(): SubmittedSourceSnapshot {
  return {
    title: "River Street Mystery",
    adaptationMode: "dramatic",
    chapters: [
      {
        id: "chapter_01",
        title: "Dawn Letter",
        content: "Lin Xia receives a warning letter and hides it before dawn."
      },
      {
        id: "chapter_02",
        title: "Market Rumors",
        content: "She confronts a witness in the market and risks exposure."
      },
      {
        id: "chapter_03",
        title: "Watchtower Rain",
        content: "She confronts the captain during a storm and demands the truth."
      }
    ]
  };
}

describe("getRewriteSuggestions", () => {
  test("returns deterministic suggestions with the required fields and stable mode coverage", () => {
    const chapterAnalysis = analyzeChapterAdaptation({
      sourceSnapshot: createSubmittedSourceSnapshot(),
      screenplay: sampleScreenplay
    });
    const adaptationQualityScore = getAdaptationQualityScore({
      screenplay: sampleScreenplay,
      chapterAnalysis,
      validationResult: {
        ok: true,
        document: sampleScreenplay,
        issues: [],
        summary: {
          total: 0,
          errorCount: 0,
          warningCount: 0
        }
      }
    });

    const result = getRewriteSuggestions({
      screenplay: sampleScreenplay,
      chapterAnalysis,
      adaptationQualityScore
    });

    expect(result.badgeLabel).toBe("结构规则建议");
    expect(result.description).toContain("基于规则的改写与重写建议");
    expect(result.description).toContain("不代表模型二次创作结果");
    expect(result.suggestions).toHaveLength(3);
    expect(result.suggestions.map((suggestion) => suggestion.mode)).toEqual([
      "dialogue-enhancement",
      "pacing-adjustment",
      "scene-compression"
    ]);
    result.suggestions.forEach((suggestion) => {
      expect(suggestion.target).toMatch(/^(scene|chapter|character|draft):/);
      expect(suggestion.reason.length).toBeGreaterThan(0);
      expect(suggestion.signalSource.length).toBeGreaterThan(0);
    });
  });

  test("uses traceable targets and conservative wording when signals are weaker", () => {
    const sourceSnapshot: SubmittedSourceSnapshot = {
      title: "Gap Case",
      adaptationMode: "faithful",
      chapters: [
        {
          id: "chapter_01",
          title: "Opened Thread",
          content: "A witness argues with the guard and threatens to expose the secret."
        },
        {
          id: "chapter_02",
          title: "Untracked Chapter",
          content: "The family fights over whether to hide the evidence."
        },
        {
          id: "chapter_03",
          title: "Resolution",
          content: "The captain confesses in public."
        }
      ]
    };
    const screenplay = {
      ...sampleScreenplay,
      scenes: sampleScreenplay.scenes.map((scene, index) =>
        index === 0
          ? {
              ...scene,
              chapter_refs: ["chapter_01"],
              beats: scene.beats.map((beat) => ({
                ...beat,
                source_chapter_ids: ["chapter_01"]
              })),
              dialogue: scene.dialogue.slice(0, 1)
            }
          : {
              ...scene,
              chapter_refs: ["chapter_03"],
              beats: scene.beats.map((beat) => ({
                ...beat,
                source_chapter_ids: ["chapter_03"]
              }))
            }
      )
    };
    const chapterAnalysis = analyzeChapterAdaptation({
      sourceSnapshot,
      screenplay
    });
    const adaptationQualityScore = getAdaptationQualityScore({
      screenplay,
      chapterAnalysis,
      validationResult: {
        ok: true,
        document: screenplay,
        issues: [],
        summary: {
          total: 0,
          errorCount: 0,
          warningCount: 0
        }
      }
    });

    const result = getRewriteSuggestions({
      screenplay,
      chapterAnalysis,
      adaptationQualityScore
    });

    expect(
      result.suggestions.find(
        (suggestion) => suggestion.mode === "pacing-adjustment"
      )
    ).toMatchObject({
      target: "chapter:chapter_02"
    });
    expect(
      result.suggestions.find(
        (suggestion) => suggestion.mode === "dialogue-enhancement"
      )?.reason
    ).toMatch(/Strengthen|Conservative pass/);
  });
});
