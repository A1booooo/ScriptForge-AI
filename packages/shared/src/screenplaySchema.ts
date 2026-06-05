import { ADAPTATION_MODES, SCREENPLAY_SCHEMA_VERSION } from "./screenplayTypes.js";

export interface JsonSchema {
  $schema?: string;
  $id?: string;
  title?: string;
  description?: string;
  type?: "object" | "array" | "string" | "number" | "integer" | "boolean" | "null";
  const?: string | number | boolean | null;
  enum?: readonly (string | number | boolean | null)[];
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  required?: string[];
  additionalProperties?: boolean;
  minItems?: number;
  minLength?: number;
  pattern?: string;
}

const identifierSchema = {
  type: "string",
  minLength: 1,
  pattern: "^[a-z][a-z0-9_-]*$",
  description:
    "Machine-readable identifier for cross references such as character, location, and scene links."
} satisfies JsonSchema;

const stringListSchema = {
  type: "array",
  items: {
    type: "string",
    minLength: 1
  }
} satisfies JsonSchema;

export const screenplayDocumentSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://scriptforge.ai/schema/screenplay-document.schema.json",
  title: "ScreenplayDocument",
  description:
    "Contract for YAML screenplay drafts generated from multi-chapter novel text.",
  type: "object",
  additionalProperties: false,
  required: [
    "schema_version",
    "metadata",
    "characters",
    "locations",
    "scenes",
    "quality_hints"
  ],
  properties: {
    schema_version: {
      type: "string",
      const: SCREENPLAY_SCHEMA_VERSION,
      description: "Versioned contract marker for future schema evolution."
    },
    metadata: {
      type: "object",
      additionalProperties: false,
      required: [
        "title",
        "source_chapters",
        "genre",
        "language",
        "adaptation_mode",
        "logline",
        "adaptation_notes"
      ],
      properties: {
        title: {
          type: "string",
          minLength: 1
        },
        source_chapters: {
          type: "array",
          minItems: 3,
          items: {
            type: "object",
            additionalProperties: false,
            required: [
              "chapter_id",
              "chapter_title",
              "chapter_order",
              "summary"
            ],
            properties: {
              chapter_id: identifierSchema,
              chapter_title: {
                type: "string",
                minLength: 1
              },
              chapter_order: {
                type: "integer"
              },
              summary: {
                type: "string",
                minLength: 1
              }
            }
          }
        },
        genre: {
          type: "string",
          minLength: 1
        },
        language: {
          type: "string",
          minLength: 2
        },
        adaptation_mode: {
          type: "string",
          enum: ADAPTATION_MODES
        },
        logline: {
          type: "string",
          minLength: 1
        },
        adaptation_notes: stringListSchema
      }
    },
    characters: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "name",
          "role",
          "description",
          "motivation",
          "speech_style",
          "relationships"
        ],
        properties: {
          id: identifierSchema,
          name: {
            type: "string",
            minLength: 1
          },
          role: {
            type: "string",
            minLength: 1
          },
          description: {
            type: "string",
            minLength: 1
          },
          motivation: {
            type: "string",
            minLength: 1
          },
          speech_style: {
            type: "string",
            minLength: 1
          },
          relationships: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: [
                "character_id",
                "relation",
                "description"
              ],
              properties: {
                character_id: identifierSchema,
                relation: {
                  type: "string",
                  minLength: 1
                },
                description: {
                  type: "string",
                  minLength: 1
                }
              }
            }
          }
        }
      }
    },
    locations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "name",
          "description",
          "atmosphere"
        ],
        properties: {
          id: identifierSchema,
          name: {
            type: "string",
            minLength: 1
          },
          description: {
            type: "string",
            minLength: 1
          },
          atmosphere: {
            type: "string",
            minLength: 1
          }
        }
      }
    },
    scenes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "title",
          "chapter_refs",
          "location_id",
          "time_of_day",
          "characters",
          "summary",
          "conflict",
          "beats",
          "dialogue",
          "stage_directions",
          "adaptation_notes"
        ],
        properties: {
          id: identifierSchema,
          title: {
            type: "string",
            minLength: 1
          },
          chapter_refs: {
            type: "array",
            minItems: 1,
            items: identifierSchema
          },
          location_id: identifierSchema,
          time_of_day: {
            type: "string",
            minLength: 1
          },
          characters: {
            type: "array",
            minItems: 1,
            items: identifierSchema
          },
          summary: {
            type: "string",
            minLength: 1
          },
          conflict: {
            type: "string",
            minLength: 1
          },
          beats: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: [
                "id",
                "summary",
                "purpose",
                "source_chapter_ids"
              ],
              properties: {
                id: identifierSchema,
                summary: {
                  type: "string",
                  minLength: 1
                },
                purpose: {
                  type: "string",
                  minLength: 1
                },
                source_chapter_ids: {
                  type: "array",
                  minItems: 1,
                  items: identifierSchema
                }
              }
            }
          },
          dialogue: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: [
                "character_id",
                "line",
                "emotion",
                "action"
              ],
              properties: {
                character_id: identifierSchema,
                line: {
                  type: "string",
                  minLength: 1
                },
                emotion: {
                  type: "string",
                  minLength: 1
                },
                action: {
                  type: "string",
                  minLength: 1
                }
              }
            }
          },
          stage_directions: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: [
                "id",
                "instruction"
              ],
              properties: {
                id: identifierSchema,
                instruction: {
                  type: "string",
                  minLength: 1
                }
              }
            }
          },
          adaptation_notes: stringListSchema
        }
      }
    },
    quality_hints: {
      type: "object",
      additionalProperties: false,
      required: [
        "coverage_notes",
        "character_consistency_notes",
        "pacing_notes",
        "revision_suggestions"
      ],
      properties: {
        coverage_notes: stringListSchema,
        character_consistency_notes: stringListSchema,
        pacing_notes: stringListSchema,
        revision_suggestions: stringListSchema
      }
    }
  }
} satisfies JsonSchema;
