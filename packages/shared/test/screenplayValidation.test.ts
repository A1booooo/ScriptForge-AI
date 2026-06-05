import { describe, expect, test } from "vitest";
import { sampleScreenplay } from "../src/examples/sampleScreenplay.js";
import {
  parseScreenplayYaml,
  runScreenplayConsistencyChecks,
  validateScreenplayDocument,
  validateScreenplayYaml
} from "../src/index.js";

describe("screenplay validation runtime", () => {
  test("validates the shared sample screenplay without issues", () => {
    const result = validateScreenplayDocument(sampleScreenplay);

    expect(result.ok).toBe(true);
    expect(result.document).toEqual(sampleScreenplay);
    expect(result.summary).toEqual({
      total: 0,
      errorCount: 0,
      warningCount: 0
    });
    expect(result.issues).toEqual([]);
  });

  test("stops after parse errors and does not continue schema or consistency validation", () => {
    const result = validateScreenplayYaml("metadata:\n  title: [broken");

    expect(result.ok).toBe(false);
    expect(result.summary).toEqual({
      total: 1,
      errorCount: 1,
      warningCount: 0
    });
    expect(result.document).toBeUndefined();
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]).toMatchObject({
      source: "parse",
      severity: "error",
      code: "yaml_parse_error",
      path: "$"
    });
  });

  test("normalizes schema validation issues from the shared screenplay schema", () => {
    const yamlText = `
schema_version: "1.0.0"
metadata:
  source_chapters:
    - chapter_id: chapter_01
      chapter_title: The Letter at Dawn
      chapter_order: 1
      summary: Opening setup
    - chapter_id: chapter_02
      chapter_title: Market of Rumors
      chapter_order: 2
      summary: Investigation
    - chapter_id: chapter_03
      chapter_title: Rain on the Watchtower
      chapter_order: 3
      summary: Confrontation
  genre: drama thriller
  language: zh-CN
  adaptation_mode: dramatic
  logline: A courier follows a rumor trail.
  adaptation_notes: []
characters: []
locations: []
scenes: []
quality_hints:
  coverage_notes: []
  character_consistency_notes: []
  pacing_notes: []
  revision_suggestions: []
`;

    const result = validateScreenplayYaml(yamlText);

    expect(result.ok).toBe(false);
    expect(result.document).toBeUndefined();
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "schema",
          severity: "error",
          code: "schema_required",
          path: "/metadata/title",
          message: expect.stringContaining("title")
        })
      ])
    );
  });

  test("reports consistency issues using only fields that exist in the current schema", () => {
    const result = runScreenplayConsistencyChecks({
      ...sampleScreenplay,
      characters: [
        sampleScreenplay.characters[0]!,
        {
          ...sampleScreenplay.characters[1]!,
          id: sampleScreenplay.characters[0]!.id,
          relationships: [
            {
              character_id: "char_missing",
              relation: "unknown",
              description: "Broken reference."
            }
          ]
        }
      ],
      scenes: [
        {
          ...sampleScreenplay.scenes[0]!,
          location_id: "loc_missing",
          chapter_refs: ["chapter_missing"],
          characters: ["char_missing"],
          dialogue: [
            {
              character_id: "char_missing",
              line: "Broken line",
              emotion: "tense",
              action: "Looks away."
            }
          ],
          beats: [
            {
              ...sampleScreenplay.scenes[0]!.beats[0]!,
              source_chapter_ids: ["chapter_missing"]
            }
          ]
        }
      ]
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "consistency",
          code: "duplicate_character_id",
          path: "/characters/1/id"
        }),
        expect.objectContaining({
          source: "consistency",
          code: "missing_relationship_character_reference",
          path: "/characters/1/relationships/0/character_id"
        }),
        expect.objectContaining({
          source: "consistency",
          code: "missing_location_reference",
          path: "/scenes/0/location_id"
        }),
        expect.objectContaining({
          source: "consistency",
          code: "missing_scene_character_reference",
          path: "/scenes/0/characters/0"
        }),
        expect.objectContaining({
          source: "consistency",
          code: "missing_dialogue_character_reference",
          path: "/scenes/0/dialogue/0/character_id"
        }),
        expect.objectContaining({
          source: "consistency",
          code: "missing_scene_chapter_reference",
          path: "/scenes/0/chapter_refs/0"
        }),
        expect.objectContaining({
          source: "consistency",
          code: "missing_beat_chapter_reference",
          path: "/scenes/0/beats/0/source_chapter_ids/0"
        })
      ])
    );
  });

  test("parses yaml into an unknown candidate object before validation", () => {
    const result = parseScreenplayYaml("schema_version: '1.0.0'");

    expect(result.ok).toBe(true);
    expect(result.data).toEqual({
      schema_version: "1.0.0"
    });
    expect(result.issues).toEqual([]);
  });
});
