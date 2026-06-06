import {
  DEMO_SAMPLE_BADGE_LABEL,
  DEMO_SAMPLE_NOTE
} from "../lib/demoFixtures";
import type { MockConversionResponse } from "../types";

interface ConversionResultSummaryProps {
  isDemoSample: boolean;
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
  isDemoSample,
  result
}: ConversionResultSummaryProps) {
  return (
    <section className="panel-enter space-y-4 border border-zinc-800 bg-zinc-950/80 p-5 text-zinc-100 shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
      <div className="space-y-2">
        <p className="text-xs tracking-[0.18em] text-zinc-500 uppercase">
          Conversion Ready
        </p>
        <h2 className="text-xl font-semibold text-white">
          Mock screenplay draft generated
        </h2>
        <p className="text-sm leading-6 text-zinc-400">
          The result panel now separates generated YAML, editable YAML, validation status, and generated-draft reference views.
        </p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <SummaryItem label="Conversion ID" value={result.conversion_id} />
        <SummaryItem label="Mock" value={result.mock ? "Yes" : "No"} />
        <SummaryItem
          label="Chapter Count"
          value={result.input_summary.chapter_count}
        />
        <SummaryItem
          label="Screenplay Title"
          value={result.screenplay.metadata.title}
        />
      </dl>

      {isDemoSample ? (
        <div className="border border-amber-500/30 bg-amber-500/10 px-4 py-4">
          <p className="text-xs tracking-[0.18em] text-amber-200 uppercase">
            {DEMO_SAMPLE_BADGE_LABEL}
          </p>
          <p className="mt-2 text-sm leading-6 text-amber-100/85">
            {DEMO_SAMPLE_NOTE}
          </p>
        </div>
      ) : null}

      {result.warnings.length > 0 ? (
        <div className="border border-amber-500/30 bg-amber-500/10 px-4 py-4">
          <p className="text-xs tracking-[0.18em] text-amber-200 uppercase">
            Mock response notes
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-100/85">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
