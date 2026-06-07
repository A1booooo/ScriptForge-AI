import type { FormEvent } from "react";
import { useState } from "react";
import { Sparkles } from "lucide-react";

import {
  ApiRequestError,
  submitRealConversion
} from "./api/conversions";
import { AdaptationModeSelector } from "./components/AdaptationModeSelector";
import { ChapterInputPanel } from "./components/ChapterInputPanel";
import { ConversionResultWorkbench } from "./components/ConversionResultWorkbench";
import { ConversionStatusPanel } from "./components/ConversionStatusPanel";
import { WorkbenchHeader } from "./components/WorkbenchHeader";
import { WorkflowStrip } from "./components/WorkflowStrip";
import type { SubmittedSourceSnapshot } from "./lib/chapterAnalysis";
import {
  createEmptyChapter,
  createInitialFormValues,
  getCompletedChapterCount
} from "./lib/formDefaults";
import {
  SAMPLE_INPUT_BADGE_LABEL,
  SAMPLE_INPUT_NOTE,
  sampleInputFormValues
} from "./lib/sampleInputs";
import type {
  ChapterFormValue,
  ConversionFormValues,
  ConversionResponse,
  SubmissionErrorState,
  SubmissionState
} from "./types";

function getSubmissionError(formValues: ConversionFormValues): string | null {
  if (formValues.title.trim().length === 0) {
    return "请先填写项目标题。";
  }

  if (formValues.chapters.length < 3) {
    return "请至少保留 3 个章节。";
  }

  if (getCompletedChapterCount(formValues.chapters) < 3) {
    return "请至少填写 3 个完整章节后再提交。";
  }

  const emptyTitleIndex = formValues.chapters.findIndex(
    (chapter) => chapter.title.trim().length === 0
  );

  if (emptyTitleIndex >= 0) {
    return `第 ${emptyTitleIndex + 1} 章标题不能为空。`;
  }

  const emptyContentIndex = formValues.chapters.findIndex(
    (chapter) => chapter.content.trim().length === 0
  );

  if (emptyContentIndex >= 0) {
    return `第 ${emptyContentIndex + 1} 章内容不能为空。`;
  }

  return null;
}

