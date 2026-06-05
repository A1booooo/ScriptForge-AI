import type { ScreenplayDocument } from "../screenplayTypes.js";
import { summarizeIssues } from "./summary.js";
import type {
  ScreenplayValidationResult,
  ValidationIssue
} from "./validationTypes.js";

function pushDuplicateIdIssues(
  issues: ValidationIssue[],
  items: { id: string }[],
  basePath: string,
  code: string
) {
  const seen = new Map<string, number>();

  items.forEach((item, index) => {
    const firstIndex = seen.get(item.id);

    if (firstIndex !== undefined) {
      issues.push({
        source: "consistency",
        code,
        severity: "error",
        message: `Duplicate id "${item.id}" found in ${basePath}.`,
        path: `${basePath}/${index}/id`
      });
      return;
    }

    seen.set(item.id, index);
  });
}

export function runScreenplayConsistencyChecks(
  document: ScreenplayDocument
): ScreenplayValidationResult {
  const issues: ValidationIssue[] = [];
  const characterIds = new Set(document.characters.map((character) => character.id));
  const locationIds = new Set(document.locations.map((location) => location.id));
  const chapterIds = new Set(
    document.metadata.source_chapters.map((chapter) => chapter.chapter_id)
  );

  pushDuplicateIdIssues(issues, document.characters, "/characters", "duplicate_character_id");
  pushDuplicateIdIssues(issues, document.locations, "/locations", "duplicate_location_id");
  pushDuplicateIdIssues(issues, document.scenes, "/scenes", "duplicate_scene_id");
  pushDuplicateIdIssues(
    issues,
    document.metadata.source_chapters.map((chapter) => ({ id: chapter.chapter_id })),
    "/metadata/source_chapters",
    "duplicate_source_chapter_id"
  );

  document.characters.forEach((character, characterIndex) => {
    character.relationships.forEach((relationship, relationshipIndex) => {
      if (!characterIds.has(relationship.character_id)) {
        issues.push({
          source: "consistency",
          code: "missing_relationship_character_reference",
          severity: "error",
          message: `Character ${character.id} references missing relationship target ${relationship.character_id}.`,
          path: `/characters/${characterIndex}/relationships/${relationshipIndex}/character_id`
        });
      }
    });
  });

  document.scenes.forEach((scene, sceneIndex) => {
    if (!locationIds.has(scene.location_id)) {
      issues.push({
        source: "consistency",
        code: "missing_location_reference",
        severity: "error",
        message: `Scene ${scene.id} references missing location ${scene.location_id}.`,
        path: `/scenes/${sceneIndex}/location_id`
      });
    }

    scene.chapter_refs.forEach((chapterId, chapterIndex) => {
      if (!chapterIds.has(chapterId)) {
        issues.push({
          source: "consistency",
          code: "missing_scene_chapter_reference",
          severity: "error",
          message: `Scene ${scene.id} references missing source chapter ${chapterId}.`,
          path: `/scenes/${sceneIndex}/chapter_refs/${chapterIndex}`
        });
      }
    });

    scene.characters.forEach((characterId, characterIndex) => {
      if (!characterIds.has(characterId)) {
        issues.push({
          source: "consistency",
          code: "missing_scene_character_reference",
          severity: "error",
          message: `Scene ${scene.id} references missing character ${characterId}.`,
          path: `/scenes/${sceneIndex}/characters/${characterIndex}`
        });
      }
    });

    scene.dialogue.forEach((line, dialogueIndex) => {
      if (!characterIds.has(line.character_id)) {
        issues.push({
          source: "consistency",
          code: "missing_dialogue_character_reference",
          severity: "error",
          message: `Scene ${scene.id} dialogue references missing character ${line.character_id}.`,
          path: `/scenes/${sceneIndex}/dialogue/${dialogueIndex}/character_id`
        });
      }
    });

    scene.beats.forEach((beat, beatIndex) => {
      beat.source_chapter_ids.forEach((chapterId, chapterIndex) => {
        if (!chapterIds.has(chapterId)) {
          issues.push({
            source: "consistency",
            code: "missing_beat_chapter_reference",
            severity: "error",
            message: `Scene ${scene.id} beat ${beat.id} references missing source chapter ${chapterId}.`,
            path: `/scenes/${sceneIndex}/beats/${beatIndex}/source_chapter_ids/${chapterIndex}`
          });
        }
      });
    });
  });

  return {
    ok: issues.length === 0,
    document,
    issues,
    summary: summarizeIssues(issues)
  };
}
