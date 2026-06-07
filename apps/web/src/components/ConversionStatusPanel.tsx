import { Loader2, AlertCircle, Info, HelpCircle } from "lucide-react";
import type { SubmissionState } from "../types";

interface ConversionStatusPanelProps {
  state: SubmissionState;
  errorMessage: string | null;
}

export function ConversionStatusPanel({
  state,
  errorMessage
}: ConversionStatusPanelProps) {
  if (state === "loading") {
    return (
      <section className="reading-panel overflow-hidden rounded-[0.25rem]">
        <div className="border-b border-[var(--line-soft)] px-5 py-4 flex items-center gap-2">
          <Loader2 className="w-5 h-5 text-[var(--color-primary)] animate-spin" />
          <div>
            <p className="section-kicker">Loading</p>
            <h2 className="mt-1 text-base font-semibold text-[var(--text-strong)]">
              正在提交章节到 mock conversion API...
            </h2>
          </div>
        </div>
        <div className="bg-[var(--bg-paper-soft)] px-5 py-4 text-xs leading-6 text-[var(--text-muted)]">
          Request in progress. This column only tracks state, while the result
          workspace will open below as a separate full-width surface.
        </div>
      </section>
    );
  }

  if (state === "error") {
    return (
      <section
        aria-live="polite"
        className="reading-panel overflow-hidden rounded-[0.25rem] border-[var(--color-error)]"
      >
        <div className="border-b border-[rgba(196,82,82,0.22)] px-5 py-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-[var(--color-error)]" />
          <div>
            <p className="section-kicker text-[var(--color-error)]">Error</p>
            <h2 className="mt-1 text-base font-semibold text-[var(--text-strong)]">
              提交失败，请检查章节内容或稍后重试
            </h2>
          </div>
        </div>
        <div className="bg-[rgba(196,82,82,0.04)] px-5 py-4 text-xs leading-6 text-[var(--color-error)]">
          {errorMessage}
        </div>
      </section>
    );
  }

  return (
    <section className="reading-panel overflow-hidden rounded-[0.25rem]">
      <div className="border-b border-[var(--line-soft)] px-5 py-4 flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-[var(--text-muted)]" />
        <div>
          <p className="section-kicker">Idle</p>
          <h2 className="mt-1 text-base font-semibold text-[var(--text-strong)]">
            等待生成 mock 剧本摘要
          </h2>
        </div>
      </div>
      <div className="bg-[var(--bg-paper-soft)] px-5 py-4 text-xs leading-6 text-[var(--text-muted)] space-y-2">
        <div className="flex gap-2">
          <Info className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0 mt-0.5" />
          <p>请填写项目标题、选择改编模式并录入至少三个完整章节，然后点击生成按钮。</p>
        </div>
        <p className="border-t border-[var(--line-soft)] pt-2 text-[10px]">
          The result workspace opens only after a successful generation.
        </p>
      </div>
    </section>
  );
}
