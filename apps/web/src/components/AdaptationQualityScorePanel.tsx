import type { AdaptationQualityScoreResult } from "../lib/adaptationQualityScore";

interface AdaptationQualityScorePanelProps {
  score?: AdaptationQualityScoreResult;
}

const dimensionLabels: Record<string, string> = {
  "Structure": "结构就绪度",
  "Character Coverage": "角色覆盖度",
  "Conflict Clarity": "冲突清晰度",
  "Schema Completeness": "Schema 完整度"
};

function translateStructureReason(reason: string): string {
  if (reason === "The generated draft has no scenes, so the current structure readiness is incomplete.") {
    return "生成的草稿没有场景，因此当前结构就绪度不完整。";
  }
  const match = reason.match(/The generated draft currently maps (\d+) source chapter\(s\) into (\d+) scene\(s\), with (\d+)\/(\d+) scene\(s\) carrying beats and (\d+) merged scene\(s\)\./);
  if (match) {
    const [, chapters, scenes, beats, totalScenes, merged] = match;
    return `当前生成的草稿将 ${chapters} 个源章节映射为 ${scenes} 个场景，其中 ${beats}/${totalScenes} 个场景包含 beats，且有 ${merged} 个合并场景。`;
  }
  return reason;
}

function translateCharacterCoverageReason(reason: string): string {
  let text = reason;
  text = text.replace("Every generated character currently has at least one scene appearance.", "所有生成的角色当前都至少在一个场景中出现。");
  text = text.replace(/(\d+) generated character\(s\) have no scene appearance\./, "$1 个生成的角色没有在场景中出现。");
  text = text.replace(/(\d+) character\(s\) also have no dialogue presence in the generated draft\./, "$1 个角色在生成的草稿中也没有对话。");
  text = text.replace(/(\d+) source chapter\(s\) remain unreferenced in the current Chapter Analyzer coverage pass\./, "$1 个源章节在当前的章节分析覆盖率检查中仍未被引用。");
  return text;
}

function translateConflictClarityReason(reason: string): string {
  let text = reason;
  text = text.replace("Every generated scene currently includes an explicit conflict field.", "每个生成的场景当前都包含明确的冲突字段。");
  text = text.replace(/(\d+) generated scene\(s\) currently lack a scene conflict field\./, "$1 个生成的场景当前缺少场景冲突字段。");
  text = text.replace(/T10 Chapter Analyzer still flags (\d+) missing conflicts from deterministic source-to-draft checks\./, "章节分析器在确定性源到草稿校验中仍标记了 $1 个缺失的冲突。");
  return text;
}

function translateSchemaCompletenessReason(reason: string): string {
  if (reason === "Validation currently passes without parse, schema, or consistency issues.") {
    return "校验当前已通过，没有解析、Schema 或一致性问题。";
  }
  const match = reason.match(/The current validation state reports (\d+) issue\(s\), including (\d+) error\(s\) and (\d+) warning\(s\)\./);
  if (match) {
    const [, total, errors, warnings] = match;
    return `当前校验状态报告了 ${total} 个问题，包括 ${errors} 个错误 and ${warnings} 个警告。`;
  }
  return reason;
}

function translateDimensionReason(id: string, reason: string): string {
  switch (id) {
    case "structure":
      return translateStructureReason(reason);
    case "character-coverage":
      return translateCharacterCoverageReason(reason);
    case "conflict-clarity":
      return translateConflictClarityReason(reason);
    case "schema-completeness":
      return translateSchemaCompletenessReason(reason);
    default:
      return reason;
  }
}

export function AdaptationQualityScorePanel({
  score
}: AdaptationQualityScorePanelProps) {
  const percent = score?.overall?.score ?? 0;
  const dashArray = `${percent}, 100`;

  const title = score?.title ?? "结构评分";
  const badgeLabel = score?.badgeLabel ?? "结构就绪度评分";
  const overallLabel = score?.overall?.label ?? "结构就绪度";
  const description = score?.description ?? "";
  const overallReason = score?.overall?.reason ?? "";

  const dimensions = score?.dimensions ?? [];

  return (
    <div className="score-gauge-card">
      <div className="w-full border-b border-[var(--line-soft)] pb-4 mb-4 flex justify-between items-start">
        <div className="text-left">
          <p className="section-kicker">{title}</p>
          <h4 className="text-base font-semibold text-[var(--text-strong)] mt-0.5">
            {overallLabel}
          </h4>
        </div>
        <span className="rounded border border-[rgba(76,143,214,0.32)] bg-[rgba(76,143,214,0.08)] px-2.5 py-0.5 text-xs font-semibold text-[#3f75b1] uppercase">
          {badgeLabel}
        </span>
      </div>

      <p className="text-xs text-[var(--text-muted)] w-full text-left leading-relaxed mb-4">
        {description}
      </p>

      {/* Premium Circular SVG Gauge */}
      <div className="relative w-32 h-32 flex items-center justify-center mb-4">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-[var(--bg-paper-soft)]"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="text-[var(--color-accent-emerald)] animate-[dash_1s_ease-out]"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeDasharray={dashArray}
            strokeWidth="3"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-4xl font-semibold text-[var(--text-strong)]">
            {percent}
          </span>
          <span className="text-[10px] text-[var(--color-accent-emerald)] font-bold uppercase tracking-wider mt-0.5">
            {overallLabel}
          </span>
        </div>
      </div>

      <p className="text-xs text-[var(--text-muted)] italic max-w-xs leading-5">
        {overallReason}
      </p>

      <div className="w-full border-t border-[var(--line-soft)] pt-4 mt-4 space-y-4 text-left">
        <h5 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
          评分维度
        </h5>
        <div className="grid gap-3 grid-cols-1">
          {dimensions.map((dimension) => (
            <div key={dimension.id} className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-[var(--text-strong)]">
                  {dimensionLabels[dimension.label] || dimension.label}
                </span>
                <span className="text-[var(--color-accent-emerald)]">{dimension.score}</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                {translateDimensionReason(dimension.id, dimension.reason)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
