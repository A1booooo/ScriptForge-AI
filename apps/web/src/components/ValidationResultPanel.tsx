import { useMemo } from "react";
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

interface IssueGroupProps {
  title: string;
  successMessage: string;
  issues: ValidationIssue[];
}

function IssueGroup({ title, successMessage, issues }: IssueGroupProps) {
  if (issues.length === 0 && !successMessage) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-[var(--text-strong)] uppercase tracking-wider border-b border-[var(--line-soft)] pb-1.5">
        {title}
      </h4>
      {issues.length === 0 ? (
        <div className="rounded-[0.25rem] border border-[rgba(61,139,109,0.25)] bg-[rgba(61,139,109,0.02)] px-4 py-3 text-[#2d7257] flex items-center gap-2 text-xs leading-5">
          <CheckCircle className="w-4 h-4 text-[var(--color-accent-emerald)] flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue, index) => (
            <article
              key={`${issue.source}-${issue.code}-${issue.path}-${index}`}
              className={`rounded-[0.25rem] px-4 py-4 flex gap-3 ${getIssueClasses(issue)}`}
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h5 className="text-sm font-bold font-mono">{issue.code}</h5>
                    <p className="mt-1 text-[10px] tracking-wider uppercase text-current/80 font-mono">
                      路径: {issue.path}
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
    </div>
  );
}

export function ValidationResultPanel({
  validationResult
}: ValidationResultPanelProps) {
  const { issues, summary } = validationResult;

  const groupedIssues = useMemo(() => {
    return {
      parse: issues.filter((i) => i.source === "parse"),
      schema: issues.filter((i) => i.source === "schema"),
      consistency: issues.filter((i) => i.source === "consistency"),
      other: issues.filter((i) => !["parse", "schema", "consistency"].includes(i.source))
    };
  }, [issues]);

  return (
    <section className="reading-panel overflow-hidden rounded-[0.25rem]">
      <div className="border-b border-[var(--line-soft)] px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="section-kicker">结构校验详情</p>
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

      <div className="space-y-6 px-6 py-6">
        <IssueGroup
          title="语法检查"
          successMessage="格式正确，无语法错误。"
          issues={groupedIssues.parse}
        />
        <IssueGroup
          title="Schema 检查"
          successMessage="属性字段完整，符合结构规范。"
          issues={groupedIssues.schema}
        />
        <IssueGroup
          title="一致性检查"
          successMessage="角色、地点及源章节引用完整且一致。"
          issues={groupedIssues.consistency}
        />
        {groupedIssues.other.length > 0 && (
          <IssueGroup
            title="其他问题"
            successMessage=""
            issues={groupedIssues.other}
          />
        )}
      </div>
    </section>
  );
}
