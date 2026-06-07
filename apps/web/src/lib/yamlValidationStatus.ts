import type { ScreenplayValidationResult } from "@scriptforge/shared";

export interface YamlValidationStatus {
  isValid: boolean;
  canExport: boolean;
  errorCount: number;
  statusKind:
    | "valid"
    | "yaml_syntax_error"
    | "schema_error"
    | "consistency_error"
    | "unknown_error";
  shortMessage: string;
}

export function getYamlValidationStatus(
  validationResult: ScreenplayValidationResult
): YamlValidationStatus {
  if (validationResult.ok) {
    return {
      isValid: true,
      canExport: true,
      errorCount: 0,
      statusKind: "valid",
      shortMessage: "校验通过，可以导出"
    };
  }

  const { issues, summary } = validationResult;
  const firstIssue = issues[0];

  if (
    firstIssue?.source === "parse" &&
    firstIssue.code === "yaml_parse_error"
  ) {
    return {
      isValid: false,
      canExport: false,
      errorCount: summary.errorCount,
      statusKind: "yaml_syntax_error",
      shortMessage: "YAML 语法错误，请先修复格式"
    };
  }

  if (firstIssue?.source === "schema") {
    return {
      isValid: false,
      canExport: false,
      errorCount: summary.errorCount,
      statusKind: "schema_error",
      shortMessage: `发现 ${summary.errorCount} 个结构问题，暂不可导出`
    };
  }

  if (firstIssue?.source === "consistency") {
    return {
      isValid: false,
      canExport: false,
      errorCount: summary.errorCount,
      statusKind: "consistency_error",
      shortMessage: `发现 ${summary.errorCount} 个引用一致性问题，暂不可导出`
    };
  }

  return {
    isValid: false,
    canExport: false,
    errorCount: summary.errorCount,
    statusKind: "unknown_error",
    shortMessage: "当前校验未通过，请检查错误后重试"
  };
}
