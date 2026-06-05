import type { MockConversionResponse } from "../types";

interface ConversionResultSummaryProps {
  result: MockConversionResponse;
}

function SummaryItem({
  label,
  value
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="border border-zinc-800 bg-zinc-950/70 px-4 py-4">
      <dt className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
        {label}
      </dt>
      <dd className="mt-2 text-sm font-medium text-zinc-100">{value}</dd>
    </div>
  );
}

export function ConversionResultSummary({
  result
}: ConversionResultSummaryProps) {
  return (
    <section className="panel-enter space-y-4 border border-emerald-500/30 bg-emerald-500/8 p-5 text-zinc-100 shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
      <div className="space-y-2">
        <p className="text-xs tracking-[0.18em] text-emerald-300 uppercase">
          Success
        </p>
        <h2 className="text-xl font-semibold text-white">Mock 剧本草稿已生成</h2>
        <p className="text-sm leading-6 text-emerald-100/80">
          当前仅展示请求结果摘要，完整 YAML、校验结果和场景视图留给后续任务。
        </p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <SummaryItem label="Conversion ID" value={result.conversion_id} />
        <SummaryItem label="Mock" value={result.mock ? "是" : "否"} />
        <SummaryItem
          label="章节数量"
          value={result.input_summary.chapter_count}
        />
        <SummaryItem
          label="Screenplay Title"
          value={result.screenplay.metadata.title}
        />
      </dl>
    </section>
  );
}
