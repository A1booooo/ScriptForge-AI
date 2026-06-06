import { describe, expect, test } from "vitest";
import { sampleScreenplay } from "@scriptforge/shared";

import {
  analyzeChapterAdaptation,
  type SubmittedSourceSnapshot
} from "../lib/chapterAnalysis";

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

describe("analyzeChapterAdaptation", () => {
  test("summarizes deterministic demo analysis using submitted source snapshot and explicit screenplay references", () => {
    const result = analyzeChapterAdaptation({
      sourceSnapshot: createSubmittedSourceSnapshot(),
      screenplay: sampleScreenplay
    });

    expect(result.isDemoAnalysis).toBe(true);
    expect(result.sourceTitle).toBe("River Street Mystery");
    expect(result.adaptationMode).toBe("dramatic");
    expect(result.adaptationChoices.join(" ")).toContain("deterministic Demo analysis");
    expect(result.adaptationChoices.join(" ")).toContain("chapter references");
    expect(result.coverage).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          chapterId: "chapter_01",
          status: "covered"
        }),
        expect.objectContaining({
          chapterId: "chapter_02",
          status: "covered"
        }),
        expect.objectContaining({
          chapterId: "chapter_03",
          status: "covered"
        })
      ])
    );
    expect(result.sceneOpportunities.join(" ")).toContain("merge");
  });

  test("uses conservative coverage and conflict warnings when no explicit chapter reference is found", () => {
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
              }))
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

    const result = analyzeChapterAdaptation({
      sourceSnapshot,
      screenplay
    });

    expect(result.coverage).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          chapterId: "chapter_02",
          status: "unreferenced",
          summary: expect.stringContaining("No explicit chapter reference found")
        })
      ])
    );
    expect(result.missingConflicts.join(" ")).toContain("chapter_02");
    expect(result.missingConflicts.join(" ")).toContain("conflict keywords");
    expect(result.sceneOpportunities.join(" ")).toContain("chapter_02");
  });
});
