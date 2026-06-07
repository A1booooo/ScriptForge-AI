import {
  runScreenplayConsistencyChecks,
  validateScreenplayDocument
} from "@scriptforge/shared";

import { createLlmClient } from "../llm/factory.js";
import { LlmClientError } from "../llm/errors.js";
import type { LlmClient } from "../llm/client.js";
import { generateLlmConversionDraft } from "./llmConversionService.js";
import type {
  MockConversionRequest,
  RealConversionResponse
} from "../types.js";

interface CreateRealConversionResponseDependencies {
  createLlmClient?: typeof createLlmClient;
  llmClient?: LlmClient;
}

function createInputSummary(request: MockConversionRequest) {
  return {
    title: request.title,
    chapter_count: request.chapters.length,
    chapter_ids: request.chapters.map((chapter) => chapter.id)
  };
}

function stripMarkdownFence(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function extractFirstJsonObject(text: string): string {
  const normalized = stripMarkdownFence(text);
  const firstBraceIndex = normalized.indexOf("{");

  if (firstBraceIndex === -1) {
    throw new LlmClientError(
      "provider_response_invalid",
      "Provider response did not contain a JSON object."
    );
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = firstBraceIndex; index < normalized.length; index += 1) {
    const character = normalized[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (character === "\\") {
      escaped = true;
      continue;
    }

    if (character === "\"") {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (character === "{") {
      depth += 1;
    }

    if (character === "}") {
      depth -= 1;

      if (depth === 0) {
        return normalized.slice(firstBraceIndex, index + 1);
      }
    }
  }

  throw new LlmClientError(
    "provider_response_invalid",
    "Provider response did not contain a complete JSON object."
  );
}

function parseDraftAsJson(draftText: string): unknown {
  try {
    return JSON.parse(extractFirstJsonObject(draftText));
  } catch (error) {
    if (error instanceof LlmClientError) {
      throw error;
    }

    throw new LlmClientError(
      "provider_response_invalid",
      "Provider response was not valid JSON."
    );
  }
}

function validateDraftCandidate(candidate: unknown) {
  const schemaValidated = validateScreenplayDocument(candidate);

  if (!schemaValidated.ok) {
    throw new LlmClientError(
      "schema_validation_failed",
      "Provider response did not satisfy the screenplay schema."
    );
  }

  const consistencyValidated = runScreenplayConsistencyChecks(
    schemaValidated.document
  );

  if (!consistencyValidated.ok) {
    const firstIssue = consistencyValidated.issues[0];

    throw new LlmClientError(
      "schema_validation_failed",
      firstIssue?.message ?? "Provider response failed consistency checks."
    );
  }

  return consistencyValidated.document;
}

function toRealConversionResponse(
  request: MockConversionRequest,
  screenplay: RealConversionResponse["screenplay"]
): RealConversionResponse {
  return {
    conversion_id: `real-${Date.now()}`,
    status: "completed",
    mode: request.adaptation_mode,
    source: "real_llm",
    input_summary: createInputSummary(request),
    screenplay,
    warnings: [],
    mock: false
  };
}

export async function createRealConversionResponse(
  request: MockConversionRequest,
  dependencies: CreateRealConversionResponseDependencies = {}
): Promise<RealConversionResponse> {
  const llmClient =
    dependencies.llmClient ??
    (dependencies.createLlmClient ?? createLlmClient)();

  const draft = await generateLlmConversionDraft(
    {
      title: request.title,
      adaptationMode: request.adaptation_mode,
      chapters: request.chapters
    },
    { llmClient }
  );

  const parsedCandidate = parseDraftAsJson(draft.draftText);
  const screenplay = validateDraftCandidate(parsedCandidate);

  return toRealConversionResponse(request, screenplay);
}
