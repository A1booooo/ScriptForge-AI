import type { ValidationIssue } from "@scriptforge/shared";

const MAX_VALIDATION_DETAILS = 3;

function toFieldPath(path: string): string {
  const normalized = path.replace(/^\//, "");

  if (normalized.length === 0) {
    return "root";
  }

  return normalized.replace(/\/(\d+)/g, "[$1]").replace(/\//g, ".");
}

function summarizeSchemaIssue(issue: ValidationIssue): string {
  switch (issue.code) {
    case "schema_required":
      return `missing required field: ${toFieldPath(issue.path)}`;
    case "schema_additional_properties":
      return `unexpected field: ${toFieldPath(issue.path)}`;
    case "schema_const":
      return `invalid constant value at: ${toFieldPath(issue.path)}`;
    case "schema_enum":
      return `invalid enum value at: ${toFieldPath(issue.path)}`;
    case "schema_type":
      return `invalid field type at: ${toFieldPath(issue.path)}`;
    default:
      return `schema issue at: ${toFieldPath(issue.path)}`;
  }
}

function summarizeConsistencyIssue(issue: ValidationIssue): string {
  const path = toFieldPath(issue.path);

  switch (issue.code) {
    case "missing_location_reference":
      return `scene location_id references unknown location: ${path}`;
    case "missing_scene_chapter_reference":
      return `scene chapter_refs references unknown source chapter: ${path}`;
    case "missing_scene_character_reference":
      return `scene characters references unknown character: ${path}`;
    case "missing_dialogue_character_reference":
      return `dialogue character_id references unknown character: ${path}`;
    case "missing_beat_chapter_reference":
      return `beat source_chapter_ids references unknown source chapter: ${path}`;
    case "missing_relationship_character_reference":
      return `character relationship references unknown character: ${path}`;
    case "duplicate_character_id":
    case "duplicate_location_id":
    case "duplicate_scene_id":
    case "duplicate_source_chapter_id":
      return `duplicate identifier found: ${path}`;
    default:
      return `consistency issue at: ${path}`;
  }
}

export function summarizeValidationIssues(
  issues: ValidationIssue[],
  maxDetails = MAX_VALIDATION_DETAILS
): string[] {
  return issues.slice(0, maxDetails).map((issue) => {
    if (issue.source === "schema") {
      return summarizeSchemaIssue(issue);
    }

    if (issue.source === "consistency") {
      return summarizeConsistencyIssue(issue);
    }

    return `validation issue at: ${toFieldPath(issue.path)}`;
  });
}

export { MAX_VALIDATION_DETAILS };
