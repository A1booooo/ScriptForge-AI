import { useMemo } from "react";
import { CheckCircle, AlertTriangle, XCircle, ShieldCheck } from "lucide-react";
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
    return "border border-[rgba(196,82,82,0.28)] bg-[rgba(196,82,82,0.04)] text-[#8e4343]";
  }

  if (status === "warning") {
    return "border border-[rgba(216,155,43,0.32)] bg-[rgba(216,155,43,0.04)] text-[#996a14]";
  }

  return "border border-[rgba(61,139,109,0.32)] bg-[rgba(61,139,109,0.04)] text-[#2d7257]";
}

export function PreviewChecksPanel({ screenplay }: PreviewChecksPanelProps) {
  const checks = useMemo(() => getScreenplayPreviewChecks(screenplay), [screenplay]);

  return (
    <section className="reading-panel overflow-hidden rounded-[0.25rem]">
      <div className="border-b border-[var(--line-soft)] px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="section-kicker flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />
              预览检查
            </p>
            <h3 className="text-base font-bold text-[var(--text-strong)]">
              轻量级剧本结构与角色引用审查
            </h3>
          </div>
          <div className="text-right text-xs leading-5 text-[var(--text-muted)] font-mono">
            <p>{checks.summary.passed} 通过</p>
            <p>{checks.summary.failed} 失败</p>
          </div>
        </div>
      </div>

      <div className="border-b border-[var(--line-soft)] bg-[var(--bg-paper-soft)] px-6 py-3 text-xs leading-5 text-[var(--text-muted)]">
        预览检查仍为轻量级面板。共享校验器运行时尚未接入此 UI。
      </div>

      <div className="space-y-4 px-6 py-6">
        {checks.items.map((item) => {
          const isFail = item.status === "fail";
          const isWarning = item.status === "warning";
          const Icon = isFail ? XCircle : isWarning ? AlertTriangle : CheckCircle;

          return (
            <article
              key={item.id}
              className={`rounded-[0.25rem] px-5 py-5 flex gap-3 ${getStatusClasses(item.status)}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-grow">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h4 className="text-sm font-bold">{item.label}</h4>
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    {item.status === "pass" ? "通过" : item.status === "fail" ? "失败" : "警告"}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5">{item.summary}</p>
                {item.details.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs leading-5 list-disc list-inside border-t border-[rgba(118,107,95,0.12)] pt-2">
                    {item.details.map((detail) => (
                      <li key={detail} className="marker:text-current/60">{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
