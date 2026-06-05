import type { AdaptationMode } from "@scriptforge/shared";

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
  };
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
  screenplay: {
    metadata: {
      title: string;
    };
  };
  warnings: string[];
  mock: true;
}

export type SubmissionState = "idle" | "loading" | "error" | "success";
