import { sampleScreenplay } from "@scriptforge/shared";
import { describe, expect, it, vi } from "vitest";

import { LlmClientError } from "../src/llm/errors.js";
import { buildServer } from "../src/server.js";

const validPayload = {
  title: "Fog Harbor Chase",
  adaptation_mode: "dramatic",
  chapters: [
    {
      id: "chapter_01",
      title: "Chapter One",
      content:
        "Lin Wu receives an unsigned letter at the old pier and learns her missing brother may still be alive."
    },
    {
      id: "chapter_02",
      title: "Chapter Two",
      content:
        "At the fish market she traces a rumor and discovers the guard once transferred a prisoner during a storm."
    },
    {
      id: "chapter_03",
      title: "Chapter Three",
      content:
        "At midnight in the bell tower, Captain Zhou is forced to choose between loyalty and the truth."
    }
  ]
} as const;

describe("POST /api/conversions/real", () => {
  it("returns a validated screenplay for valid provider JSON", async () => {
    const app = buildServer({
      llmClient: {
        async generateDraft() {
          return {
            provider: "openai_compatible",
            model: "test-model",
            draftText: JSON.stringify({
              ...sampleScreenplay,
              metadata: {
                ...sampleScreenplay.metadata,
                title: "Fog Harbor Chase",
                adaptation_mode: "dramatic",
                source_chapters: validPayload.chapters.map((chapter, index) => ({
                  chapter_id: chapter.id,
                  chapter_title: chapter.title,
                  chapter_order: index + 1,
                  summary: chapter.content
                }))
              }
            }),
            finishReason: "stop"
          };
        }
      }
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/conversions/real",
      payload: validPayload
    });

    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.source).toBe("real_llm");
    expect(body.mock).toBe(false);
    expect(body.status).toBe("completed");
    expect(body.screenplay.metadata.title).toBe("Fog Harbor Chase");
    expect(body.screenplay.metadata.source_chapters).toHaveLength(3);
  });

  it("returns a structured missing_api_key error when no LLM client can be created", async () => {
    const app = buildServer({
      createLlmClient() {
        throw new LlmClientError(
          "missing_api_key",
          "LLM_API_KEY is required before creating the provider client."
        );
      }
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/conversions/real",
      payload: validPayload
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      error: {
        code: "missing_api_key",
        message: "未配置 LLM API Key"
      }
    });
  });

  it("returns provider_response_invalid when the provider payload is not valid JSON", async () => {
    const app = buildServer({
      llmClient: {
        async generateDraft() {
          return {
            provider: "openai_compatible",
            model: "test-model",
            draftText: "not-json-at-all"
          };
        }
      }
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/conversions/real",
      payload: validPayload
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toEqual({
      error: {
        code: "provider_response_invalid",
        message: "LLM 返回内容不是合法结构化剧本"
      }
    });
  });

  it("returns schema_validation_failed when the provider JSON does not satisfy the shared schema", async () => {
    const app = buildServer({
      llmClient: {
        async generateDraft() {
          return {
            provider: "openai_compatible",
            model: "test-model",
            draftText: JSON.stringify({
              metadata: {
                title: "Broken Draft"
              }
            })
          };
        }
      }
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/conversions/real",
      payload: validPayload
    });

    const body = response.json();

    expect(response.statusCode).toBe(502);
    expect(body.error.code).toBe("schema_validation_failed");
    expect(body.error.message).toBe("生成结果未通过 Schema 校验");
    expect(body.error.details).toEqual(
      expect.arrayContaining([expect.stringContaining("missing required field")])
    );
  });

  it("returns safe schema validation details without exposing the full provider response", async () => {
    const rawProviderValue = JSON.stringify({
      metadata: {
        title: "Broken Draft",
        leaked_text:
          "authorization bearer sk-test-123 raw provider response should never be returned in full"
      }
    });
    const app = buildServer({
      llmClient: {
        async generateDraft() {
          return {
            provider: "openai_compatible",
            model: "test-model",
            draftText: rawProviderValue
          };
        }
      }
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/conversions/real",
      payload: validPayload
    });

    const body = response.json();

    expect(response.statusCode).toBe(502);
    expect(body.error.code).toBe("schema_validation_failed");
    expect(body.error.details.length).toBeGreaterThan(0);
    expect(body.error.details.length).toBeLessThanOrEqual(5);
    expect(body.error.details.join(" ")).not.toContain(rawProviderValue);
    expect(body.error.details.join(" ").toLowerCase()).not.toContain(
      "authorization bearer"
    );
    expect(body.error.details.join(" ").toLowerCase()).not.toContain("sk-test");
  });

  it("returns consistency check details when references are invalid", async () => {
    const app = buildServer({
      llmClient: {
        async generateDraft() {
          return {
            provider: "openai_compatible",
            model: "test-model",
            draftText: JSON.stringify({
              ...sampleScreenplay,
              metadata: {
                ...sampleScreenplay.metadata,
                title: "Consistency Failure Draft",
                adaptation_mode: "dramatic",
                source_chapters: validPayload.chapters.map((chapter, index) => ({
                  chapter_id: chapter.id,
                  chapter_title: chapter.title,
                  chapter_order: index + 1,
                  summary: chapter.content
                }))
              },
              scenes: sampleScreenplay.scenes.map((scene, index) =>
                index === 0
                  ? {
                      ...scene,
                      location_id: "loc_missing",
                      dialogue: scene.dialogue.map((line, lineIndex) =>
                        lineIndex === 0
                          ? {
                              ...line,
                              character_id: "char_missing"
                            }
                          : line
                      )
                    }
                  : scene
              )
            })
          };
        }
      }
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/conversions/real",
      payload: validPayload
    });

    const body = response.json();

    expect(response.statusCode).toBe(502);
    expect(body.error.code).toBe("schema_validation_failed");
    expect(body.error.message).toBe("生成结果未通过 Schema 校验");
    expect(body.error.details).toEqual(
      expect.arrayContaining([
        expect.stringContaining("location_id"),
        expect.stringContaining("character_id")
      ])
    );
  });

  it("repairs one invalid structured draft once when parse succeeds but schema validation fails", async () => {
    const generateDraft = vi
      .fn()
      .mockResolvedValueOnce({
        provider: "openai_compatible",
        model: "test-model",
        draftText: JSON.stringify({
          metadata: {
            title: "Repair Me"
          }
        }),
        finishReason: "stop"
      })
      .mockResolvedValueOnce({
        provider: "openai_compatible",
        model: "test-model",
        draftText: JSON.stringify({
          ...sampleScreenplay,
          metadata: {
            ...sampleScreenplay.metadata,
            title: "Repaired Draft",
            adaptation_mode: "dramatic",
            source_chapters: validPayload.chapters.map((chapter, index) => ({
              chapter_id: chapter.id,
              chapter_title: chapter.title,
              chapter_order: index + 1,
              summary: chapter.content
            }))
          }
        }),
        finishReason: "stop"
      });

    const app = buildServer({
      llmClient: {
        generateDraft
      }
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/conversions/real",
      payload: validPayload
    });

    expect(response.statusCode).toBe(200);
    expect(generateDraft).toHaveBeenCalledTimes(2);
    expect(response.json().screenplay.metadata.title).toBe("Repaired Draft");
  });

  it("does not trigger repair when the provider payload is malformed JSON", async () => {
    const generateDraft = vi.fn().mockResolvedValue({
      provider: "openai_compatible",
      model: "test-model",
      draftText: "not-json-at-all"
    });
    const app = buildServer({
      llmClient: {
        generateDraft
      }
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/conversions/real",
      payload: validPayload
    });

    expect(response.statusCode).toBe(502);
    expect(generateDraft).toHaveBeenCalledTimes(1);
    expect(response.json()).toEqual({
      error: {
        code: "provider_response_invalid",
        message: "LLM 返回内容不是合法结构化剧本"
      }
    });
  });

  it("returns schema_validation_failed with details when repair also fails", async () => {
    const generateDraft = vi
      .fn()
      .mockResolvedValueOnce({
        provider: "openai_compatible",
        model: "test-model",
        draftText: JSON.stringify({
          metadata: {
            title: "Repair Me"
          }
        }),
        finishReason: "stop"
      })
      .mockResolvedValueOnce({
        provider: "openai_compatible",
        model: "test-model",
        draftText: JSON.stringify({
          metadata: {
            title: "Still Broken"
          }
        }),
        finishReason: "stop"
      });

    const app = buildServer({
      llmClient: {
        generateDraft
      }
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/conversions/real",
      payload: validPayload
    });

    const body = response.json();

    expect(response.statusCode).toBe(502);
    expect(generateDraft).toHaveBeenCalledTimes(2);
    expect(body.error.code).toBe("schema_validation_failed");
    expect(body.error.details.length).toBeGreaterThan(0);
    expect(body.error.details.length).toBeLessThanOrEqual(5);
  });

  it("does not rely on mock response data for the real conversion result", async () => {
    const app = buildServer({
      llmClient: {
        async generateDraft() {
          return {
            provider: "openai_compatible",
            model: "test-model",
            draftText: JSON.stringify({
              ...sampleScreenplay,
              metadata: {
                ...sampleScreenplay.metadata,
                title: "Real Flow Draft",
                adaptation_mode: "dramatic",
                source_chapters: validPayload.chapters.map((chapter, index) => ({
                  chapter_id: chapter.id,
                  chapter_title: chapter.title,
                  chapter_order: index + 1,
                  summary: chapter.content
                }))
              },
              quality_hints: {
                ...sampleScreenplay.quality_hints,
                coverage_notes: ["Real flow covers all submitted chapters."]
              }
            })
          };
        }
      }
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/conversions/real",
      payload: validPayload
    });

    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.mock).toBe(false);
    expect(body.warnings).not.toContain(
      "Mock response only. No real LLM conversion was performed."
    );
    expect(body.screenplay.quality_hints.coverage_notes).toEqual([
      "Real flow covers all submitted chapters."
    ]);
  });
});
