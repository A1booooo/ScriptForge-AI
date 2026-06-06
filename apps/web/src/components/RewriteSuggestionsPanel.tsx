import type { RewriteSuggestionsResult } from "../lib/rewriteSuggestions";

interface RewriteSuggestionsPanelProps {
  suggestions: RewriteSuggestionsResult;
}

export function RewriteSuggestionsPanel({
  suggestions
}: RewriteSuggestionsPanelProps) {
  return (
    <section className="panel-enter overflow-hidden border border-zinc-800 bg-zinc-950/80 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
      <div className="border-b border-zinc-800 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs tracking-[0.22em] text-zinc-500 uppercase">
              {suggestions.title}
            </p>
            <h3 className="text-sm font-semibold text-zinc-100">
              Deterministic improvement suggestions from generated-draft signals
            </h3>
          </div>
          <span className="border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-[11px] tracking-[0.18em] text-emerald-100 uppercase">
            {suggestions.badgeLabel}
          </span>
        </div>
      </div>

      <div className="border-b border-zinc-900 bg-black/20 px-5 py-3 text-sm leading-6 text-zinc-400">
        {suggestions.description}
      </div>

      <div className="grid gap-3 px-5 py-5">
        {suggestions.suggestions.map((suggestion) => (
          <article
            key={`${suggestion.mode}-${suggestion.target}`}
            className="space-y-3 border border-zinc-800 bg-black/20 px-4 py-4"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
                  Mode
                </p>
                <p className="text-sm font-semibold text-zinc-100">
                  {suggestion.mode}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
                  Target
                </p>
                <p className="text-sm font-semibold text-zinc-100">
                  {suggestion.target}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
                Reason
              </p>
              <p className="text-sm leading-6 text-zinc-300">
                {suggestion.reason}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
                Signal source
              </p>
              <p className="text-sm leading-6 text-zinc-400">
                {suggestion.signalSource}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
