import type { ConversionFormValues } from "../types";

export const DEMO_SAMPLE_BADGE_LABEL = "Demo Sample";
export const DEMO_SAMPLE_NOTE =
  "Demo sample only. This is not real user data and not real LLM output.";

export const demoSampleFormValues: ConversionFormValues = {
  title: "Demo Sample - Lanterns Over River Street",
  adaptation_mode: "dramatic",
  chapters: [
    {
      id: "chapter_01",
      title: "The Letter at Dawn",
      content:
        "Lin Xia discovers a letter at dawn suggesting that her missing brother may still be alive after the purge."
    },
    {
      id: "chapter_02",
      title: "Market of Rumors",
      content:
        "She searches the covered market, follows rumor chains, and learns the city watch hid a prison transfer during a storm."
    },
    {
      id: "chapter_03",
      title: "Rain on the Watchtower",
      content:
        "At night she confronts Captain Zhou in the watchtower and forces him to choose between loyalty and the truth."
    }
  ]
};
