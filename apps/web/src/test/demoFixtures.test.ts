import { describe, expect, test } from "vitest";

import {
  DEMO_SAMPLE_BADGE_LABEL,
  DEMO_SAMPLE_NOTE,
  demoSampleFormValues
} from "../lib/demoFixtures";

describe("demoSampleFormValues", () => {
  test("provides a clearly marked demo sample with at least three complete chapters", () => {
    expect(demoSampleFormValues.title).toContain("Demo");
    expect(demoSampleFormValues.chapters).toHaveLength(3);

    demoSampleFormValues.chapters.forEach((chapter) => {
      expect(chapter.id).not.toHaveLength(0);
      expect(chapter.title).not.toHaveLength(0);
      expect(chapter.content).not.toHaveLength(0);
    });
  });

  test("uses chapter ids aligned with the shared generated draft references", () => {
    expect(demoSampleFormValues.chapters.map((chapter) => chapter.id)).toEqual([
      "chapter_01",
      "chapter_02",
      "chapter_03"
    ]);
  });

  test("exposes explicit demo-only labels for ui disclosure", () => {
    expect(DEMO_SAMPLE_BADGE_LABEL).toContain("Demo");
    expect(DEMO_SAMPLE_NOTE).toMatch(/not real user data/i);
    expect(DEMO_SAMPLE_NOTE).toMatch(/not real llm output/i);
  });
});
