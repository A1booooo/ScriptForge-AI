import { LlmClientError } from "./errors.js";
import type { LlmConfig, LlmProvider } from "./types.js";

export const DEFAULT_LLM_PROVIDER: LlmProvider = "openai_compatible";
export const DEFAULT_LLM_MODEL = "gpt-4.1-mini";
export const DEFAULT_LLM_BASE_URL = "https://api.openai.com/v1";
export const DEFAULT_LLM_TIMEOUT_MS = 30000;

type LlmEnvironment = Record<string, string | undefined>;

function readTrimmedValue(value: string | undefined): string | undefined {
  const normalized = value?.trim();

  return normalized ? normalized : undefined;
}

function normalizeBaseUrl(value: string | undefined): string {
  const baseUrl = readTrimmedValue(value) ?? DEFAULT_LLM_BASE_URL;

  return baseUrl.replace(/\/+$/, "");
}

function normalizeProvider(value: string | undefined): LlmProvider {
  const provider = readTrimmedValue(value);

  if (!provider) {
    return DEFAULT_LLM_PROVIDER;
  }

  if (provider === "openai_compatible") {
    return provider;
  }

  throw new LlmClientError(
    "invalid_provider",
    `Unsupported LLM provider: ${provider}.`
  );
}

function normalizeTimeout(value: string | undefined): number {
  const normalized = readTrimmedValue(value);

  if (!normalized) {
    return DEFAULT_LLM_TIMEOUT_MS;
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_LLM_TIMEOUT_MS;
  }

  return parsed;
}

export function readLlmConfig(env: LlmEnvironment = process.env): LlmConfig {
  const apiKey = readTrimmedValue(env.LLM_API_KEY);

  return {
    provider: normalizeProvider(env.LLM_PROVIDER),
    model: readTrimmedValue(env.LLM_MODEL) ?? DEFAULT_LLM_MODEL,
    baseUrl: normalizeBaseUrl(env.LLM_BASE_URL),
    timeoutMs: normalizeTimeout(env.LLM_TIMEOUT_MS),
    ...(apiKey ? { apiKey } : {})
  };
}
