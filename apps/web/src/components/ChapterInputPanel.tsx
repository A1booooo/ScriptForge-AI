import type { ChangeEvent } from "react";
import { BookOpen } from "lucide-react";

import type { ChapterFormValue } from "../types";

interface ChapterInputPanelProps {
  chapters: ChapterFormValue[];
  onChapterChange: (
    chapterIndex: number,
    field: keyof ChapterFormValue,
    value: string
  ) => void;
}

function handleChange(
  event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  chapterIndex: number,
  field: keyof ChapterFormValue,
  onChapterChange: ChapterInputPanelProps["onChapterChange"]
) {
  onChapterChange(chapterIndex, field, event.target.value);
}

export function ChapterInputPanel({
  chapters,
  onChapterChange
}: ChapterInputPanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--line-soft)] pb-4">
        <div className="space-y-1">
          <p className="field-kicker flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            章节输入
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            Provide chapter details and content. Long chapters will scroll internally to protect screen space.
          </p>
        </div>
        <span className="text-xs bg-[var(--bg-paper-soft)] px-2.5 py-1 rounded text-[var(--text-muted)] border border-[var(--line-soft)] uppercase tracking-[0.1em] font-semibold">
          默认 3 章
        </span>
      </div>

      <div className="space-y-6">
        {chapters.map((chapter, index) => {
          const charCount = chapter.content.trim().length;
          return (
            <article
              key={`chapter-card-${index}`}
              className="chapter-editor-card"
            >
              <div className="mb-4 border-b border-[var(--line-soft)] pb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-[var(--text-strong)]">
                    章节 {index + 1}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    当前输入: <strong className="text-[var(--text-strong)]">{charCount}</strong> 字
                  </p>
                </div>
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  {chapter.title || "未命名章节"}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="field-kicker">章节 ID</span>
                  <input
                    aria-label="章节 ID"
                    className="input-control"
                    placeholder="chapter_01"
                    type="text"
                    value={chapter.id}
                    onChange={(event) =>
                      handleChange(event, index, "id", onChapterChange)
                    }
                  />
                </label>

                <label className="space-y-2">
                  <span className="field-kicker">章节标题</span>
                  <input
                    aria-label="章节标题"
                    className="input-control"
                    placeholder="雨夜来信"
                    type="text"
                    value={chapter.title}
                    onChange={(event) =>
                      handleChange(event, index, "title", onChapterChange)
                    }
                  />
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="field-kicker">章节内容</span>
                  <textarea
                    aria-label="章节内容"
                    className="input-control"
                    placeholder="输入章节正文，用于 mock 剧本转换。"
                    value={chapter.content}
                    onChange={(event) =>
                      handleChange(event, index, "content", onChapterChange)
                    }
                  />
                </label>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
