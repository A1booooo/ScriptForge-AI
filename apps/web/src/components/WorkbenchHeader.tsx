export function WorkbenchHeader() {
  return (
    <header className="border border-zinc-800 bg-zinc-950/70 px-5 py-6 shadow-[0_20px_60px_rgba(0,0,0,0.32)] backdrop-blur-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs tracking-[0.28em] text-zinc-500 uppercase">
            ScriptForge AI / 剧本工坊
          </p>
          <div className="space-y-2">
            <h1 className="font-['Iowan_Old_Style','Source_Han_Serif_SC','Noto_Serif_SC',serif] text-3xl leading-tight text-white sm:text-4xl">
              ScriptForge AI 剧本工坊
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
              把小说章节转换为可编辑、可校验的结构化剧本草稿。
            </p>
          </div>
        </div>

        <div className="space-y-2 text-left lg:max-w-sm lg:text-right">
          <p className="text-sm font-medium text-zinc-100">
            T04：章节输入工作台 · Mock API
          </p>
          <p className="text-sm leading-6 text-zinc-500">
            将 3 个以上小说章节提交到 mock conversion API，生成结构化剧本草稿摘要。
          </p>
          <p className="text-xs tracking-[0.14em] text-zinc-600 uppercase">
            当前为 Mock API 演示链路，尚未接入真实 LLM。
          </p>
        </div>
      </div>
    </header>
  );
}
