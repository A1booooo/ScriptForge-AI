import { useMemo } from "react";
import type { ScreenplayDocument } from "@scriptforge/shared";

import {
  getScreenplayPreviewChecks,
  type PreviewCheckItem
} from "../lib/screenplayPreviewChecks";

interface PreviewChecksPanelProps {
  screenplay: ScreenplayDocument;
}

function getStatusClasses(status: PreviewCheckItem["status"]) {
  if (status === "fail") {
    return "border-rose-500/40 bg-rose-500/10 text-rose-100";
  }

  if (status === "warning") {
    return "border-amber-500/40 bg-amber-500/10 text-amber-100";
  }

  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-100";
}

function getStatusLabel(status: PreviewCheckItem["status"]) {
  if (status === "fail") {
    return "Fail";
  }

  if (status === "warning") {
    return "Warn";
  }

  return "Pass";
}

export function PreviewChecksPanel({ screenplay }: PreviewChecksPanelProps) {
  const checks = useMemo(() => getScreenplayPreviewChecks(screenplay), [screenplay]);

  return (
    <section className="panel-enter overflow-hidden border border-zinc-800 bg-zinc-950/80 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
      <div className="border-b border-zinc-800 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs tracking-[0.22em] text-zinc-500 uppercase">
              Preview Checks
            </p>
            <h3 className="text-sm font-semibold text-zinc-100">
              Lightweight structure and reference review
            </h3>
          </div>
          <div className="text-right text-xs text-zinc-500">
            <p>{checks.summary.passed} pass</p>
            <p>{checks.summary.failed} fail</p>
          </div>
        </div>
      </div>

      <div className="border-b border-zinc-900 bg-black/20 px-5 py-3 text-sm leading-6 text-zinc-400">
        Full schema validator planned for later.
      </div>

      <div className="space-y-3 px-5 py-5">
        {checks.items.map((item) => (
          <article
            key={item.id}
            className={`border px-4 py-4 ${getStatusClasses(item.status)}`}
          >
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-sm font-semibold">{item.label}</h4>
              <span className="text-[11px] tracking-[0.18em] uppercase">
                {getStatusLabel(item.status)}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6">{item.summary}</p>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-current/80">
              {item.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
