import { describe, expect, test } from "vitest";

import {
  SAMPLE_INPUT_BADGE_LABEL,
  SAMPLE_INPUT_NOTE,
  sampleInputFormValues
} from "../lib/sampleInputs";

describe("sampleInputFormValues", () => {
  test("provides at least three complete sample chapters", () => {
    expect(sampleInputFormValues.title).toHaveLength(
      sampleInputFormValues.title.length
    );
    expect(sampleInputFormValues.chapters).toHaveLength(3);

    sampleInputFormValues.chapters.forEach((chapter) => {
      expect(chapter.id).not.toHaveLength(0);
      expect(chapter.title).not.toHaveLength(0);
      expect(chapter.content).not.toHaveLength(0);
    });
  });

  test("uses chapter ids aligned with the shared generated draft references", () => {
    expect(sampleInputFormValues.chapters.map((chapter) => chapter.id)).toEqual([
      "chapter_01",
      "chapter_02",
      "chapter_03"
    ]);
  });

  test("exposes explicit sample-input labels for ui disclosure", () => {
    expect(SAMPLE_INPUT_BADGE_LABEL).toContain("Sample");
    expect(SAMPLE_INPUT_NOTE).toContain("填充输入素材");
  });
});
