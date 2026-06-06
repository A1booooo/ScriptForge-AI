# Demo Guide

This document is a placeholder for the final ScriptForge AI demo guide. T01 does not implement the demo flow.

## Demo Goal

The final demo should show how a novel author can turn 3 or more chapters into a structured, editable, and validated YAML screenplay draft.

## Planned Main Flow

1. Load example novel content.
2. Input 3 chapters.
3. Generate YAML screenplay.
4. View Scene Board.
5. View Character Bible.
6. View Schema Validation result.
7. Export YAML and adaptation report.

## Demo Narrative

The demo should emphasize:

- Lowering the barrier from prose to screenplay structure.
- Making AI output inspectable through YAML.
- Making AI output safer through schema validation.
- Helping authors revise through Scene Board, Character Bible, and adaptation reports.

## Fallback Plan

If live generation is unavailable during the final demo, use the built-in `Run Demo Sample` path.

- It loads a clearly marked Demo sample in the frontend.
- It immediately submits that sample through the existing `POST /api/conversions/mock` flow.
- The UI keeps Demo disclosure visible so the audience does not confuse it with real user data or real LLM output.

## Current Status

The repo now includes a minimal T13 demo fallback:

- a frontend-local Demo fixture set
- a one-click `Run Demo Sample` entry in the workbench
- explicit Demo labels in the entry area and result summary

This still does not add a real LLM endpoint, a dedicated demo backend route, or any new intelligent analysis beyond the existing deterministic Demo panels.