export default function App() {
  const [formValues, setFormValues] = useState(createInitialFormValues);
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [submissionError, setSubmissionError] =
    useState<SubmissionErrorState | null>(null);
  const [result, setResult] = useState<ConversionResponse | null>(null);
  const [submittedSourceSnapshot, setSubmittedSourceSnapshot] =
    useState<SubmittedSourceSnapshot | null>(null);
  const [viewMode, setViewMode] = useState<"input" | "result">("input");

  function updateChapter(
    chapterIndex: number,
    field: keyof ChapterFormValue,
    value: string
  ) {
    setFormValues((currentValues) => ({
      ...currentValues,
      chapters: currentValues.chapters.map((chapter, index) =>
        index === chapterIndex
          ? {
              ...chapter,
              [field]: value
            }
          : chapter
      )
    }));
  }

  function addChapter() {
    setFormValues((currentValues) => ({
      ...currentValues,
      chapters: [
        ...currentValues.chapters,
        createEmptyChapter(currentValues.chapters.length)
      ]
    }));
  }

  function removeChapter(chapterIndex: number) {
    setFormValues((currentValues) => {
      if (currentValues.chapters.length <= 3) {
        return currentValues;
      }

      return {
        ...currentValues,
        chapters: currentValues.chapters.filter(
          (_chapter, index) => index !== chapterIndex
        )
      };
    });
  }

  async function executeSubmission(nextFormValues: ConversionFormValues) {
    const validationError = getSubmissionError(nextFormValues);

    if (validationError) {
      setSubmissionState("error");
      setResult(null);
      setSubmittedSourceSnapshot(null);
      setSubmissionError({ message: validationError });
      return;
    }

    setSubmissionState("loading");
    setSubmissionError(null);
    setResult(null);
    setSubmittedSourceSnapshot(null);

    const submittedPayload = {
      title: nextFormValues.title.trim(),
      adaptation_mode: nextFormValues.adaptation_mode,
      chapters: nextFormValues.chapters.map((chapter) => ({
        id: chapter.id.trim(),
        title: chapter.title.trim(),
        content: chapter.content.trim()
      }))
    };

    try {
      const response = await submitRealConversion(submittedPayload);

      setResult(response);
      setSubmittedSourceSnapshot({
        title: submittedPayload.title,
        adaptationMode: submittedPayload.adaptation_mode,
        chapters: submittedPayload.chapters
      });
      setSubmissionState("success");
      setViewMode("result");
    } catch (error) {
      setSubmissionState("error");
      setSubmittedSourceSnapshot(null);
      setSubmissionError(
        error instanceof ApiRequestError
          ? {
              message: error.message,
              ...(error.code ? { code: error.code } : {}),
              ...(error.details ? { details: error.details } : {})
            }
          : {
              message:
                error instanceof Error
                  ? error.message
                  : "提交失败，请检查章节内容或稍后重试"
            }
      );
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await executeSubmission(formValues);
  }

  function handleLoadSampleInput() {
    setFormValues(sampleInputFormValues);
    setSubmissionError(null);
    setSubmissionState("idle");
    setResult(null);
    setSubmittedSourceSnapshot(null);
    setViewMode("input");
  }

  const isSubmitting = submissionState === "loading";
  const isSuccess = submissionState === "success";

  return (
    <div className="min-h-screen text-[var(--text-strong)] bg-[var(--bg-page)] pb-16">
      <nav className="brand-app-bar">
        <div className="flex items-center gap-2">
          <span className="brand-title">ScriptForge AI 剧本工坊</span>
        </div>
        <div className="hidden md:block text-xs font-semibold text-[var(--text-muted)] tracking-wider">
          小说章节到结构化剧本工作台
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--bg-paper-soft)] border border-[var(--line-soft)] text-[var(--text-muted)] uppercase tracking-wider">
            真实 LLM / YAML 契约 / Schema 校验
          </span>
        </div>
      </nav>

      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-6 lg:px-8">
        {viewMode === "input" ? (
          <div className="animate-view-fade-in flex flex-col">
            <WorkbenchHeader />
            <WorkflowStrip isSuccess={isSuccess} />
            <main className="mt-4 flex flex-1 flex-col gap-10">
              <div className="grid gap-8 grid-cols-1 lg:grid-cols-12">
                <form
                  className="source-configuration-card lg:col-span-8 flex flex-col gap-6"
                  onSubmit={handleSubmit}
                >
                  <div className="space-y-6">
                    <div className="border-b border-[var(--line-soft)] pb-4">
                      <p className="section-kicker">Step 1: Source Configuration</p>
                      <h2 className="text-xl font-bold tracking-tight text-[var(--text-strong)] mt-1">
                        输入源文本与基础设定
                      </h2>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 border-b border-[var(--line-soft)] pb-6">
                      <div className="space-y-2">
                        <label className="field-kicker" htmlFor="project-title">
                          项目标题
                        </label>
                        <input
                          id="project-title"
                          aria-label="项目标题"
                          className="input-control"
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
                      </div>

                      <AdaptationModeSelector
                        value={formValues.adaptation_mode}
                        onChange={(nextMode) =>
                          setFormValues((currentValues) => ({
                            ...currentValues,
                            adaptation_mode: nextMode
                          }))
                        }
                      />
                    </div>

                    <ChapterInputPanel
                      chapters={formValues.chapters}
                      onAddChapter={addChapter}
                      onChapterChange={updateChapter}
                      onRemoveChapter={removeChapter}
                    />

                    <section className="space-y-6 border-t border-[var(--line-soft)] pt-6">
                      <div className="support-surface rounded-[0.25rem] p-5">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="rounded border border-[rgba(216,155,43,0.42)] bg-[rgba(216,155,43,0.08)] px-2.5 py-0.5 text-xs font-semibold text-[#996a14] uppercase">
                            {SAMPLE_INPUT_BADGE_LABEL}
                          </span>
                          <p className="text-sm leading-6 text-[var(--text-muted)]">
                            {SAMPLE_INPUT_NOTE}
                          </p>
                        </div>
                        <p className="mt-3 text-xs leading-5 text-[var(--text-muted)] border-t border-[var(--line-soft)] pt-3">
                          加载示例章节只会填充原创中文输入素材，不会请求 mock
                          接口，也不会直接进入结果工作台。
                        </p>
                      </div>

                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <p className="max-w-md text-xs leading-5 text-[var(--text-muted)]">
                          当前结果区会继续复用 Chapter Analyzer、Adaptation
                          Quality Score、Rewrite Suggestions、YAML Workspace、Validation
                          Result、Scene Board 和 Character Bible。
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {result && (
                            <button
                              className="cta-button cta-secondary w-full sm:w-auto"
                              type="button"
                              onClick={() => setViewMode("result")}
                            >
                              查看生成结果
                            </button>
                          )}
                          <button
                            className="cta-button cta-secondary w-full sm:w-auto"
                            disabled={isSubmitting}
                            type="button"
                            onClick={handleLoadSampleInput}
                          >
                            加载示例章节
                          </button>
                          <button
                            className="cta-button cta-primary w-full sm:w-auto"
                            disabled={isSubmitting}
                            type="submit"
                          >
                            {isSubmitting && (
                              <span className="inline-block h-2.5 w-2.5 rounded-full animate-pulse bg-[#1f1d1a] mr-2" />
                            )}
                            <Sparkles className="w-3.5 h-3.5" />
                            {isSubmitting ? "提交中..." : "真实 AI 生成剧本"}
                          </button>
                        </div>
                      </div>
                    </section>
                  </div>
                </form>

                <aside className="lg:col-span-4 space-y-6 self-start lg:sticky lg:top-20">
                  <div className="support-surface rounded-[0.25rem] p-5">
                    <p className="section-kicker">Status Panel</p>
                  </div>
                  <ConversionStatusPanel
                    errorMessage={submissionError?.message ?? null}
                    state={submissionState}
                    {...(submissionError?.code
                      ? { errorCode: submissionError.code }
                      : {})}
                    {...(submissionError?.details
                      ? { errorDetails: submissionError.details }
                      : {})}
                  />
                </aside>
              </div>
            </main>
          </div>
        ) : (
          <div className="animate-view-fade-in flex flex-col mt-6">
            <div className="flex flex-wrap items-center justify-between border-b border-[var(--line-soft)] pb-4 mb-4 gap-4">
              <button
                type="button"
                className="cta-button cta-secondary"
                onClick={() => setViewMode("input")}
              >
                返回修改章节
              </button>
              <WorkflowStrip isSuccess={isSuccess} />
            </div>
            {result && submittedSourceSnapshot && (
              <ConversionResultWorkbench
                result={result}
                sourceSnapshot={submittedSourceSnapshot}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
