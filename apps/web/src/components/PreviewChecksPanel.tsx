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

function translateSummary(summary: string): string {
  let text = summary;
  text = text.replace("One or more required top-level sections are missing.", "缺少一个或多个必需的顶层部分。");
  text = text.replace("All required top-level sections are present.", "所有必需的顶层部分均已存在。");
  text = text.replace("The screenplay has no scenes to preview.", "剧本草稿中没有可以预览的场景。");
  text = text.replace(/(\d+) scene\(s\) available for preview\./, "$1 个场景可供快速审查。");
  text = text.replace("Some scene references do not resolve to shared character or location entries.", "部分场景引用的角色或地点在声明列表中不存在。");
  text = text.replace("Scene character and location references resolve successfully.", "场景引用的角色和地点均成功解析。");
  return text;
}

function translateDetail(detail: string): string {
  let text = detail;
  text = text.replace("Missing section: ", "缺少部分：");
  text = text.replace("Found section: ", "包含部分：");
  text = text.replace("Add at least one scene before using the screenplay preview panels.", "在可编辑 YAML 中添加至少一个场景以启用快速审查。");
  text = text.replace("Scene ready: ", "场景就绪：");
  text = text.replace(/Scene (\S+) references missing location (\S+)\./, "场景 $1 引用了不存在的地点 $2。");
  text = text.replace(/Scene (\S+) references missing character (\S+)\./, "场景 $1 引用了不存在的角色 $2。");
  text = text.replace(/(\d+) character reference target\(s\) available\./, "$1 个角色声明可用。");
  text = text.replace(/(\d+) location reference target\(s\) available\./, "$1 个地点声明可用。");
  return text;
}

export function PreviewChecksPanel({ screenplay }: PreviewChecksPanelProps) {
  const checks = useMemo(() => getScreenplayPreviewChecks(screenplay), [screenplay]);

  const labelMap: Record<string, string> = {
    "Top-level structure": "顶层结构完整性",
    "Scene availability": "场景可用性审查",
    "Reference consistency": "引用一致性自检"
  };

  return (
    <section className="reading-panel overflow-hidden rounded-[0.25rem]">
      <div className="border-b border-[var(--line-soft)] px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="section-kicker flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />
              结构校验
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
        此面板在前端对生成草稿的基本格式和交叉引用做轻量自检。
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
                  <h4 className="text-sm font-bold">{labelMap[item.label] || item.label}</h4>
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    {item.status === "pass" ? "通过" : item.status === "fail" ? "失败" : "警告"}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5">{translateSummary(item.summary)}</p>
                {item.details.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs leading-5 list-disc list-inside border-t border-[rgba(118,107,95,0.12)] pt-2">
                    {item.details.map((detail) => (
                      <li key={detail} className="marker:text-current/60">{translateDetail(detail)}</li>
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
