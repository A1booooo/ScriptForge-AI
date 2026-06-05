import { describe, expect, it } from "vitest";

import { LlmClientError } from "../src/llm/errors.js";
import { generateLlmConversionDraft } from "../src/services/llmConversionService.js";

describe("generateLlmConversionDraft", () => {
  it("builds a draft prompt from chapter input and returns LLM draft metadata", async () => {
    let capturedPrompt = "";
    let capturedSystemPrompt = "";

    const result = await generateLlmConversionDraft(
      {
        title: "River Street Mystery",
        adaptationMode: "dramatic",
        chapters: [
          {
            id: "chapter_01",
            title: "Dawn Letter",
            content: "Lin Xia receives a letter at dawn."
          },
          {
            id: "chapter_02",
            title: "Market Rumors",
            content: "She searches the market for clues."
          },
          {
            id: "chapter_03",
            title: "Watchtower Rain",
            content: "She confronts the captain at night."
          }
        ]
      },
      {
        llmClient: {
          async generateDraft(input) {
            capturedPrompt = input.prompt;
            capturedSystemPrompt = input.systemPrompt ?? "";

            return {
              provider: "openai_compatible",
              model: "test-model",
              draftText: "draft screenplay text",
              finishReason: "stop"
            };
          }
        }
      }
    );

    expect(capturedSystemPrompt).toContain("screenplay development assistant");
    expect(capturedPrompt).toContain("Project title: River Street Mystery");
    expect(capturedPrompt).toContain("Adaptation mode: dramatic");
    expect(capturedPrompt).toContain("[chapter_01] Dawn Letter");
    expect(result).toEqual({
      provider: "openai_compatible",
      model: "test-model",
      draftText: "draft screenplay text",
      finishReason: "stop"
    });
  });

  it("preserves structured LLM client errors", async () => {
    const error = new LlmClientError("timeout", "LLM request timed out.");

    await expect(
      generateLlmConversionDraft(
        {
          title: "River Street Mystery",
          adaptationMode: "dramatic",
          chapters: [
            {
              id: "chapter_01",
              title: "Dawn Letter",
              content: "Lin Xia receives a letter at dawn."
            },
            {
              id: "chapter_02",
              title: "Market Rumors",
              content: "She searches the market for clues."
            },
            {
              id: "chapter_03",
              title: "Watchtower Rain",
              content: "She confronts the captain at night."
            }
          ]
        },
        {
          llmClient: {
            async generateDraft() {
              throw error;
            }
          }
        }
      )
    ).rejects.toBe(error);
  });
});
