import type { LlmClient } from "./client.js";
import { readLlmConfig } from "./config.js";
import { LlmClientError } from "./errors.js";
import { createOpenAiCompatibleClient } from "./openaiCompatibleClient.js";

interface CreateLlmClientOptions {
  env?: Record<string, string | undefined>;
  fetchImplementation?: typeof fetch;
}

export function createLlmClient(
  options: CreateLlmClientOptions = {}
): LlmClient {
  const config = readLlmConfig(options.env ?? process.env);

  if (!config.apiKey) {
    throw new LlmClientError(
      "missing_api_key",
      "LLM_API_KEY is required before creating the provider client."
    );
  }

  return createOpenAiCompatibleClient(config, options.fetchImplementation
    ? {
        fetchImplementation: options.fetchImplementation
      }
    : {});
}
