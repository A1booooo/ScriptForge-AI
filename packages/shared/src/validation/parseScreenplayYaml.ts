import { parse } from "yaml";

import { summarizeIssues } from "./summary.js";
import type { ParseScreenplayYamlResult } from "./validationTypes.js";

export function parseScreenplayYaml(
  yamlText: string
): ParseScreenplayYamlResult {
  try {
    const data = parse(yamlText) as unknown;

    return {
      ok: true,
      data,
      issues: [],
      summary: summarizeIssues([])
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to parse YAML.";
    const issues = [
      {
        source: "parse" as const,
        code: "yaml_parse_error",
        severity: "error" as const,
        message,
        path: "$"
      }
    ];

    return {
      ok: false,
      issues,
      summary: summarizeIssues(issues)
    };
  }
}
