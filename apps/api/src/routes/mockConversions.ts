import type { FastifyPluginAsync } from "fastify";

import { ADAPTATION_MODES } from "@scriptforge/shared";

import { createMockConversionResponse } from "../services/mockConversionService.js";
import type {
  ApiErrorResponse,
  MockConversionRequest,
  MockConversionChapterInput,
} from "../types.js";

function createInvalidRequest(message: string): ApiErrorResponse {
  return {
    error: {
      code: "INVALID_REQUEST",
      message
    }
  };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isAdaptationMode(
  value: unknown
): value is MockConversionRequest["adaptation_mode"] {
  return (
    isNonEmptyString(value) &&
    ADAPTATION_MODES.some((mode) => mode === value)
  );
}

function validateChapter(
  chapter: unknown,
  index: number
): chapter is MockConversionChapterInput {
  if (typeof chapter !== "object" || chapter === null) {
    return false;
  }

  const candidate = chapter as Record<string, unknown>;
  const fieldPrefix = `chapters[${index}]`;

  if (!isNonEmptyString(candidate.id)) {
    throw new Error(`${fieldPrefix}.id must be a non-empty string.`);
  }

  if (!isNonEmptyString(candidate.title)) {
    throw new Error(`${fieldPrefix}.title must be a non-empty string.`);
  }

  if (!isNonEmptyString(candidate.content)) {
    throw new Error(`${fieldPrefix}.content must be a non-empty string.`);
  }

  return true;
}

function parseMockConversionRequest(body: unknown): MockConversionRequest {
  if (typeof body !== "object" || body === null) {
    throw new Error("Request body must be a JSON object.");
  }

  const candidate = body as Record<string, unknown>;

  if (!isNonEmptyString(candidate.title)) {
    throw new Error("title must be a non-empty string.");
  }

  if (!Array.isArray(candidate.chapters) || candidate.chapters.length < 3) {
    throw new Error("chapters must contain at least 3 items.");
  }

  if (!isAdaptationMode(candidate.adaptation_mode)) {
    throw new Error(
      "adaptation_mode must be one of: faithful, dramatic, short_drama."
    );
  }

  candidate.chapters.forEach((chapter, index) => validateChapter(chapter, index));

  return {
    title: candidate.title,
    chapters: candidate.chapters as MockConversionChapterInput[],
    adaptation_mode: candidate.adaptation_mode
  };
}

const mockConversionsRoute: FastifyPluginAsync = async (app) => {
  app.post("/api/conversions/mock", async (request, reply) => {
    try {
      const payload = parseMockConversionRequest(request.body);

      return createMockConversionResponse(payload);
    } catch (error) {
      return reply.status(400).send(
        createInvalidRequest(
          error instanceof Error ? error.message : "Invalid request."
        )
      );
    }
  });
};

export default mockConversionsRoute;
