import type { ChapterFormValue, ConversionFormValues } from "../types";

export function createEmptyChapter(index: number): ChapterFormValue {
  return {
    id: "",
    title: "",
    content: ""
  };
}

export function createInitialFormValues(): ConversionFormValues {
  return {
    title: "",
    adaptation_mode: "faithful",
    chapters: [createEmptyChapter(0), createEmptyChapter(1), createEmptyChapter(2)]
  };
}

export function getCompletedChapterCount(chapters: ChapterFormValue[]): number {
  return chapters.filter((chapter) => {
    return (
      chapter.id.trim().length > 0 &&
      chapter.title.trim().length > 0 &&
      chapter.content.trim().length > 0
    );
  }).length;
}
