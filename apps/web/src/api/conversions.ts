import type {
  ApiErrorResponse,
  ConversionFormValues,
  ConversionResponse
} from "../types";

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as ApiErrorResponse;
  return typeof candidate.error?.message === "string";
}

async function extractApiErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as unknown;

    if (isApiErrorResponse(payload)) {
      return payload.error!.message!;
    }
  } catch {
    // Ignore JSON parsing issues and fall back to a generic error message.
  }

  return "提交失败，请检查章节内容或稍后重试";
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
    throw new Error(await extractApiErrorMessage(response));
  }

  return (await response.json()) as ConversionResponse;
}
