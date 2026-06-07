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
              T15：真实 LLM 转换工作台
            </p>
            <p>
              当前主链路已接入真实 LLM conversion，生成结果会先经过 shared schema 校验与一致性检查。
            </p>
            <p className="text-xs text-[var(--text-muted)] border-t border-[var(--line-soft)] pt-2 mt-2">
              输入至少三个源章节，选择改编模式，并通过真实的 LLM 流程生成结构化的剧本草稿。
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
