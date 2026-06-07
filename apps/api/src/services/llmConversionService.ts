import type { AdaptationMode } from "@scriptforge/shared";

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
  "The JSON must satisfy the ScreenplayDocument contract with schema_version, metadata, characters, locations, scenes, and quality_hints.",
  "Use Chinese for story-facing fields.",
  "Keep references consistent across character IDs, location IDs, chapter_refs, and source_chapter_ids."
].join(" ");

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
    "- metadata.source_chapters must cover every submitted chapter.",
    "- scenes must include chapter_refs, location_id, characters, beats, dialogue, conflict, and adaptation_notes.",
    "- dialogue.character_id values must reference characters[].id.",
    "- beats.source_chapter_ids and scenes.chapter_refs must reference metadata.source_chapters[].chapter_id.",
    "Source chapters:",
    ...chapterBlocks
  ].join("\n\n");
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
