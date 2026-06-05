import type {
  ScreenplayCharacter,
  ScreenplayDocument,
  ScreenplayLocation,
  ScreenplayScene,
  SourceChapter
} from "@scriptforge/shared";

export interface SceneDisplayDialogueSample {
  characterName: string;
  line: string;
}

export interface SceneDisplayItem {
  id: string;
  title: string;
  timeOfDay: string;
  summary: string;
  conflict: string;
  location: ScreenplayLocation | undefined;
  locationName: string;
  chapterTitles: string[];
  characters: ScreenplayCharacter[];
  characterNames: string[];
  beats: ScreenplayScene["beats"];
  dialogueCount: number;
  representativeDialogue: SceneDisplayDialogueSample | undefined;
  adaptationNotes: string[];
}

export interface CharacterRelationshipDisplayItem {
  characterId: string;
  characterName: string;
  relation: string;
  description: string;
}

export interface CharacterAppearanceScene {
  id: string;
  title: string;
  locationName: string;
}

export interface CharacterDisplayItem {
  id: string;
  name: string;
  role: string;
  description: string;
  motivation: string;
  speechStyle: string;
  relationships: CharacterRelationshipDisplayItem[];
  appearanceScenes: CharacterAppearanceScene[];
}

function getCharacterName(
  charactersById: Map<string, ScreenplayCharacter>,
  characterId: string
) {
  return charactersById.get(characterId)?.name ?? characterId;
}

function getLocationName(
  locationsById: Map<string, ScreenplayLocation>,
  locationId: string
) {
  return locationsById.get(locationId)?.name ?? locationId;
}

function getChapterTitle(
  chaptersById: Map<string, SourceChapter>,
  chapterId: string
) {
  return chaptersById.get(chapterId)?.chapter_title ?? chapterId;
}

export function getSceneDisplayItems(
  screenplay: ScreenplayDocument
): SceneDisplayItem[] {
  const locationsById = new Map(
    screenplay.locations.map((location) => [location.id, location])
  );
  const charactersById = new Map(
    screenplay.characters.map((character) => [character.id, character])
  );
  const chaptersById = new Map(
    screenplay.metadata.source_chapters.map((chapter) => [chapter.chapter_id, chapter])
  );

  return screenplay.scenes.map((scene) => {
    const location = locationsById.get(scene.location_id);
    const characters = scene.characters
      .map((characterId) => charactersById.get(characterId))
      .filter((character): character is ScreenplayCharacter => Boolean(character));
    const firstDialogue = scene.dialogue[0];

    return {
      id: scene.id,
      title: scene.title,
      timeOfDay: scene.time_of_day,
      summary: scene.summary,
      conflict: scene.conflict,
      location,
      locationName: getLocationName(locationsById, scene.location_id),
      chapterTitles: scene.chapter_refs.map((chapterId) =>
        getChapterTitle(chaptersById, chapterId)
      ),
      characters,
      characterNames: scene.characters.map((characterId) =>
        getCharacterName(charactersById, characterId)
      ),
      beats: scene.beats,
      dialogueCount: scene.dialogue.length,
      representativeDialogue: firstDialogue
        ? {
            characterName: getCharacterName(
              charactersById,
              firstDialogue.character_id
            ),
            line: firstDialogue.line
          }
        : undefined,
      adaptationNotes: scene.adaptation_notes
    };
  });
}

export function getCharacterDisplayItems(
  screenplay: ScreenplayDocument
): CharacterDisplayItem[] {
  const charactersById = new Map(
    screenplay.characters.map((character) => [character.id, character])
  );
  const locationsById = new Map(
    screenplay.locations.map((location) => [location.id, location])
  );

  return screenplay.characters.map((character) => ({
    id: character.id,
    name: character.name,
    role: character.role,
    description: character.description,
    motivation: character.motivation,
    speechStyle: character.speech_style,
    relationships: character.relationships.map((relationship) => ({
      characterId: relationship.character_id,
      characterName: getCharacterName(charactersById, relationship.character_id),
      relation: relationship.relation,
      description: relationship.description
    })),
    appearanceScenes: screenplay.scenes
      .filter((scene) => scene.characters.includes(character.id))
      .map((scene) => ({
        id: scene.id,
        title: scene.title,
        locationName: getLocationName(locationsById, scene.location_id)
      }))
  }));
}
