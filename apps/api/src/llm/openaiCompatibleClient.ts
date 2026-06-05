import { LlmClientError } from "./errors.js";
import type { LlmClient } from "./client.js";
import type { LlmConfig, LlmDraftRequest, LlmDraftResult } from "./types.js";

interface OpenAiCompatibleClientDependencies {
  fetchImplementation?: typeof fetch;
}

interface OpenAiChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
    finish_reason?: unknown;
  }>;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

async function readJsonSafely(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return undefined;
  }

  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function extractDraftResult(
  payload: unknown,
  config: LlmConfig
): LlmDraftResult {
  const candidate = payload as OpenAiChatCompletionResponse;
  const firstChoice = candidate.choices?.[0];
  const content = firstChoice?.message?.content;

  if (typeof content !== "string" || content.trim().length === 0) {
    throw new LlmClientError(
      "provider_response_invalid",
      "Provider response did not contain draft text."
    );
  }

  const finishReason =
    typeof firstChoice?.finish_reason === "string"
      ? firstChoice.finish_reason
      : undefined;

  return {
    provider: config.provider,
    model: config.model,
    draftText: content,
    ...(finishReason ? { finishReason } : {})
  };
}

export function createOpenAiCompatibleClient(
  config: LlmConfig,
  dependencies: OpenAiCompatibleClientDependencies = {}
): LlmClient {
  const fetchImplementation = dependencies.fetchImplementation ?? fetch;

  return {
    async generateDraft(input: LlmDraftRequest): Promise<LlmDraftResult> {
      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), config.timeoutMs);

      try {
        const response = await fetchImplementation(
          `${config.baseUrl}/chat/completions`,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization: `Bearer ${config.apiKey ?? ""}`
            },
            body: JSON.stringify({
              model: config.model,
              messages: [
                ...(input.systemPrompt
                  ? [
                      {
                        role: "system",
                        content: input.systemPrompt
                      }
                    ]
                  : []),
                {
                  role: "user",
                  content: input.prompt
                }
              ]
            }),
            signal: controller.signal
          }
        );

        if (!response.ok) {
          throw new LlmClientError(
            "request_failed",
            `LLM request failed with status ${response.status}.`,
            { status: response.status }
          );
        }

        const payload = await readJsonSafely(response);

        return extractDraftResult(payload, config);
      } catch (error) {
        if (error instanceof LlmClientError) {
          throw error;
        }

        if (isAbortError(error) || controller.signal.aborted) {
          throw new LlmClientError("timeout", "LLM request timed out.");
        }

        throw new LlmClientError(
          "request_failed",
          "LLM request failed before a valid provider response was received."
        );
      } finally {
        clearTimeout(timeoutHandle);
      }
    }
  };
}
