import { describe, expect, test } from "vitest";
import { sampleScreenplay } from "@scriptforge/shared";

import {
  getCharacterDisplayItems,
  getSceneDisplayItems
} from "../lib/screenplayDisplay";

describe("screenplayDisplay", () => {
  test("maps scenes to display data with resolved location, characters, and chapter refs", () => {
    const result = getSceneDisplayItems(sampleScreenplay);

    expect(result).toHaveLength(sampleScreenplay.scenes.length);
    expect(result[0]).toMatchObject({
      id: "scene_market_reveal",
      title: "Rumors Under Lantern Light",
      locationName: "River Street Market",
      characterNames: ["Lin Xia", "Captain Zhou"],
      chapterTitles: ["The Letter at Dawn", "Market of Rumors"],
      dialogueCount: 2
    });
    expect(result[0]?.representativeDialogue).toMatchObject({
      characterName: "Lin Xia"
    });
  });

  test("maps characters to display data with relationships and appearance scenes", () => {
    const result = getCharacterDisplayItems(sampleScreenplay);

    expect(result).toHaveLength(sampleScreenplay.characters.length);
    expect(result[0]).toMatchObject({
      id: "char_lin_xia",
      name: "Lin Xia",
      role: "protagonist",
      motivation: "Find proof that her brother is alive and expose the cover-up."
    });
    expect(result[0]?.relationships).toEqual([
      {
        characterId: "char_captain_zhou",
        characterName: "Captain Zhou",
        relation: "adversarial ally",
        description: "Distrusts him but senses he knows more than he admits."
      }
    ]);
    expect(result[0]?.appearanceScenes.map((scene) => scene.id)).toEqual([
      "scene_market_reveal",
      "scene_watchtower_choice"
    ]);
  });

  test("returns an explicit empty relationship state when a character has no relationships", () => {
    const screenplayWithoutRelationships = {
      ...sampleScreenplay,
      characters: sampleScreenplay.characters.map((character, index) =>
        index === 0
          ? {
              ...character,
              relationships: []
            }
          : character
      )
    };

    const result = getCharacterDisplayItems(screenplayWithoutRelationships);

    expect(result[0]?.relationships).toEqual([]);
    expect(result[0]?.relationshipState).toEqual({
      kind: "empty",
      title: "暂无明确关系",
      description: "当前剧本草稿未提供该角色的明确关系描述。"
    });
  });
});
