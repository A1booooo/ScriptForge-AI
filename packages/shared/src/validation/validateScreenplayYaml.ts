import { runScreenplayConsistencyChecks } from "./consistencyChecks.js";
import { parseScreenplayYaml } from "./parseScreenplayYaml.js";
import { validateScreenplayDocument } from "./schemaValidator.js";
import type { ScreenplayValidationResult } from "./validationTypes.js";

export function validateScreenplayYaml(
  yamlText: string
): ScreenplayValidationResult {
  const parsed = parseScreenplayYaml(yamlText);

  if (!parsed.ok) {
    return {
      ok: false,
      issues: parsed.issues,
      summary: parsed.summary
    };
  }

  const schemaValidated = validateScreenplayDocument(parsed.data);

  if (!schemaValidated.ok) {
    return schemaValidated;
  }

  return runScreenplayConsistencyChecks(schemaValidated.document);
}
