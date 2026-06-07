import { describe, expect, test } from "vitest";
import {
  sampleScreenplay,
  type ScreenplayValidationResult
} from "@scriptforge/shared";

import {
  analyzeChapterAdaptation,
  type SubmittedSourceSnapshot
} from "../lib/chapterAnalysis";
import { getAdaptationQualityScore } from "../lib/adaptationQualityScore";

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

function createPassingValidationResult(): ScreenplayValidationResult {
  return {
    ok: true,
    document: sampleScreenplay,
    issues: [],
    summary: {
      total: 0,
      errorCount: 0,
      warningCount: 0
    }
  };
}

describe("getAdaptationQualityScore", () => {
  test("returns a deterministic demo readiness score with four explainable dimensions", () => {
    const analysis = analyzeChapterAdaptation({
      sourceSnapshot: createSubmittedSourceSnapshot(),
      screenplay: sampleScreenplay
    });

    const result = getAdaptationQualityScore({
      screenplay: sampleScreenplay,
      chapterAnalysis: analysis,
      validationResult: createPassingValidationResult()
    });

    expect(result.isDeterministicScore).toBe(true);
    expect(result.overall.label).toContain("结构就绪度");
    expect(result.overall.reason).toContain("剧本草稿结构");
    expect(result.overall.reason).toContain("校验状态");
    expect(result.dimensions).toHaveLength(4);
    expect(result.dimensions.map((dimension) => dimension.id)).toEqual([
      "structure",
      "character-coverage",
      "conflict-clarity",
      "schema-completeness"
    ]);
    result.dimensions.forEach((dimension) => {
      expect(dimension.score).toBeGreaterThanOrEqual(0);
      expect(dimension.score).toBeLessThanOrEqual(100);
      expect(dimension.reason.length).toBeGreaterThan(0);
      expect(dimension.signalSource.length).toBeGreaterThan(0);
    });
  });

  test("lowers schema completeness using only validation result signals", () => {
    const analysis = analyzeChapterAdaptation({
      sourceSnapshot: createSubmittedSourceSnapshot(),
      screenplay: sampleScreenplay
    });

    const validationResult: ScreenplayValidationResult = {
      ok: false,
      issues: [
        {
          source: "parse",
          code: "yaml_parse_error",
          severity: "error",
          message: "Broken YAML.",
          path: "$"
        },
        {
          source: "schema",
          code: "schema_required",
          severity: "error",
          message: "Missing title.",
          path: "/metadata/title"
        }
      ],
      summary: {
        total: 2,
        errorCount: 2,
        warningCount: 0
      }
    };

    const result = getAdaptationQualityScore({
      screenplay: sampleScreenplay,
      chapterAnalysis: analysis,
      validationResult
    });

    const schemaCompleteness = result.dimensions.find(
      (dimension) => dimension.id === "schema-completeness"
    );

    expect(schemaCompleteness).toMatchObject({
      score: expect.any(Number)
    });
    expect(schemaCompleteness?.score).toBeLessThan(100);
    expect(schemaCompleteness?.reason).toContain("validation");
    expect(schemaCompleteness?.reason).toContain("2 error");
    expect(schemaCompleteness?.signalSource).toContain("validationResult.ok");
    expect(schemaCompleteness?.signalSource).toContain("validationResult.summary");
    expect(schemaCompleteness?.signalSource).toContain("validationResult.issues");
  });

  test("reduces character coverage and conflict clarity from generated draft and chapter analysis signals", () => {
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
      characters: [
        ...sampleScreenplay.characters,
        {
          id: "char_hidden_witness",
          name: "Hidden Witness",
          role: "supporting",
          description: "A witness who never appears in the current draft.",
          motivation: "Stay alive.",
          speech_style: "Brief and evasive.",
          relationships: []
        }
      ],
      scenes: sampleScreenplay.scenes.map((scene, index) =>
        index === 0
          ? {
              ...scene,
              chapter_refs: ["chapter_01"],
              beats: scene.beats.map((beat) => ({
                ...beat,
                source_chapter_ids: ["chapter_01"]
              })),
              conflict: ""
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

    const analysis = analyzeChapterAdaptation({
      sourceSnapshot,
      screenplay
    });

    const result = getAdaptationQualityScore({
      screenplay,
      chapterAnalysis: analysis,
      validationResult: createPassingValidationResult()
    });

    const characterCoverage = result.dimensions.find(
      (dimension) => dimension.id === "character-coverage"
    );
    const conflictClarity = result.dimensions.find(
      (dimension) => dimension.id === "conflict-clarity"
    );

    expect(characterCoverage?.score).toBeLessThan(100);
    expect(characterCoverage?.reason).toContain("no scene appearance");
    expect(characterCoverage?.signalSource).toContain("generated screenplay scenes[].characters");
    expect(conflictClarity?.score).toBeLessThan(100);
    expect(conflictClarity?.reason).toContain("missing conflicts");
    expect(conflictClarity?.signalSource).toContain("T10 Chapter Analyzer");
  });
});
