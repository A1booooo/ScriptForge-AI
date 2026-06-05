export const SCREENPLAY_SCHEMA_VERSION = "1.0.0";

export const ADAPTATION_MODES = [
  "faithful",
  "dramatic",
  "short_drama"
] as const;

export type AdaptationMode = (typeof ADAPTATION_MODES)[number];

export type Identifier = string;

export interface SourceChapter {
  chapter_id: Identifier;
  chapter_title: string;
  chapter_order: number;
  summary: string;
}

export interface ScreenplayMetadata {
  title: string;
  source_chapters: SourceChapter[];
  genre: string;
  language: string;
  adaptation_mode: AdaptationMode;
  logline: string;
  adaptation_notes: string[];
}

export interface CharacterRelationship {
  character_id: Identifier;
  relation: string;
  description: string;
}

export interface ScreenplayCharacter {
  id: Identifier;
  name: string;
  role: string;
  description: string;
  motivation: string;
  speech_style: string;
  relationships: CharacterRelationship[];
}

export interface ScreenplayLocation {
  id: Identifier;
  name: string;
  description: string;
  atmosphere: string;
}

export interface SceneBeat {
  id: Identifier;
  summary: string;
  purpose: string;
  source_chapter_ids: Identifier[];
}

export interface DialogueLine {
  character_id: Identifier;
  line: string;
  emotion: string;
  action: string;
}

export interface StageDirection {
  id: Identifier;
  instruction: string;
}

export interface ScreenplayScene {
  id: Identifier;
  title: string;
  chapter_refs: Identifier[];
  location_id: Identifier;
  time_of_day: string;
  characters: Identifier[];
  summary: string;
  conflict: string;
  beats: SceneBeat[];
  dialogue: DialogueLine[];
  stage_directions: StageDirection[];
  adaptation_notes: string[];
}

export interface QualityHints {
  coverage_notes: string[];
  character_consistency_notes: string[];
  pacing_notes: string[];
  revision_suggestions: string[];
}

export interface ScreenplayDocument {
  schema_version: typeof SCREENPLAY_SCHEMA_VERSION;
  metadata: ScreenplayMetadata;
  characters: ScreenplayCharacter[];
  locations: ScreenplayLocation[];
  scenes: ScreenplayScene[];
  quality_hints: QualityHints;
}
