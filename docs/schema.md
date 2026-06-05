# Screenplay YAML Schema

This document is a placeholder for D01, where the screenplay YAML Schema will be fully defined and explained.

## Purpose

The Schema will define the structure of AI-generated screenplay drafts so that outputs can be parsed, validated, edited, and exported safely. It will also explain why each major field exists and how the structure supports novel-to-screenplay adaptation.

## Planned Top-Level Structure

The planned top-level screenplay YAML structure is:

```yaml
meta:
  title: string
  source_type: novel
  language: zh-CN
  version: string
source:
  chapters:
    - id: string
      title: string
      summary: string
screenplay:
  logline: string
  acts:
    - id: string
      title: string
      scenes:
        - id: string
          title: string
          source_chapter_ids:
            - string
          location: string
          time: string
          characters:
            - string
          action:
            - string
          dialogue:
            - character: string
              line: string
          transitions:
            - string
characters:
  - id: string
    name: string
    role: string
    motivation: string
    arc: string
validation:
  schema_version: string
  warnings:
    - string
adaptation_report:
  summary: string
  changes:
    - string
```

## Design Notes Placeholder

The full design document will explain:

- Why YAML is used as an editable intermediate format.
- How scene, character, dialogue, and adaptation report sections support author review.
- How schema validation prevents malformed LLM output from entering the final workflow.
- How top-level fields map back to source chapters for traceability.

## Current Status

T01 only creates this placeholder. The actual Schema, examples, and validation rules will be implemented in later tasks.
