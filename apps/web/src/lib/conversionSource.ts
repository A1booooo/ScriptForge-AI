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
  return source;
}
