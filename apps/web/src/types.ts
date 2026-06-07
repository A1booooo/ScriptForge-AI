import type {
  AdaptationMode,
  ScreenplayDocument
} from "@scriptforge/shared";

export interface ChapterFormValue {
  id: string;
  title: string;
  content: string;
}

export interface ConversionFormValues {
  title: string;
  adaptation_mode: AdaptationMode;
  chapters: ChapterFormValue[];
}

export interface ApiErrorResponse {
  error?: {
    code?: string;
    message?: string;
    details?: string[];
  };
}

export interface SubmissionErrorState {
  code?: string;
  message: string;
  details?: string[];
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

export type SubmissionState = "idle" | "loading" | "error" | "success";
