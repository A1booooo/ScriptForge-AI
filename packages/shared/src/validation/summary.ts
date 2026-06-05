import type {
  ValidationIssue,
  ValidationSummary
} from "./validationTypes.js";

export function summarizeIssues(issues: ValidationIssue[]): ValidationSummary {
  return {
    total: issues.length,
    errorCount: issues.filter((issue) => issue.severity === "error").length,
    warningCount: issues.filter((issue) => issue.severity === "warning").length
  };
}
