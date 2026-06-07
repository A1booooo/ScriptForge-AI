import { describe, expect, test } from "vitest";
import type { ScreenplayValidationResult } from "@scriptforge/shared";

import { getYamlValidationStatus } from "../lib/yamlValidationStatus";

describe("getYamlValidationStatus", () => {
  test("returns valid status when validation passes", () => {
    const result: ScreenplayValidationResult = {
      ok: true,
      document: {} as never,
      issues: [],
      summary: {
        total: 0,
        errorCount: 0,
        warningCount: 0
      }
    };

    expect(getYamlValidationStatus(result)).toEqual({
      isValid: true,
      canExport: true,
      errorCount: 0,
      statusKind: "valid",
      shortMessage: "校验通过，可以导出"
    });
  });

  test("returns yaml_syntax_error when parse fails", () => {
    const result: ScreenplayValidationResult = {
      ok: false,
      issues: [
        {
          source: "parse",
          code: "yaml_parse_error",
          severity: "error",
          message: "YAML parse failed.",
          path: "$"
        }
      ],
      summary: {
        total: 1,
        errorCount: 1,
        warningCount: 0
      }
    };

    expect(getYamlValidationStatus(result)).toEqual({
      isValid: false,
      canExport: false,
      errorCount: 1,
      statusKind: "yaml_syntax_error",
      shortMessage: "YAML 语法错误，请先修复格式"
    });
  });

  test("returns schema_error when schema issues are present", () => {
    const result: ScreenplayValidationResult = {
      ok: false,
      issues: [
        {
          source: "schema",
          code: "schema_required",
          severity: "error",
          message: "Missing required field.",
          path: "/metadata/title"
        }
      ],
      summary: {
        total: 1,
        errorCount: 1,
        warningCount: 0
      }
    };

    expect(getYamlValidationStatus(result)).toEqual({
      isValid: false,
      canExport: false,
      errorCount: 1,
      statusKind: "schema_error",
      shortMessage: "发现 1 个结构问题，暂不可导出"
    });
  });

  test("returns consistency_error when consistency issues are present", () => {
    const result: ScreenplayValidationResult = {
      ok: false,
      issues: [
        {
          source: "consistency",
          code: "missing_location_reference",
          severity: "error",
          message: "Unknown location.",
          path: "/scenes/0/location_id"
        }
      ],
      summary: {
        total: 1,
        errorCount: 1,
        warningCount: 0
      }
    };

    expect(getYamlValidationStatus(result)).toEqual({
      isValid: false,
      canExport: false,
      errorCount: 1,
      statusKind: "consistency_error",
      shortMessage: "发现 1 个引用一致性问题，暂不可导出"
    });
  });

  test("returns unknown_error when the issue source is not recognized", () => {
    const result: ScreenplayValidationResult = {
      ok: false,
      issues: [
        {
          source: "parse",
          code: "unexpected_runtime_error",
          severity: "error",
          message: "Unexpected validation failure.",
          path: "$"
        }
      ],
      summary: {
        total: 2,
        errorCount: 2,
        warningCount: 0
      }
    };

    expect(getYamlValidationStatus(result)).toEqual({
      isValid: false,
      canExport: false,
      errorCount: 2,
      statusKind: "unknown_error",
      shortMessage: "当前校验未通过，请检查错误后重试"
    });
  });
});
