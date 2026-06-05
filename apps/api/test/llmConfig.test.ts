import { describe, expect, it } from "vitest";

import { DEFAULT_LLM_BASE_URL, DEFAULT_LLM_MODEL, DEFAULT_LLM_PROVIDER, DEFAULT_LLM_TIMEOUT_MS, readLlmConfig } from "../src/llm/config.js";
import { LlmClientError } from "../src/llm/errors.js";

describe("readLlmConfig", () => {
  it("reads trimmed values and applies defaults", () => {
    const config = readLlmConfig({
      LLM_PROVIDER: " openai_compatible ",
      LLM_MODEL: " custom-model ",
      LLM_API_KEY: " secret-token ",
      LLM_BASE_URL: " https://example.test/v1/ ",
      LLM_TIMEOUT_MS: " 45000 "
    });

    expect(config).toEqual({
      provider: "openai_compatible",
      model: "custom-model",
      apiKey: "secret-token",
      baseUrl: "https://example.test/v1",
      timeoutMs: 45000
    });
  });

  it("falls back to defaults and omits blank secrets", () => {
    const config = readLlmConfig({
      LLM_PROVIDER: " ",
      LLM_MODEL: "",
      LLM_API_KEY: "   ",
      LLM_BASE_URL: " ",
      LLM_TIMEOUT_MS: "not-a-number"
    });

    expect(config).toEqual({
      provider: DEFAULT_LLM_PROVIDER,
      model: DEFAULT_LLM_MODEL,
      baseUrl: DEFAULT_LLM_BASE_URL,
      timeoutMs: DEFAULT_LLM_TIMEOUT_MS
    });
    expect(config).not.toHaveProperty("apiKey");
  });

  it("throws a structured error when provider is non-empty but unsupported", () => {
    try {
      readLlmConfig({
        LLM_PROVIDER: "anthropic"
      });
      throw new Error("Expected readLlmConfig to throw.");
    } catch (error) {
      expect(error).toBeInstanceOf(LlmClientError);
      expect(error).toMatchObject({
        code: "invalid_provider"
      });
    }
  });
});
