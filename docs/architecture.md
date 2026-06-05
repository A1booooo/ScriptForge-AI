# Architecture

This document is a placeholder architecture plan for ScriptForge AI. It describes intended boundaries only; T01 does not create frontend, backend, dependencies, business logic, tests, or CI.

## Planned Layers

### Frontend

The frontend will provide the web workbench for chapter input, YAML preview, validation feedback, Scene Board, Character Bible, and export controls.

### Backend

The backend will coordinate novel ingestion, chapter analysis, screenplay generation, validation, quality scoring, and export-related operations.

### Shared

The shared layer will contain TypeScript types, YAML Schema contracts, fixtures, parser helpers, and validation utilities that must stay aligned across frontend and backend.

### Docs

The docs layer will capture schema rationale, architecture decisions, demo instructions, and development workflow.

## Planned Core Modules

- novel ingestion: accepts 3 or more novel chapters and normalizes source input.
- chapter analyzer: extracts chapter summaries, important beats, characters, and adaptation opportunities.
- screenplay generator: produces the structured screenplay YAML draft.
- yaml validator: parses YAML, validates schema compliance, and reports actionable errors.
- quality scorer: evaluates completeness, scene structure, character coverage, and adaptation quality.
- exporter: exports YAML and adaptation reports for further editing.
- web workbench: provides the author-facing workflow for input, generation, review, validation, and export.

## Initial Boundary Decisions

- LLM calls must be isolated behind a client boundary.
- LLM output must be parsed and schema validated before display as a final draft.
- Demo and mock data must be clearly marked.
- Complex logic should live in focused modules rather than one large page or service.

## Current Status

This file documents the planned architecture only. Implementation begins in later tasks after the project contracts are established.
