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
  "Create an intermediate draft only.",
  "Do not assume YAML parsing, schema validation, or final normalization has already happened."
].join(" ");

function buildDraftPrompt(input: GenerateLlmConversionDraftInput): string {
  const chapterBlocks = input.chapters.map((chapter) =>
    [
      `[${chapter.id}] ${chapter.title}`,
      chapter.content
    ].join("\n")
  );

  return [
    "Generate an intermediate screenplay draft from the source material below.",
    `Project title: ${input.title}`,
    `Adaptation mode: ${input.adaptationMode}`,
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
