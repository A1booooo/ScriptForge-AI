export function WorkbenchHeader() {
  return (
    <header className="py-8">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-heading text-3xl font-semibold text-[var(--color-primary)] tracking-tight">
              ScriptForge AI
            </span>
            <span className="rounded border border-[var(--line-soft)] bg-[var(--bg-paper-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-muted)]">
              剧本工坊
            </span>
          </div>
          <div className="space-y-3">
            <h1 className="font-heading text-4xl font-semibold leading-tight text-[var(--text-strong)] sm:text-5xl">
              小说章节到结构化剧本工作台
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-[var(--text-muted)] font-body">
              将小说章节转成可编辑、可校验、可导出的结构化剧本工作台。
            </p>
          </div>
        </div>

        <div className="bg-[var(--bg-paper)] border border-[var(--line-soft)] rounded-[0.25rem] p-5 shadow-[var(--shadow-soft)]">
          <p className="section-kicker">Product Narrative</p>
          <div className="mt-3 space-y-3 text-sm leading-6 text-[var(--text-muted)] font-body">
            <p className="font-semibold text-[var(--text-strong)]">
              T04：章节输入工作台 · Mock API
            </p>
            <p>
              本系统当前为本地 Mock API 演示链路，尚未接入真实大语言模型 (LLM)。
            </p>
            <p className="text-xs text-[var(--text-muted)] border-t border-[var(--line-soft)] pt-2 mt-2">
              Enter at least three source chapters, choose an adaptation mode, and generate a local mock screenplay workspace.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
