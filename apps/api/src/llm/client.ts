import type { LlmDraftRequest, LlmDraftResult } from "./types.js";

export interface LlmClient {
  generateDraft(input: LlmDraftRequest): Promise<LlmDraftResult>;
}
