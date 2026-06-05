import { describe, expect, test } from "vitest";
import { sampleScreenplay } from "@scriptforge/shared";

import { screenplayToYaml } from "../lib/screenplayToYaml";

describe("screenplayToYaml", () => {
  test("serializes shared screenplay data into a readable yaml preview", () => {
    const yamlText = screenplayToYaml(sampleScreenplay);

    expect(yamlText).toContain("schema_version:");
    expect(yamlText).toContain("title:");
    expect(yamlText).toContain("Lanterns Over River Street");
    expect(yamlText).toContain("adaptation_mode: dramatic");
    expect(yamlText).toContain("characters:");
    expect(yamlText).toContain("scenes:");
  });
});
