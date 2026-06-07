import { CheckCircle, AlertTriangle } from "lucide-react";
import type {
  ScreenplayValidationResult,
  ValidationIssue
} from "@scriptforge/shared";

interface ValidationResultPanelProps {
  validationResult: ScreenplayValidationResult;
}

function getIssueClasses(issue: ValidationIssue) {
  if (issue.severity === "warning") {
    return "border border-[rgba(216,155,43,0.32)] bg-[rgba(216,155,43,0.04)] text-[#996a14]";
  }

  return "border border-[rgba(196,82,82,0.28)] bg-[rgba(196,82,82,0.04)] text-[#8e4343]";
}

export function ValidationResultPanel({
  validationResult
}: ValidationResultPanelProps) {
  const { issues, summary } = validationResult;

  return (
    <section className="reading-panel overflow-hidden rounded-[0.25rem]">
      <div className="border-b border-[var(--line-soft)] px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="section-kicker">校验结果</p>
            <h3 className="text-base font-bold text-[var(--text-strong)]">
              对当前编辑中 YAML 合约的语法、Schema 及一致性实时校验
            </h3>
          </div>
          <div className="text-right text-xs leading-5 text-[var(--text-muted)] font-mono">
            <p>共 {summary.total} 个问题</p>
            <p>{summary.errorCount} 个错误 / {summary.warningCount} 个警告</p>
          </div>
        </div>
      </div>

      <div className="border-b border-[var(--line-soft)] bg-[var(--bg-paper-soft)] px-6 py-3 text-xs leading-5 text-[var(--text-muted)]">
        编辑中的 YAML 将在导出前运行共享运行时校验。在当前 YAML 通过所有检查前，导出按钮将保持禁用。
      </div>

      {validationResult.ok ? (
        <div className="px-6 py-6">
          <article className="rounded-[0.25rem] border border-[rgba(61,139,109,0.32)] bg-[rgba(61,139,109,0.04)] px-5 py-5 text-[#2d7257] flex gap-3">
            <CheckCircle className="w-5 h-5 text-[var(--color-accent-emerald)] flex-shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold">可以导出</h4>
                <span className="text-[10px] tracking-wider uppercase font-semibold">
                  通过
                </span>
              </div>
              <p className="mt-2 text-xs leading-5">当前编辑的 YAML 合约已经通过了解析、Schema 及一致性检查。</p>
            </div>
          </article>
        </div>
      ) : (
        <div className="space-y-4 px-6 py-6">
          {issues.map((issue, index) => (
            <article
              key={`${issue.source}-${issue.code}-${issue.path}-${index}`}
              className={`rounded-[0.25rem] px-5 py-5 flex gap-3 ${getIssueClasses(issue)}`}
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold">{issue.code}</h4>
                    <p className="mt-1 text-[10px] tracking-wider uppercase text-current/80 font-mono">
                      来源: {issue.source} | 路径: {issue.path}
                    </p>
                  </div>
                  <span className="text-[10px] tracking-wider uppercase font-semibold">
                    {issue.severity === "error" ? "错误" : "警告"}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5">{issue.message}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
