import type {
  AdaptationMode,
  ScreenplayDocument
} from "@scriptforge/shared";

export interface MockConversionChapterInput {
  id: string;
  title: string;
  content: string;
}

export interface MockConversionRequest {
  title: string;
  chapters: MockConversionChapterInput[];
  adaptation_mode: AdaptationMode;
}

export interface MockConversionResponse {
  conversion_id: string;
  status: "completed";
  mode: AdaptationMode;
  input_summary: {
    title: string;
    chapter_count: number;
    chapter_ids: string[];
  };
  screenplay: ScreenplayDocument;
  warnings: string[];
  mock: true;
}

export interface ApiErrorResponse {
  error: {
    code: "INVALID_REQUEST";
    message: string;
  };
}
