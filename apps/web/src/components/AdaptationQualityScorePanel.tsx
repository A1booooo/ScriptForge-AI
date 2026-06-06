import type { AdaptationQualityScoreResult } from "../lib/adaptationQualityScore";

interface AdaptationQualityScorePanelProps {
  score: AdaptationQualityScoreResult;
}

export function AdaptationQualityScorePanel({
  score
}: AdaptationQualityScorePanelProps) {
  return (
    <section className="panel-enter overflow-hidden border border-zinc-800 bg-zinc-950/80 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
      <div className="border-b border-zinc-800 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs tracking-[0.22em] text-zinc-500 uppercase">
              {score.title}
            </p>
            <h3 className="text-sm font-semibold text-zinc-100">
              {score.overall.label}
            </h3>
          </div>
          <span className="border border-sky-400/40 bg-sky-400/10 px-3 py-1 text-[11px] tracking-[0.18em] text-sky-100 uppercase">
            {score.badgeLabel}
          </span>
        </div>
      </div>

      <div className="border-b border-zinc-900 bg-black/20 px-5 py-3 text-sm leading-6 text-zinc-400">
        {score.description}
      </div>

      <div className="border-b border-zinc-900 px-5 py-5">
        <div className="flex items-end justify-between gap-4 border border-zinc-800 bg-zinc-950/70 px-4 py-4">
          <div className="space-y-2">
            <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
              Overall score
            </p>
            <p className="text-3xl font-semibold text-zinc-100">
              {score.overall.score}
            </p>
          </div>
          <p className="max-w-md text-sm leading-6 text-zinc-400">
            {score.overall.reason}
          </p>
        </div>
      </div>

      <div className="grid gap-3 px-5 py-5 sm:grid-cols-2">
        {score.dimensions.map((dimension) => (
          <article
            key={dimension.id}
            className="space-y-3 border border-zinc-800 bg-black/20 px-4 py-4"
          >
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-sm font-semibold text-zinc-100">
                {dimension.label}
              </h4>
              <span className="text-lg font-semibold text-zinc-100">
                {dimension.score}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
                Reason
              </p>
              <p className="text-sm leading-6 text-zinc-300">
                {dimension.reason}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
                Signal source
              </p>
              <p className="text-sm leading-6 text-zinc-400">
                {dimension.signalSource}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
