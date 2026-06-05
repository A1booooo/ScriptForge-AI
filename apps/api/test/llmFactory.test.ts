import { describe, expect, it } from "vitest";

import { LlmClientError } from "../src/llm/errors.js";
import { createLlmClient } from "../src/llm/factory.js";

describe("createLlmClient", () => {
  it("throws a structured error when the API key is missing", () => {
    try {
      createLlmClient({
        env: {
          LLM_API_KEY: "   "
        }
      });
      throw new Error("Expected createLlmClient to throw.");
    } catch (error) {
      expect(error).toBeInstanceOf(LlmClientError);
      expect(error).toMatchObject({
        code: "missing_api_key"
      });
    }
  });
});
