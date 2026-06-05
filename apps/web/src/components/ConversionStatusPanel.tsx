import type { SubmissionState } from "../types";

interface ConversionStatusPanelProps {
  state: SubmissionState;
  errorMessage: string | null;
}

const panelClasses =
  "panel-enter border p-5 transition duration-200 ease-out";

export function ConversionStatusPanel({
  state,
  errorMessage
}: ConversionStatusPanelProps) {
  if (state === "loading") {
    return (
      <section
        className={`${panelClasses} border-zinc-700 bg-zinc-950/80 opacity-100`}
      >
        <p className="text-xs tracking-[0.18em] text-zinc-500 uppercase">
          Loading
        </p>
        <h2 className="mt-3 text-lg font-semibold text-zinc-100">
          正在提交章节到 mock conversion API...
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          请求发送后，这里会展示成功摘要或结构化错误提示。
        </p>
      </section>
    );
  }

  if (state === "error") {
    return (
      <section
        aria-live="polite"
        className={`${panelClasses} border-amber-500/40 bg-amber-500/10 text-zinc-100 opacity-100`}
      >
        <p className="text-xs tracking-[0.18em] text-amber-300 uppercase">
          Error
        </p>
        <h2 className="mt-3 text-lg font-semibold text-white">
          提交失败，请检查章节内容或稍后重试
        </h2>
        <p className="mt-2 text-sm leading-6 text-amber-100/85">
          {errorMessage}
        </p>
      </section>
    );
  }

  return (
    <section
      className={`${panelClasses} border-zinc-800 bg-zinc-950/70 opacity-100`}
    >
      <p className="text-xs tracking-[0.18em] text-zinc-500 uppercase">Idle</p>
      <h2 className="mt-3 text-lg font-semibold text-zinc-100">
        等待生成 mock 剧本摘要
      </h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">
        请先填写项目标题、选择改编模式，并补全至少 3 个章节后提交。
      </p>
    </section>
  );
}
