# Screenplay YAML Schema

This document defines the screenplay contract used by ScriptForge AI drafts. T02 established the shared structure contract, and T07 adds a shared runtime YAML parser, JSON Schema validator, and consistency checks in `packages/shared`. The document still does not add a frontend validator UI or a new API endpoint by itself.

## Purpose

The screenplay YAML contract exists to make AI-generated drafts:

- traceable back to source novel chapters
- structured enough for schema validation
- editable by authors without losing machine-readable shape
- ready for future consistency checks across scenes, characters, and locations

## Top-Level Document

The root document is `ScreenplayDocument`.

```yaml
schema_version: "1.0.0"
metadata:
  title: "Lanterns Over River Street"
  source_chapters:
    - chapter_id: chapter_01
      chapter_title: The Letter at Dawn
      chapter_order: 1
      summary: Lin Xia discovers a letter that may prove her brother is alive.
  genre: drama thriller
  language: zh-CN
  adaptation_mode: dramatic
  logline: A courier follows a rumor trail to uncover a political cover-up.
  adaptation_notes:
    - Travel beats are compressed for stronger scene momentum.
characters:
  - id: char_lin_xia
    name: Lin Xia
    role: protagonist
    description: A stubborn courier with unresolved grief.
    motivation: Find her missing brother.
    speech_style: Direct and emotionally restrained.
    relationships:
      - character_id: char_captain_zhou
        relation: adversarial ally
        description: Distrusts him but believes he knows the truth.
locations:
  - id: loc_river_market
    name: River Street Market
    description: A crowded covered market near the river.
    atmosphere: Wet, noisy, and tense.
scenes:
  - id: scene_market_reveal
    title: Rumors Under Lantern Light
    chapter_refs:
      - chapter_01
      - chapter_02
    location_id: loc_river_market
    time_of_day: evening
    characters:
      - char_lin_xia
      - char_captain_zhou
    summary: Lin Xia corners the captain in the market.
    conflict: She needs the truth while he needs control.
    beats:
      - id: beat_market_probe
        summary: Lin Xia challenges the official story.
        purpose: Surface the transfer cover-up.
        source_chapter_ids:
          - chapter_01
          - chapter_02
    dialogue:
      - character_id: char_lin_xia
        line: You sealed the road record after midnight.
        emotion: controlled anger
        action: She drops the wet ledger scrap on the table.
    stage_directions:
      - id: dir_market_noise
        instruction: Rain and vendor calls cover the short silences.
    adaptation_notes:
      - Merged several rumor beats into one confrontation.
quality_hints:
  coverage_notes:
    - All source chapters are represented.
  character_consistency_notes:
    - Keep Lin Xia action-first in later rewrites.
  pacing_notes:
    - The current draft intentionally moves quickly into confrontation.
  revision_suggestions:
    - Add a supporting witness only if public pressure is needed.
```

## Field Design Rationale

### `schema_version`

This field provides an explicit version marker for the contract itself. Future tasks may evolve the schema, so the document needs a stable way to distinguish contract revisions without guessing from field presence.

### `metadata`

`metadata` carries document-wide adaptation context:

- `title` identifies the screenplay draft.
- `source_chapters` records the upstream novel chapter set with stable `chapter_id` values, chapter order, and short summaries.
- `genre`, `language`, and `adaptation_mode` guide future prompts, validation rules, and UX defaults.
- `logline` provides a compressed dramatic intent summary.
- `adaptation_notes` keeps high-level adaptation choices visible to both humans and future tooling.

`adaptation_mode` is constrained to:

- `faithful`
- `dramatic`
- `short_drama`

These values are intentionally limited in T02 so later tasks can branch behavior predictably without parsing free-form mode names.

### `characters`

Characters are modeled as reusable entities instead of inline scene-only labels. Each character has a stable `id` so scenes and dialogue can reference the same entity consistently.

Key design choices:

- `id` supports future consistency checks and cross-linking.
- `speech_style` gives later AI steps a compact behavioral hint for dialogue generation.
- `relationships` uses `character_id` references rather than names, leaving room for future graph-style checks and rename-safe editing.

### `locations`

Locations are normalized into a top-level collection because multiple scenes may reuse the same setting. `location_id` references avoid duplication and create a future anchor for timeline, board, or export features.

### `scenes`

Scenes are the center of the screenplay contract. The chosen shape is designed to balance editability with validation:

- `chapter_refs` preserves traceability to source chapters.
- `location_id` and `characters` are reference-based to support future consistency checks.
- `summary` and `conflict` capture the dramatic purpose of the scene.
- `beats` break a scene into smaller adaptation units and retain chapter provenance through `source_chapter_ids`.
- `dialogue` is structured by `character_id`, `line`, `emotion`, and `action` so later steps can validate speaker references and preserve performance intent.
- `stage_directions` remains separate from dialogue to avoid mixing narrative blocking with spoken lines.
- `adaptation_notes` keeps scene-level compression, omission, or expansion decisions explicit.

### `quality_hints`

`quality_hints` is intentionally advisory rather than authoritative. It stores structured drafting guidance for future review surfaces without pretending the screenplay is already fully validated.

The current fields focus on likely review dimensions:

- `coverage_notes`
- `character_consistency_notes`
- `pacing_notes`
- `revision_suggestions`

## Cross-Reference Rules

T07 now enforces these checks in the shared runtime, using only fields that already exist in the current schema:

- every `id` should be a machine-readable identifier, such as `char_lin_xia`
- every `scene.location_id` should match one `locations[].id`
- every `scene.characters[]` and `dialogue[].character_id` should match one `characters[].id`
- every `scene.chapter_refs[]` and `beats[].source_chapter_ids[]` should match one `metadata.source_chapters[].chapter_id`

The shared package now enforces these fields without redesigning the document shape.

## Current Implementation

The current shared implementation includes:

- TypeScript types for `ScreenplayDocument`
- the reusable `screenplayDocumentSchema` JSON Schema constant
- the `sampleScreenplay` example object
- `parseScreenplayYaml(yamlText)` for parsing YAML into an unknown candidate object
- `validateScreenplayDocument(candidate)` for JSON Schema validation using the shared schema
- `runScreenplayConsistencyChecks(document)` for reference and duplicate-id consistency checks
- `validateScreenplayYaml(yamlText)` for parse -> schema -> consistency aggregation with normalized `ValidationIssue[]`

The current implementation intentionally does not add:

- a new public API endpoint
- automatic wiring of the validator into the existing frontend main flow
- YAML editing or export
