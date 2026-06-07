import type {
  ApiErrorResponse,
  ConversionFormValues,
  ConversionResponse
} from "../types";

export class ApiRequestError extends Error {
  readonly code: string | undefined;
  readonly details: string[] | undefined;

  constructor(message: string, options: { code?: string; details?: string[] } = {}) {
    super(message);
    this.name = "ApiRequestError";
    this.code = options.code;
    this.details = options.details;
  }
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as ApiErrorResponse;
  return typeof candidate.error?.message === "string";
}

async function extractApiError(response: Response): Promise<ApiRequestError> {
  try {
    const payload = (await response.json()) as unknown;

    if (isApiErrorResponse(payload)) {
      return new ApiRequestError(payload.error!.message!, {
        ...(payload.error?.code ? { code: payload.error.code } : {}),
        ...(payload.error?.details ? { details: payload.error.details } : {})
      });
    }
  } catch {
    // Ignore JSON parsing issues and fall back to a generic error message.
  }

  return new ApiRequestError("鎻愪氦澶辫触锛岃妫€鏌ョ珷鑺傚唴瀹规垨绋嶅悗閲嶈瘯");
}

export async function submitRealConversion(
  payload: ConversionFormValues
): Promise<ConversionResponse> {
  const response = await fetch("/api/conversions/real", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw await extractApiError(response);
  }

  return (await response.json()) as ConversionResponse;
}
