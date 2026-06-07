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

export interface ConversionResponse {
  conversion_id: string;
  status: "completed";
  mode: AdaptationMode;
  source: "mock" | "real_llm";
  input_summary: {
    title: string;
    chapter_count: number;
    chapter_ids: string[];
  };
  screenplay: ScreenplayDocument;
  warnings: string[];
  mock: boolean;
}

export type MockConversionResponse = ConversionResponse & {
  source: "mock";
  mock: true;
};

export type RealConversionResponse = ConversionResponse & {
  source: "real_llm";
  mock: false;
};

export interface ApiErrorResponse {
  error: {
    code:
      | "INVALID_REQUEST"
      | "missing_api_key"
      | "invalid_provider"
      | "request_failed"
      | "timeout"
      | "rate_limited"
      | "provider_response_invalid"
      | "schema_validation_failed";
    message: string;
    details?: string[];
  };
}
