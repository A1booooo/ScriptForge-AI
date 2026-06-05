import type { FormEvent } from "react";
import { useState } from "react";

import { submitMockConversion } from "./api/conversions";
import { AdaptationModeSelector } from "./components/AdaptationModeSelector";
import { ChapterInputPanel } from "./components/ChapterInputPanel";
import { ConversionResultSummary } from "./components/ConversionResultSummary";
import { ConversionStatusPanel } from "./components/ConversionStatusPanel";
import { WorkbenchHeader } from "./components/WorkbenchHeader";
import {
  createInitialFormValues,
  getCompletedChapterCount
} from "./lib/formDefaults";
import type {
  ChapterFormValue,
  MockConversionResponse,
  SubmissionState
} from "./types";

export default function App() {
  const [formValues, setFormValues] = useState(createInitialFormValues);
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<MockConversionResponse | null>(null);

  function updateChapter(
    chapterIndex: number,
    field: keyof ChapterFormValue,
    value: string
  ) {
    setFormValues((currentValues) => ({
      ...currentValues,
      chapters: currentValues.chapters.map((chapter, index) => {
        if (index !== chapterIndex) {
          return chapter;
        }

        return {
          ...chapter,
          [field]: value
        };
      })
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const completedChapterCount = getCompletedChapterCount(formValues.chapters);

    if (formValues.title.trim().length === 0) {
      setSubmissionState("error");
      setResult(null);
      setErrorMessage("请先填写项目标题。");
      return;
    }

    if (completedChapterCount < 3) {
      setSubmissionState("error");
      setResult(null);
      setErrorMessage("请至少填写 3 个完整章节后再提交。");
      return;
    }

    setSubmissionState("loading");
    setErrorMessage(null);
    setResult(null);

    try {
      const response = await submitMockConversion({
        ...formValues,
        title: formValues.title.trim(),
        chapters: formValues.chapters.map((chapter) => ({
          id: chapter.id.trim(),
          title: chapter.title.trim(),
          content: chapter.content.trim()
        }))
      });

      setResult(response);
      setSubmissionState("success");
    } catch (error) {
      setSubmissionState("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "提交失败，请检查章节内容或稍后重试"
      );
    }
  }

  const isSubmitting = submissionState === "loading";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_35%),linear-gradient(180deg,_#101113_0%,_#0a0b0c_100%)] text-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <WorkbenchHeader />

        <main className="mt-6 grid flex-1 gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
          <form
            className="space-y-6 border border-zinc-800 bg-zinc-950/60 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-sm sm:p-6"
            onSubmit={handleSubmit}
          >
            <section className="space-y-5">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium tracking-[0.18em] text-zinc-300 uppercase"
                  htmlFor="project-title"
                >
                  项目标题
                </label>
                <p className="text-sm leading-6 text-zinc-500">
                  用一个清晰项目名标记本次剧本转换请求，便于后续扩展历史记录与结果管理。
                </p>
              </div>
              <input
                id="project-title"
                aria-label="项目标题"
                className="w-full rounded-none border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition duration-200 ease-out placeholder:text-zinc-600 hover:border-zinc-500 focus:border-zinc-100 focus:ring-2 focus:ring-zinc-300/20"
                placeholder="例如：雾港追缉令"
                type="text"
                value={formValues.title}
                onChange={(event) =>
                  setFormValues((currentValues) => ({
                    ...currentValues,
                    title: event.target.value
                  }))
                }
              />
            </section>

            <AdaptationModeSelector
              value={formValues.adaptation_mode}
              onChange={(nextMode) =>
                setFormValues((currentValues) => ({
                  ...currentValues,
                  adaptation_mode: nextMode
                }))
              }
            />

            <ChapterInputPanel
              chapters={formValues.chapters}
              onChapterChange={updateChapter}
            />

            <div className="flex flex-col gap-3 border-t border-zinc-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-zinc-500">
                当前任务只生成 mock 剧本摘要，不展示 YAML、不做 Scene Board 或角色面板。
              </p>
              <button
                className="inline-flex min-w-56 items-center justify-center gap-3 rounded-none border border-zinc-100 bg-zinc-100 px-5 py-3 text-sm font-medium text-zinc-950 transition duration-200 ease-out hover:bg-transparent hover:text-zinc-100 active:translate-y-px disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-900 disabled:text-zinc-500"
                disabled={isSubmitting}
                type="submit"
              >
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${
                    isSubmitting ? "animate-pulse bg-zinc-950" : "bg-zinc-950"
                  }`}
                />
                {isSubmitting ? "提交中..." : "生成 mock 剧本摘要"}
              </button>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="border border-zinc-800 bg-black/20 p-4">
              <p className="text-xs tracking-[0.22em] text-zinc-500 uppercase">
                Status Panel
              </p>
            </div>

            {submissionState === "success" && result ? (
              <ConversionResultSummary result={result} />
            ) : (
              <ConversionStatusPanel
                errorMessage={errorMessage}
                state={submissionState}
              />
            )}
          </aside>
        </main>
      </div>
    </div>
  );
}
