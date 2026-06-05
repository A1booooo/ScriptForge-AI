import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";

import { submitMockConversion } from "../api/conversions";

describe("submitMockConversion", () => {
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
            code: "INVALID_REQUEST",
            message: "title must be a non-empty string."
          }
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      )
    );

    await expect(
      submitMockConversion({
        title: "",
        adaptation_mode: "faithful",
        chapters: []
      })
    ).rejects.toThrow("title must be a non-empty string.");
  });
});
