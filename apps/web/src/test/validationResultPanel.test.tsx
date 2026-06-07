import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ValidationResultPanel } from "../components/ValidationResultPanel";
import { sampleScreenplay, type ScreenplayValidationResult } from "@scriptforge/shared";

describe("ValidationResultPanel", () => {
  test("renders issues grouped by source, including the other/unknown group", () => {
    const mockValidationResult: ScreenplayValidationResult = {
      ok: false,
      summary: {
        total: 4,
        errorCount: 3,
        warningCount: 1,
      },
      issues: [
        {
          source: "parse",
          code: "yaml_parse_error",
          severity: "error",
          message: "YAML is not well formed.",
          path: "$",
        },
        {
          source: "schema",
          code: "schema_required",
          severity: "error",
          message: "Missing metadata field.",
          path: "/metadata",
        },
        {
          source: "consistency",
          code: "character_not_found",
          severity: "warning",
          message: "Character in scene dialogue does not exist in characters list.",
          path: "/scenes/0/dialogue/0",
        },
        {
          source: "future_validator" as any,
          code: "unknown_weird_code",
          severity: "error",
          message: "Something from a future validator version.",
          path: "/unknown",
        },
      ],
    };

    render(<ValidationResultPanel validationResult={mockValidationResult} />);

    // Check header
    expect(screen.getByText("结构校验详情")).toBeInTheDocument();
    expect(screen.getByText("共 4 个问题")).toBeInTheDocument();
    expect(screen.getByText("3 个错误 / 1 个警告")).toBeInTheDocument();

    // Check grouped headers
    expect(screen.getByText("语法检查")).toBeInTheDocument();
    expect(screen.getByText("Schema 检查")).toBeInTheDocument();
    expect(screen.getByText("一致性检查")).toBeInTheDocument();
    expect(screen.getByText("其他问题")).toBeInTheDocument();

    // Check specific issue codes, paths, and messages
    expect(screen.getByText("yaml_parse_error")).toBeInTheDocument();
    expect(screen.getByText("路径: $")).toBeInTheDocument();
    expect(screen.getByText("YAML is not well formed.")).toBeInTheDocument();

    expect(screen.getByText("schema_required")).toBeInTheDocument();
    expect(screen.getByText("路径: /metadata")).toBeInTheDocument();
    expect(screen.getByText("Missing metadata field.")).toBeInTheDocument();

    expect(screen.getByText("character_not_found")).toBeInTheDocument();
    expect(screen.getByText("路径: /scenes/0/dialogue/0")).toBeInTheDocument();
    expect(screen.getByText("Character in scene dialogue does not exist in characters list.")).toBeInTheDocument();

    // Check other group issue
    expect(screen.getByText("unknown_weird_code")).toBeInTheDocument();
    expect(screen.getByText("路径: /unknown")).toBeInTheDocument();
    expect(screen.getByText("Something from a future validator version.")).toBeInTheDocument();
  });

  test("renders success messages when groups are empty and no issues exist", () => {
    const mockValidationResult: ScreenplayValidationResult = {
      ok: true,
      document: sampleScreenplay,
      summary: {
        total: 0,
        errorCount: 0,
        warningCount: 0,
      },
      issues: [],
    };

    render(<ValidationResultPanel validationResult={mockValidationResult} />);

    expect(screen.getByText("格式正确，无语法错误。")).toBeInTheDocument();
    expect(screen.getByText("属性字段完整，符合结构规范。")).toBeInTheDocument();
    expect(screen.getByText("角色、地点及源章节引用完整且一致。")).toBeInTheDocument();
    
    // Other group should NOT be rendered when empty
    expect(screen.queryByText("其他问题")).not.toBeInTheDocument();
  });
});
