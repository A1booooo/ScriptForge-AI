# TASKS.md

This file tracks the 72-hour delivery route for ScriptForge AI.

## Delivery Principles

- 每个任务独立成 PR。
- 每个 PR 只做一件事。
- main 分支始终保持可运行。
- 先建立契约，再实现功能。
- 先跑通主链路，再补创新能力和 Demo 表达。

## 72-Hour Route

### Foundation

- T01: docs: establish project foundation and delivery plan
- T02: schema: define YAML Schema and TypeScript types
- C01: chore: add CI and verification scripts

### MVP Main Flow

- T03: api: add mock conversion API
- T04: frontend: add chapter input workbench
- T05: frontend: display YAML and validation result
- T06: ai: add LLM client
- T07: validation: add YAML parser, validator, and consistency checks
- T09: export: add YAML editing and export
- T13: demo: add demo fixtures and one-click sample

### Authoring Intelligence

- T08: product: add Scene Board and Character Bible
- T10: analysis: add Chapter Analyzer and adaptation summary
- T11: quality: add Adaptation Quality Score
- T12: rewrite: add Rewrite Modes and improvement suggestions

### Documentation and Demo

- D01: docs: write YAML Schema design document
- D02: docs: update README, architecture, and demo guide

## Task Details

### T01: docs: establish project foundation and delivery plan

Create project governance and documentation foundation only. No frontend, backend, dependency, business logic, test framework, or CI implementation.

### T02: schema: define YAML Schema and TypeScript types

Define the screenplay YAML Schema and matching TypeScript types. Include validation-oriented examples and keep schema docs aligned.

### T03: api: add mock conversion API

Create a mock conversion boundary that returns clearly marked Demo data. No real LLM call in this task.

### T04: frontend: add chapter input workbench

Create the UI surface for entering at least 3 novel chapters and submitting them to the conversion flow.

### T05: frontend: display YAML and validation result

Display generated YAML and schema validation feedback in the workbench.

### T06: ai: add LLM client

Introduce the LLM client boundary and configuration. Keep API calls isolated and mockable.

### T07: validation: add YAML parser, validator, and consistency checks

Parse generated YAML, validate it against schema, and run consistency checks for scenes, characters, and chapter references.

### T08: product: add Scene Board and Character Bible

Present scene-level structure and character information extracted from the screenplay YAML.

### T09: export: add YAML editing and export

Allow users to edit generated YAML and export YAML artifacts.

### T10: analysis: add Chapter Analyzer and adaptation summary

Analyze source chapters and summarize adaptation choices, missing conflicts, and scene opportunities.

### T11: quality: add Adaptation Quality Score

Score the adaptation draft using explainable dimensions such as structure, character coverage, conflict clarity, and schema completeness.

### T12: rewrite: add Rewrite Modes and improvement suggestions

Offer targeted rewrite suggestions, such as dialogue enhancement, pacing adjustment, and scene compression.

### T13: demo: add demo fixtures and one-click sample

Add clearly marked Demo fixtures and a one-click sample path for the final presentation.

### D01: docs: write YAML Schema design document

Document the YAML Schema, field rationale, validation strategy, and design tradeoffs.

### D02: docs: update README, architecture, and demo guide

Align README, architecture notes, and demo guide with the final implemented behavior.

### C01: chore: add CI and verification scripts

Add repeatable checks for build, tests, linting, schema validation, and fixture verification.
