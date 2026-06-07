export const LLM_PROVIDERS = ["openai_compatible"] as const;

export type LlmProvider = (typeof LLM_PROVIDERS)[number];

export interface LlmConfig {
  provider: LlmProvider;
  model: string;
  apiKey?: string;
  baseUrl: string;
  timeoutMs: number;
}

export interface LlmDraftRequest {
  prompt: string;
  systemPrompt?: string;
}

export interface LlmDraftResult {
  provider: LlmProvider;
  model: string;
  draftText: string;
  finishReason?: string;
}

export interface LlmErrorMetadata {
  status?: number;
  details?: string[];
}
