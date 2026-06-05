import { describe, expect, test } from "vitest";
import { sampleScreenplay } from "@scriptforge/shared";

import { getScreenplayPreviewChecks } from "../lib/screenplayPreviewChecks";

describe("getScreenplayPreviewChecks", () => {
  test("reports passing checks for the shared sample screenplay", () => {
    const result = getScreenplayPreviewChecks(sampleScreenplay);

    expect(result.summary.total).toBe(3);
    expect(result.summary.failed).toBe(0);
    expect(result.summary.warning).toBe(0);
    expect(result.items.map((item) => item.status)).toEqual([
      "pass",
      "pass",
      "pass"
    ]);
  });

  test("flags missing scene references as a failed preview check", () => {
    const result = getScreenplayPreviewChecks({
      ...sampleScreenplay,
      scenes: [
        {
          ...sampleScreenplay.scenes[0]!,
          location_id: "loc_missing",
          characters: ["char_missing"]
        }
      ]
    });

    expect(result.summary.failed).toBe(1);
    expect(result.items[2]).toMatchObject({
      status: "fail",
      label: "Reference consistency"
    });
    expect(result.items[2]?.details.join(" ")).toContain("loc_missing");
    expect(result.items[2]?.details.join(" ")).toContain("char_missing");
  });
});
