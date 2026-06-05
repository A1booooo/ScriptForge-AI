import { Ajv2020 } from "ajv/dist/2020.js";
import type { ErrorObject } from "ajv";

import { screenplayDocumentSchema } from "../screenplaySchema.js";
import type { ScreenplayDocument } from "../screenplayTypes.js";
import { summarizeIssues } from "./summary.js";
import type {
  ScreenplayValidationResult,
  ValidationIssue
} from "./validationTypes.js";

const ajv = new Ajv2020({
  allErrors: true,
  strict: false
});

const validateScreenplaySchema = ajv.compile<ScreenplayDocument>(
  screenplayDocumentSchema as object
);

function getSchemaIssueCode(error: ErrorObject): string {
  switch (error.keyword) {
    case "required":
      return "schema_required";
    case "type":
      return "schema_type";
    case "enum":
      return "schema_enum";
    case "const":
      return "schema_const";
    case "minItems":
      return "schema_min_items";
    case "minLength":
      return "schema_min_length";
    case "additionalProperties":
      return "schema_additional_properties";
    case "pattern":
      return "schema_pattern";
    default:
      return `schema_${error.keyword}`;
  }
}

function getSchemaIssuePath(error: ErrorObject): string {
  const instancePath = error.instancePath || "$";

  if (
    error.keyword === "required" &&
    typeof error.params === "object" &&
    error.params !== null &&
    "missingProperty" in error.params &&
    typeof error.params.missingProperty === "string"
  ) {
    if (instancePath === "$") {
      return `/${error.params.missingProperty}`;
    }

    return `${instancePath}/${error.params.missingProperty}`;
  }

  return instancePath;
}

function normalizeSchemaIssues(errors: ErrorObject[] | null | undefined): ValidationIssue[] {
  return (errors ?? []).map((error) => ({
    source: "schema",
    code: getSchemaIssueCode(error),
    severity: "error",
    message: error.message ?? "Schema validation failed.",
    path: getSchemaIssuePath(error)
  }));
}

export function validateScreenplayDocument(
  candidate: unknown
): ScreenplayValidationResult {
  const schemaIsValid = validateScreenplaySchema(candidate);

  if (!schemaIsValid) {
    const issues = normalizeSchemaIssues(validateScreenplaySchema.errors);

    return {
      ok: false,
      issues,
      summary: summarizeIssues(issues)
    };
  }

  return {
    ok: true,
    document: candidate as ScreenplayDocument,
    issues: [],
    summary: summarizeIssues([])
  };
}
