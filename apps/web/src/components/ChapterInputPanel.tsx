import type { ChangeEvent } from "react";

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
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium tracking-[0.18em] text-zinc-300 uppercase">
            章节输入
          </p>
          <p className="max-w-2xl text-sm leading-6 text-zinc-500">
            每个章节需提供唯一 ID、章节标题和正文内容。T04 只提交基础结构到
            mock conversion API，不展示完整 YAML。
          </p>
        </div>
        <div className="rounded-none border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs tracking-[0.16em] text-zinc-400 uppercase">
          默认 3 章
        </div>
      </div>

      <div className="space-y-4">
        {chapters.map((chapter, index) => (
          <article
            key={`chapter-card-${index}`}
            className="border border-zinc-800 bg-zinc-950/80 p-5 transition duration-200 ease-out hover:border-zinc-700"
          >
            <div className="mb-4 flex items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <h2 className="text-sm font-semibold tracking-[0.16em] text-zinc-100 uppercase">
                  章节 {index + 1}
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  保持章节顺序清晰，便于后续扩展到 YAML 展示与校验结果面板。
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs tracking-[0.16em] text-zinc-400 uppercase">
                  章节 ID
                </span>
                <input
                  aria-label="章节 ID"
                  className="w-full rounded-none border border-zinc-700 bg-zinc-900 px-3 py-3 text-sm text-zinc-100 outline-none transition duration-200 ease-out placeholder:text-zinc-600 hover:border-zinc-500 focus:border-zinc-100 focus:ring-2 focus:ring-zinc-300/20"
                  placeholder="chapter_01"
                  type="text"
                  value={chapter.id}
                  onChange={(event) =>
                    handleChange(event, index, "id", onChapterChange)
                  }
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs tracking-[0.16em] text-zinc-400 uppercase">
                  章节标题
                </span>
                <input
                  aria-label="章节标题"
                  className="w-full rounded-none border border-zinc-700 bg-zinc-900 px-3 py-3 text-sm text-zinc-100 outline-none transition duration-200 ease-out placeholder:text-zinc-600 hover:border-zinc-500 focus:border-zinc-100 focus:ring-2 focus:ring-zinc-300/20"
                  placeholder="雨夜来信"
                  type="text"
                  value={chapter.title}
                  onChange={(event) =>
                    handleChange(event, index, "title", onChapterChange)
                  }
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs tracking-[0.16em] text-zinc-400 uppercase">
                  章节内容
                </span>
                <textarea
                  aria-label="章节内容"
                  className="min-h-36 w-full resize-y rounded-none border border-zinc-700 bg-zinc-900 px-3 py-3 text-sm leading-6 text-zinc-100 outline-none transition duration-200 ease-out placeholder:text-zinc-600 hover:border-zinc-500 focus:border-zinc-100 focus:ring-2 focus:ring-zinc-300/20"
                  placeholder="输入章节正文或摘要内容，用于 mock 剧本转换。"
                  value={chapter.content}
                  onChange={(event) =>
                    handleChange(event, index, "content", onChapterChange)
                  }
                />
              </label>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
