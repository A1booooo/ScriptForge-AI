import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { submitRealConversion } from "../api/conversions";

describe("submitRealConversion", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("throws the api error message for structured error responses", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: "missing_api_key",
            message: "LLM API Key missing"
          }
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      )
    );

    await expect(
      submitRealConversion({
        title: "",
        adaptation_mode: "faithful",
        chapters: []
      })
    ).rejects.toThrow("LLM API Key missing");
  });

  test("submits the current payload title to the real conversion endpoint", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          conversion_id: "conv_real_001",
          status: "completed",
          mode: "dramatic",
          source: "real_llm",
          input_summary: {
            title: "Current Input Title",
            chapter_count: 3,
            chapter_ids: ["chapter_01", "chapter_02", "chapter_03"]
          },
          screenplay: {
            schema_version: "1.0.0",
            metadata: {
              title: "Current Input Title",
              source_chapters: [
                {
                  chapter_id: "chapter_01",
                  chapter_title: "Chapter 1",
                  chapter_order: 1,
                  summary: "Summary 1"
                },
                {
                  chapter_id: "chapter_02",
                  chapter_title: "Chapter 2",
                  chapter_order: 2,
                  summary: "Summary 2"
                },
                {
                  chapter_id: "chapter_03",
                  chapter_title: "Chapter 3",
                  chapter_order: 3,
                  summary: "Summary 3"
                }
              ],
              genre: "drama",
              language: "zh-CN",
              adaptation_mode: "dramatic",
              logline: "Logline",
              adaptation_notes: ["Note"]
            },
            characters: [],
            locations: [],
            scenes: [],
            quality_hints: {
              coverage_notes: [],
              character_consistency_notes: [],
              pacing_notes: [],
              revision_suggestions: []
            }
          },
          warnings: [],
          mock: false
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      )
    );

    await submitRealConversion({
      title: "Current Input Title",
      adaptation_mode: "dramatic",
      chapters: [
        {
          id: "chapter_01",
          title: "Chapter 1",
          content: "Content 1"
        },
        {
          id: "chapter_02",
          title: "Chapter 2",
          content: "Content 2"
        },
        {
          id: "chapter_03",
          title: "Chapter 3",
          content: "Content 3"
        }
      ]
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/conversions/real",
      expect.objectContaining({
        body: JSON.stringify({
          title: "Current Input Title",
          adaptation_mode: "dramatic",
          chapters: [
            {
              id: "chapter_01",
              title: "Chapter 1",
              content: "Content 1"
            },
            {
              id: "chapter_02",
              title: "Chapter 2",
              content: "Content 2"
            },
            {
              id: "chapter_03",
              title: "Chapter 3",
              content: "Content 3"
            }
          ]
        })
      })
    );
  });
});
