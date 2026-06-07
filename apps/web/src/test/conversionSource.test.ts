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
    expect(getResultSourceLabel("real_llm")).toBe("真实 AI 转换");
    expect(getResultSourceLabel("mock")).toBe("示例数据 / Mock");
  });
});
