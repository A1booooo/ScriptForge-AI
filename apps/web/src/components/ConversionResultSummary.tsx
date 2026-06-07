import { AlertTriangle } from "lucide-react";
import type { ConversionResponse } from "../types";

interface ConversionResultSummaryProps {
  result: ConversionResponse;
}

export function ConversionResultSummary({ result }: ConversionResultSummaryProps) {
  return (
    <div className="bg-[var(--bg-paper)] border border-[var(--line-soft)] rounded-[0.25rem] p-6 shadow-[var(--shadow-soft)]">
      <div className="space-y-2 border-b border-[var(--line-soft)] pb-4">
        <p className="section-kicker">Conversion Ready</p>
        <h4 className="text-lg font-bold text-[var(--text-strong)]">
          结构化剧本草稿已生成
        </h4>
        <p className="text-xs text-[var(--text-muted)]">
          The generated draft, YAML contract, and draft references are now ready for review.
        </p>
      </div>

      <dl className="mt-4 grid gap-4 grid-cols-2 md:grid-cols-4 border-b border-[var(--line-soft)] pb-4">
        <div>
          <dt className="text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">Conversion ID</dt>
          <dd className="mt-1 text-sm font-semibold text-[var(--text-strong)]">{result.conversion_id}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">Source</dt>
          <dd className="mt-1 text-sm font-semibold text-[var(--text-strong)]">{result.source}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">Chapter Count</dt>
          <dd className="mt-1 text-sm font-semibold text-[var(--text-strong)]">{result.input_summary.chapter_count}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">Screenplay Title</dt>
          <dd className="mt-1 text-sm font-semibold text-[var(--text-strong)] truncate">{result.screenplay.metadata.title}</dd>
        </div>
      </dl>

      {result.warnings.length > 0 && (
        <div className="mt-4 rounded-[0.25rem] border border-[rgba(216,155,43,0.32)] bg-[rgba(216,155,43,0.04)] p-4 flex gap-2">
          <AlertTriangle className="w-4 h-4 text-[#996a14] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold tracking-wider text-[#996a14] uppercase">
              Response notes
            </p>
            <ul className="mt-2 space-y-1 text-xs text-[#76572a] list-disc list-inside">
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
