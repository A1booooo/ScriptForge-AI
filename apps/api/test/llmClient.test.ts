import { describe, expect, it } from "vitest";

import { createOpenAiCompatibleClient } from "../src/llm/openaiCompatibleClient.js";

describe("createOpenAiCompatibleClient", () => {
  it("posts a chat completions request and returns draft text with metadata", async () => {
    let requestUrl = "";
    let requestInit: RequestInit | undefined;

    const client = createOpenAiCompatibleClient(
      {
        provider: "openai_compatible",
        model: "test-model",
        apiKey: "top-secret-key",
        baseUrl: "https://example.test/v1",
        timeoutMs: 5000
      },
      {
        fetchImplementation: async (input, init) => {
          requestUrl = String(input);
          requestInit = init;

          return new Response(
            JSON.stringify({
              choices: [
                {
                  message: {
                    content: "draft screenplay text"
                  },
                  finish_reason: "stop"
                }
              ]
            }),
            {
              status: 200,
              headers: {
                "content-type": "application/json"
              }
            }
          );
        }
      }
    );

    const result = await client.generateDraft({
      prompt: "Turn these chapters into a screenplay draft.",
      systemPrompt: "Return draft text only."
    });

    expect(result).toEqual({
      provider: "openai_compatible",
      model: "test-model",
      draftText: "draft screenplay text",
      finishReason: "stop"
    });
    expect(requestUrl).toBe("https://example.test/v1/chat/completions");
    expect(requestInit?.method).toBe("POST");
    expect(requestInit?.headers).toEqual({
      "content-type": "application/json",
      authorization: "Bearer top-secret-key"
    });

    const body = JSON.parse(String(requestInit?.body));

    expect(body).toEqual({
      model: "test-model",
      messages: [
        {
          role: "system",
          content: "Return draft text only."
        },
        {
          role: "user",
          content: "Turn these chapters into a screenplay draft."
        }
      ]
    });
  });

  it("maps provider response shape errors to a structured invalid-response error", async () => {
    const client = createOpenAiCompatibleClient(
      {
        provider: "openai_compatible",
        model: "test-model",
        apiKey: "top-secret-key",
        baseUrl: "https://example.test/v1",
        timeoutMs: 5000
      },
      {
        fetchImplementation: async () =>
          new Response(
            JSON.stringify({
              choices: []
            }),
            {
              status: 200,
              headers: {
                "content-type": "application/json"
              }
            }
          )
      }
    );

    await expect(
      client.generateDraft({
        prompt: "Prompt"
      })
    ).rejects.toMatchObject({
      code: "provider_response_invalid"
    });
  });

  it("maps non-ok responses to a structured request-failed error without leaking secrets", async () => {
    const client = createOpenAiCompatibleClient(
      {
        provider: "openai_compatible",
        model: "test-model",
        apiKey: "top-secret-key",
        baseUrl: "https://example.test/v1",
        timeoutMs: 5000
      },
      {
        fetchImplementation: async () =>
          new Response(
            JSON.stringify({
              error: {
                message: "Upstream rejected the request."
              }
            }),
            {
              status: 401,
              headers: {
                "content-type": "application/json"
              }
            }
          )
      }
    );

    await expect(
      client.generateDraft({
        prompt: "Prompt"
      })
    ).rejects.toMatchObject({
      code: "request_failed",
      status: 401
    });

    await expect(
      client.generateDraft({
        prompt: "Prompt"
      })
    ).rejects.not.toThrow(/top-secret-key|authorization/i);
  });

  it("aborts timed out requests and maps them to a structured timeout error", async () => {
    const client = createOpenAiCompatibleClient(
      {
        provider: "openai_compatible",
        model: "test-model",
        apiKey: "top-secret-key",
        baseUrl: "https://example.test/v1",
        timeoutMs: 5
      },
      {
        fetchImplementation: async (_input, init) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => {
              reject(new DOMException("The operation was aborted.", "AbortError"));
            });
          })
      }
    );

    await expect(
      client.generateDraft({
        prompt: "Prompt"
      })
    ).rejects.toMatchObject({
      code: "timeout"
    });
  });
});
