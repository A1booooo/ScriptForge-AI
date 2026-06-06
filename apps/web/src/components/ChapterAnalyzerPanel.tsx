import { useMemo } from "react";

import {
  analyzeChapterAdaptation,
  type SubmittedSourceSnapshot
} from "../lib/chapterAnalysis";
import type { ScreenplayDocument } from "@scriptforge/shared";

interface ChapterAnalyzerPanelProps {
  sourceSnapshot: SubmittedSourceSnapshot;
  screenplay: ScreenplayDocument;
}

function SectionList({
  title,
  items
}: {
  title: string;
  items: string[];
}) {
  return (
    <section className="space-y-3 border border-zinc-800 bg-black/20 px-4 py-4">
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-zinc-100">{title}</h4>
      </div>
      <ul className="space-y-2 text-sm leading-6 text-zinc-300">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function ChapterAnalyzerPanel({
  sourceSnapshot,
  screenplay
}: ChapterAnalyzerPanelProps) {
  const analysis = useMemo(
    () =>
      analyzeChapterAdaptation({
        sourceSnapshot,
        screenplay
      }),
    [screenplay, sourceSnapshot]
  );

  return (
    <section className="panel-enter overflow-hidden border border-zinc-800 bg-zinc-950/85 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
      <div className="border-b border-zinc-800 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs tracking-[0.22em] text-zinc-500 uppercase">
              Chapter Analyzer
            </p>
            <h3 className="text-sm font-semibold text-zinc-100">
              Deterministic adaptation summary from the submitted source snapshot
            </h3>
          </div>
          <span className="border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[11px] tracking-[0.18em] text-amber-100 uppercase">
            Demo analysis
          </span>
        </div>
      </div>

      <div className="border-b border-zinc-900 bg-black/20 px-5 py-3 text-sm leading-6 text-zinc-400">
        This panel is deterministic Demo analysis only. It uses the submitted source snapshot plus generated screenplay references, without real LLM reasoning.
      </div>

      <div className="grid gap-3 border-b border-zinc-900 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-zinc-800 bg-zinc-950/70 px-4 py-4">
          <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
            Source Snapshot
          </p>
          <p className="mt-2 text-sm font-medium text-zinc-100">
            {analysis.sourceTitle}
          </p>
        </div>
        <div className="border border-zinc-800 bg-zinc-950/70 px-4 py-4">
          <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
            Mode
          </p>
          <p className="mt-2 text-sm font-medium text-zinc-100">
            {analysis.adaptationMode}
          </p>
        </div>
        <div className="border border-zinc-800 bg-zinc-950/70 px-4 py-4">
          <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
            Coverage
          </p>
          <p className="mt-2 text-sm font-medium text-zinc-100">
            {analysis.coveredChapterCount} / {analysis.chapterCount} explicit refs
          </p>
        </div>
        <div className="border border-zinc-800 bg-zinc-950/70 px-4 py-4">
          <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
            Scene Count
          </p>
          <p className="mt-2 text-sm font-medium text-zinc-100">
            {analysis.sceneCount}
          </p>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5">
        <SectionList title="Adaptation Summary" items={analysis.adaptationChoices} />

        <section className="space-y-3 border border-zinc-800 bg-black/20 px-4 py-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-zinc-100">
              Chapter Coverage
            </h4>
            <p className="text-sm leading-6 text-zinc-400">
              Coverage only uses explicit chapter references from generated screenplay fields.
            </p>
          </div>

          <div className="space-y-3">
            {analysis.coverage.map((chapter) => (
              <article
                key={chapter.chapterId}
                className="border border-zinc-800 bg-zinc-950/70 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h5 className="text-sm font-semibold text-zinc-100">
                      {chapter.chapterTitle}
                    </h5>
                    <p className="text-xs tracking-[0.16em] text-zinc-500 uppercase">
                      {chapter.chapterId}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-[11px] tracking-[0.18em] uppercase ${
                      chapter.status === "covered"
                        ? "border border-emerald-400/40 bg-emerald-400/10 text-emerald-100"
                        : "border border-amber-400/40 bg-amber-400/10 text-amber-100"
                    }`}
                  >
                    {chapter.status === "covered"
                      ? "Explicitly covered"
                      : "No explicit reference"}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-300">
                  {chapter.summary}
                </p>
                <ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-400">
                  {chapter.evidence.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <SectionList
          title="Missing Conflicts"
          items={analysis.missingConflicts}
        />
        <SectionList
          title="Scene Opportunities"
          items={analysis.sceneOpportunities}
        />
      </div>
    </section>
  );
}
