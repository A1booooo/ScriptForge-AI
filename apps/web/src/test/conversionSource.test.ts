import { describe, expect, test } from "vitest";

import {
  getResultSourceLabel,
  isMockResult,
  isRealLlmResult
} from "../lib/conversionSource";

describe("conversionSource", () => {
  test("distinguishes real_llm results from mock results", () => {
    expect(isRealLlmResult({ source: "real_llm" })).toBe(true);
    expect(isRealLlmResult({ source: "mock" })).toBe(false);
    expect(isMockResult({ source: "mock" })).toBe(true);
    expect(isMockResult({ source: "real_llm" })).toBe(false);
  });

  test("returns a stable source label for known sources", () => {
    expect(getResultSourceLabel("real_llm")).toBe("real_llm");
    expect(getResultSourceLabel("mock")).toBe("mock");
  });
});
