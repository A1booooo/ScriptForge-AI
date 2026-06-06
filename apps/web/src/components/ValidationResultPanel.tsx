import type {
  ScreenplayValidationResult,
  ValidationIssue
} from "@scriptforge/shared";

interface ValidationResultPanelProps {
  validationResult: ScreenplayValidationResult;
}

function getIssueClasses(issue: ValidationIssue) {
  if (issue.severity === "warning") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-100";
  }

  return "border-rose-500/30 bg-rose-500/10 text-rose-100";
}

export function ValidationResultPanel({
  validationResult
}: ValidationResultPanelProps) {
  const { issues, summary } = validationResult;

  return (
    <section className="panel-enter overflow-hidden border border-zinc-800 bg-zinc-950/80 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
      <div className="border-b border-zinc-800 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs tracking-[0.22em] text-zinc-500 uppercase">
              Validation Result
            </p>
            <h3 className="text-sm font-semibold text-zinc-100">
              Parse, schema, and consistency checks for the current edited YAML
            </h3>
          </div>
          <div className="text-right text-xs text-zinc-500">
            <p>{summary.total} issue(s)</p>
            <p>{summary.errorCount} error(s)</p>
          </div>
        </div>
      </div>

      <div className="border-b border-zinc-900 bg-black/20 px-5 py-3 text-sm leading-6 text-zinc-400">
        Edited YAML is validated with the shared runtime before export. Export stays disabled until the current YAML passes all checks.
      </div>

      {validationResult.ok ? (
        <div className="px-5 py-5">
          <article className="border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-emerald-100">
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-sm font-semibold">Ready to export</h4>
              <span className="text-[11px] tracking-[0.18em] uppercase">
                Pass
              </span>
            </div>
            <p className="mt-2 text-sm leading-6">
              The current edited YAML passed parse, schema, and consistency checks.
            </p>
          </article>
        </div>
      ) : (
        <div className="space-y-3 px-5 py-5">
          {issues.map((issue, index) => (
            <article
              key={`${issue.source}-${issue.code}-${issue.path}-${index}`}
              className={`border px-4 py-4 ${getIssueClasses(issue)}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold">{issue.code}</h4>
                  <p className="mt-1 text-xs tracking-[0.18em] uppercase text-current/70">
                    {issue.source} · {issue.path}
                  </p>
                </div>
                <span className="text-[11px] tracking-[0.18em] uppercase">
                  {issue.severity}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6">{issue.message}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
