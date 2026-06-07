import { ADAPTATION_MODES } from "@scriptforge/shared";

import type {
  ApiErrorResponse,
  MockConversionChapterInput,
  MockConversionRequest
} from "../types.js";

export function createApiError(
  code: ApiErrorResponse["error"]["code"],
  message: string
): ApiErrorResponse {
  return {
    error: {
      code,
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

export function parseConversionRequest(body: unknown): MockConversionRequest {
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
