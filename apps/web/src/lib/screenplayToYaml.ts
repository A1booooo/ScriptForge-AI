import { stringify } from "yaml";
import type { ScreenplayDocument } from "@scriptforge/shared";

export function screenplayToYaml(screenplay: ScreenplayDocument): string {
  return stringify(screenplay, {
    indent: 2,
    lineWidth: 0,
    minContentWidth: 0
  });
}
