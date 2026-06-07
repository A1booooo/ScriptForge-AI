import { describe, expect, it } from "vitest";
import { sampleScreenplay } from "@scriptforge/shared";

import { LlmClientError } from "../src/llm/errors.js";
import { buildServer } from "../src/server.js";

const validPayload = {
  title: "雾港追缉令",
  adaptation_mode: "dramatic",
  chapters: [
    {
      id: "chapter_01",
      title: "第一章",
      content: "林雾在旧码头收到一封匿名信，得知失踪多年的哥哥可能仍然活着。"
    },
    {
      id: "chapter_02",
      title: "第二章",
      content: "她在鱼市追查传言，发现巡防队曾在暴雨夜秘密转移一名囚犯。"
    },
    {
      id: "chapter_03",
      title: "第三章",
      content: "深夜钟楼对峙时，周队长被迫在忠诚与真相之间做出选择。"
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
                title: "雾港追缉令",
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
    expect(body.screenplay.metadata.title).toBe("雾港追缉令");
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
                title: "坏数据"
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

    expect(response.statusCode).toBe(502);
    expect(response.json()).toEqual({
      error: {
        code: "schema_validation_failed",
        message: "生成结果未通过 Schema 校验"
      }
    });
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
                title: "真实链路草稿",
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
                coverage_notes: ["真实链路覆盖全部章节"]
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
      "真实链路覆盖全部章节"
    ]);
  });
});
