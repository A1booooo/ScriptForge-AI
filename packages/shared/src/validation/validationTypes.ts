import type { ScreenplayDocument } from "../screenplayTypes.js";

export type ValidationSource = "parse" | "schema" | "consistency";
export type ValidationSeverity = "error" | "warning";

export interface ValidationIssue {
  source: ValidationSource;
  code: string;
  severity: ValidationSeverity;
  message: string;
  path: string;
}

export interface ValidationSummary {
  total: number;
  errorCount: number;
  warningCount: number;
}

export type ParseScreenplayYamlResult =
  | {
    ok: true;
    data: unknown;
    issues: ValidationIssue[];
    summary: ValidationSummary;
  }
  | {
    ok: false;
    issues: ValidationIssue[];
    summary: ValidationSummary;
  };

export type ScreenplayValidationResult =
  | {
    ok: true;
    document: ScreenplayDocument;
    issues: ValidationIssue[];
    summary: ValidationSummary;
  }
  | {
    ok: false;
    issues: ValidationIssue[];
    summary: ValidationSummary;
  };
