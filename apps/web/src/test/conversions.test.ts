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
            message: "未配置 LLM API Key"
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
    ).rejects.toThrow("未配置 LLM API Key");
  });
});
