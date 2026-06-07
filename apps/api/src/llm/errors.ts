import type { LlmErrorMetadata } from "./types.js";

export type LlmErrorCode =
  | "missing_api_key"
  | "invalid_provider"
  | "request_failed"
  | "rate_limited"
  | "provider_response_invalid"
  | "schema_validation_failed"
  | "timeout";

export class LlmClientError extends Error {
  readonly code: LlmErrorCode;
  readonly status: number | undefined;

  constructor(
    code: LlmErrorCode,
    message: string,
    metadata: LlmErrorMetadata = {}
  ) {
    super(message);
    this.name = "LlmClientError";
    this.code = code;
    this.status = metadata.status;
  }
}
