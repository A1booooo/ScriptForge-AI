import { Loader2, AlertCircle, Info, HelpCircle } from "lucide-react";
import type { SubmissionState } from "../types";

interface ConversionStatusPanelProps {
  state: SubmissionState;
  errorMessage: string | null;
  errorCode?: string;
  errorDetails?: string[];
}

export function ConversionStatusPanel({
  state,
  errorCode,
  errorDetails,
  errorMessage
}: ConversionStatusPanelProps) {
  if (state === "loading") {
    return (
      <section className="reading-panel overflow-hidden rounded-[0.25rem]">
        <div className="border-b border-[var(--line-soft)] px-5 py-4 flex items-center gap-2">
          <Loader2 className="w-5 h-5 text-[var(--color-primary)] animate-spin" />
          <div>
            <p className="section-kicker">生成中</p>
            <h2 className="mt-1 text-base font-semibold text-[var(--text-strong)]">
              正在请求真实 LLM 剧本生成...
            </h2>
          </div>
        </div>
        <div className="bg-[var(--bg-paper-soft)] px-5 py-4 text-xs leading-6 text-[var(--text-muted)]">
          请求正在处理中。此栏仅跟踪状态，生成结果的工作台将会在下方作为独立的宽版区域展开。
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
            <p className="section-kicker text-[var(--color-error)]">错误</p>
            <h2 className="mt-1 text-base font-semibold text-[var(--text-strong)]">
              提交失败，请检查章节内容或稍后重试
            </h2>
          </div>
        </div>
        <div className="bg-[rgba(196,82,82,0.04)] px-5 py-4 text-xs leading-6 text-[var(--color-error)] space-y-3">
          <div>{errorMessage}</div>
          {errorCode === "schema_validation_failed" &&
            errorDetails &&
            errorDetails.length > 0 && (
              <div className="space-y-1">
                <p className="font-semibold">Schema 问题摘要：</p>
                <ul className="list-disc pl-5 space-y-1">
                  {errorDetails.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      </section>
    );
  }

  return (
    <section className="reading-panel overflow-hidden rounded-[0.25rem]">
      <div className="border-b border-[var(--line-soft)] px-5 py-4 flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-[var(--text-muted)]" />
        <div>
          <p className="section-kicker">等待生成</p>
          <h2 className="mt-1 text-base font-semibold text-[var(--text-strong)]">
            等待真实 AI 生成剧本
          </h2>
        </div>
      </div>
      <div className="bg-[var(--bg-paper-soft)] px-5 py-4 text-xs leading-6 text-[var(--text-muted)] space-y-2">
        <div className="flex gap-2">
          <Info className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0 mt-0.5" />
          <p>请填写项目标题、选择改编模式并录入至少三个完整章节，然后点击生成按钮。</p>
        </div>
        <p className="border-t border-[var(--line-soft)] pt-2 text-[10px]">
          生成成功后将在下方自动打开结果工作台。
        </p>
      </div>
    </section>
  );
}
