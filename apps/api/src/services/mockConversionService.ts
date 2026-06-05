import { sampleScreenplay, type ScreenplayDocument } from "@scriptforge/shared";

import type {
  MockConversionRequest,
  MockConversionResponse
} from "../types.js";

function createChapterSummary(content: string): string {
  const normalized = content.trim().replace(/\s+/g, " ");

  if (normalized.length <= 120) {
    return normalized;
  }

  return `${normalized.slice(0, 117)}...`;
}

function createScreenplayFromRequest(
  request: MockConversionRequest
): ScreenplayDocument {
  return {
    ...sampleScreenplay,
    metadata: {
      ...sampleScreenplay.metadata,
      title: request.title,
      adaptation_mode: request.adaptation_mode,
      source_chapters: request.chapters.map((chapter, index) => ({
        chapter_id: chapter.id,
        chapter_title: chapter.title,
        chapter_order: index + 1,
        summary: createChapterSummary(chapter.content)
      }))
    }
  };
}

export function createMockConversionResponse(
  request: MockConversionRequest
): MockConversionResponse {
  return {
    conversion_id: `mock-${Date.now()}`,
    status: "completed",
    mode: request.adaptation_mode,
    input_summary: {
      title: request.title,
      chapter_count: request.chapters.length,
      chapter_ids: request.chapters.map((chapter) => chapter.id)
    },
    screenplay: createScreenplayFromRequest(request),
    warnings: [
      "Mock response only. No real LLM conversion was performed.",
      "Screenplay content is demo data derived from the shared sample screenplay contract."
    ],
    mock: true
  };
}
