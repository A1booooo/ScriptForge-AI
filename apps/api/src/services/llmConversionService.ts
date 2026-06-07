import {
  SCREENPLAY_SCHEMA_VERSION,
  type AdaptationMode
} from "@scriptforge/shared";

import type { LlmClient } from "../llm/client.js";
import type { LlmDraftResult } from "../llm/types.js";

export interface LlmConversionChapterInput {
  id: string;
  title: string;
  content: string;
}

export interface GenerateLlmConversionDraftInput {
  title: string;
  adaptationMode: AdaptationMode;
  chapters: LlmConversionChapterInput[];
}

interface GenerateLlmConversionDraftDependencies {
  llmClient: LlmClient;
}

const SCREENPLAY_DRAFT_SYSTEM_PROMPT = [
  "You are a screenplay development assistant.",
  "Return one JSON object only.",
  "Do not use markdown fences or explanatory text.",
  "Use snake_case field names only.",
  "Do not add extra top-level fields.",
  `The JSON must satisfy the ScreenplayDocument contract with schema_version=${SCREENPLAY_SCHEMA_VERSION}, metadata, characters, locations, scenes, and quality_hints.`,
  "Use Chinese for story-facing fields.",
  "Keep references consistent across character IDs, location IDs, chapter_refs, and source_chapter_ids."
].join(" ");

const SCREENPLAY_JSON_SKELETON = JSON.stringify(
  {
    schema_version: SCREENPLAY_SCHEMA_VERSION,
    metadata: {
      title: "string",
      source_chapters: [
        {
          chapter_id: "chapter_01",
          chapter_title: "string",
          chapter_order: 1,
          summary: "string"
        }
      ],
      genre: "string",
      language: "zh-CN",
      adaptation_mode: "dramatic",
      logline: "string",
      adaptation_notes: ["string"]
    },
    characters: [
      {
        id: "char_01",
        name: "string",
        role: "string",
        description: "string",
        motivation: "string",
        speech_style: "string",
        relationships: [
          {
            character_id: "char_02",
            relation: "string",
            description: "string"
          }
        ]
      }
    ],
    locations: [
      {
        id: "loc_01",
        name: "string",
        description: "string",
        atmosphere: "string"
      }
    ],
    scenes: [
      {
        id: "scene_01",
        title: "string",
        chapter_refs: ["chapter_01"],
        location_id: "loc_01",
        time_of_day: "string",
        characters: ["char_01"],
        summary: "string",
        conflict: "string",
        beats: [
          {
            id: "beat_01",
            summary: "string",
            purpose: "string",
            source_chapter_ids: ["chapter_01"]
          }
        ],
        dialogue: [
          {
            character_id: "char_01",
            line: "string",
            emotion: "string",
            action: "string"
          }
        ],
        stage_directions: [
          {
            id: "direction_01",
            instruction: "string"
          }
        ],
        adaptation_notes: ["string"]
      }
    ],
    quality_hints: {
      coverage_notes: ["string"],
      character_consistency_notes: ["string"],
      pacing_notes: ["string"],
      revision_suggestions: ["string"]
    }
  },
  null,
  2
);

function buildDraftPrompt(input: GenerateLlmConversionDraftInput): string {
  const chapterBlocks = input.chapters.map((chapter) =>
    [
      `[${chapter.id}] ${chapter.title}`,
      chapter.content
    ].join("\n")
  );

  return [
    "Generate a structured screenplay draft from the source material below.",
    `Project title: ${input.title}`,
    `Adaptation mode: ${input.adaptationMode}`,
    "Output requirements:",
    "- Return a JSON object only.",
    "- No markdown fence.",
    "- No explanation text.",
    "- Use snake_case field names exactly as required by ScreenplayDocument.",
    `- schema_version must equal ${SCREENPLAY_SCHEMA_VERSION}.`,
    "- Do not include extra top-level fields.",
    "- All id references must be internally consistent.",
    "- metadata.source_chapters must cover every submitted chapter.",
    "- Every scene must include id, title, chapter_refs, location_id, characters, beats, dialogue, conflict, and adaptation_notes.",
    "- dialogue.character_id values must reference characters[].id.",
    "- beats.source_chapter_ids and scenes.chapter_refs must reference metadata.source_chapters[].chapter_id.",
    "- stage_directions should be included for each scene, even if concise.",
    "Compact JSON skeleton:",
    SCREENPLAY_JSON_SKELETON,
    "Source chapters:",
    ...chapterBlocks
  ].join("\n\n");
}

export async function generateLlmRepairDraft(
  input: {
    originalDraft: unknown;
    validationDetails: string[];
  },
  dependencies: GenerateLlmConversionDraftDependencies
): Promise<LlmDraftResult> {
  return dependencies.llmClient.generateDraft({
    systemPrompt: SCREENPLAY_DRAFT_SYSTEM_PROMPT,
    prompt: [
      "Repair the JSON object below so it fully satisfies the ScreenplayDocument contract.",
      "Return one JSON object only.",
      "Do not include markdown fences or explanation text.",
      `schema_version must remain ${SCREENPLAY_SCHEMA_VERSION}.`,
      "Keep snake_case field names and do not add extra top-level fields.",
      "Fix every issue listed in the validation summary.",
      "Validation summary:",
      ...input.validationDetails.map((detail) => `- ${detail}`),
      "JSON to repair:",
      JSON.stringify(input.originalDraft, null, 2)
    ].join("\n\n")
  });
}

export async function generateLlmConversionDraft(
  input: GenerateLlmConversionDraftInput,
  dependencies: GenerateLlmConversionDraftDependencies
): Promise<LlmDraftResult> {
  return dependencies.llmClient.generateDraft({
    systemPrompt: SCREENPLAY_DRAFT_SYSTEM_PROMPT,
    prompt: buildDraftPrompt(input)
  });
}
