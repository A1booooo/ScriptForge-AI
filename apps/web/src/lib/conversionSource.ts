import type { ConversionResponse } from "../types";

export function isRealLlmResult(
  result: Pick<ConversionResponse, "source">
): boolean {
  return result.source === "real_llm";
}

export function isMockResult(
  result: Pick<ConversionResponse, "source">
): boolean {
  return result.source === "mock";
}

export function getResultSourceLabel(
  source: ConversionResponse["source"]
): string {
  if (source === "real_llm") {
    return "真实 AI 转换";
  }
  if (source === "mock") {
    return "示例数据 / Mock";
  }
  return source;
}
