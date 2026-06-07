import type { ChapterFormValue, ConversionFormValues } from "../types";

export function createEmptyChapter(index: number): ChapterFormValue {
  return {
    id: `chapter_${String(index + 1).padStart(2, "0")}`,
    title: `第 ${index + 1} 章`,
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
      chapter.title.trim().length > 0 &&
      chapter.content.trim().length > 0
    );
  }).length;
}
