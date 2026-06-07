import { BarChart, BookOpen, AlertCircle, Lightbulb } from "lucide-react";
import type { ChapterAnalysisResult } from "../lib/chapterAnalysis";

interface ChapterAnalyzerPanelProps {
  analysis: ChapterAnalysisResult;
}

function SectionList({
  title,
  items,
  icon: Icon
}: {
  title: string;
  items: string[];
  icon: any;
}) {
  return (
    <div className="studio-report-item space-y-3">
      <h4 className="text-sm font-bold text-[var(--text-strong)] flex items-center gap-1.5 uppercase tracking-wider">
        <Icon className="w-4 h-4 text-[var(--color-primary)]" />
        {title}
      </h4>
      <ul className="space-y-1.5 text-sm leading-6 text-[var(--text-muted)] list-disc list-inside">
        {items.map((item) => (
          <li key={item} className="marker:text-[var(--color-primary)]">{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function ChapterAnalyzerPanel({ analysis }: ChapterAnalyzerPanelProps) {
  const modeLabels: Record<string, string> = {
    faithful: "忠实改编",
    dramatic: "戏剧强化",
    short_drama: "微短剧化"
  };

  return (
    <div className="space-y-6">
      <div className="studio-report-panel-header flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="section-kicker flex items-center gap-1.5">
            <BarChart className="w-4 h-4 text-[var(--color-primary)]" />
            结构分析
          </p>
          <h3 className="text-xl font-bold text-[var(--text-strong)]">
            基于提交源章节的结构分析
          </h3>
        </div>
        <span className="rounded border border-[rgba(216,155,43,0.38)] bg-[rgba(216,155,43,0.08)] px-2.5 py-0.5 text-xs font-semibold text-[#996a14] uppercase">
          结构化规则分析
        </span>
      </div>

      <div className="bg-[var(--bg-paper-soft)] border border-[var(--line-soft)] rounded-[0.25rem] px-5 py-4 text-xs leading-6 text-[var(--text-muted)]">
        此面板基于提交的源章节及生成的剧本结构进行确定性规则分析，不涉及模型二次创作推理。
      </div>

      {/* Snapshot Overview Strip */}
      <dl className="grid gap-4 grid-cols-2 md:grid-cols-4 border-b border-[var(--line-soft)] pb-6 mt-4">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">源章节项目</span>
          <p className="mt-1 text-sm font-semibold text-[var(--text-strong)]">{analysis.sourceTitle}</p>
        </div>
        <div>
          <span className="text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">改编模式</span>
          <p className="mt-1 text-sm font-semibold text-[var(--text-strong)]">{modeLabels[analysis.adaptationMode] || analysis.adaptationMode}</p>
        </div>
        <div>
          <span className="text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">章节覆盖度</span>
          <p className="mt-1 text-sm font-semibold text-[var(--text-strong)]">{analysis.coveredChapterCount} / {analysis.chapterCount} 章</p>
        </div>
        <div>
          <span className="text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">场景数量</span>
          <p className="mt-1 text-sm font-semibold text-[var(--text-strong)]">{analysis.sceneCount}</p>
        </div>
      </dl>

      <div className="space-y-6">
        <SectionList title="改编方式说明" items={analysis.adaptationChoices} icon={BookOpen} />

        {/* Chapter Coverage Report */}
        <div className="studio-report-item space-y-4">
          <h4 className="text-sm font-bold text-[var(--text-strong)] flex items-center gap-1.5 uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-[var(--color-primary)]" />
            章节覆盖详情
          </h4>
          <p className="text-xs text-[var(--text-muted)]">
            覆盖率分析仅基于生成剧本字段中的显式章节引用。
          </p>

          <div className="space-y-4">
            {analysis.coverage.map((chapter) => (
              <div
                key={chapter.chapterId}
                className="p-4 rounded-[0.25rem] bg-[var(--bg-paper-soft)] border border-[var(--line-soft)] space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h5 className="text-sm font-bold text-[var(--text-strong)]">
                      {chapter.chapterTitle}
                    </h5>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      {chapter.chapterId}
                    </span>
                  </div>
                  <span
                    className={`rounded px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      chapter.status === "covered"
                        ? "border border-[rgba(61,139,109,0.32)] bg-[rgba(61,139,109,0.08)] text-[#2d7257]"
                        : "border border-[rgba(216,155,43,0.32)] bg-[rgba(216,155,43,0.08)] text-[#996a14]"
                    }`}
                  >
                    {chapter.status === "covered"
                      ? "已显式覆盖"
                      : "未显式引用"}
                  </span>
                </div>
                <p className="text-xs leading-5 text-[var(--text-muted)]">
                  {chapter.summary}
                </p>
                <ul className="space-y-1 text-xs text-[var(--text-muted)] list-disc list-inside mt-2 border-t border-[var(--line-soft)] pt-2">
                  {chapter.evidence.map((detail) => (
                    <li key={detail} className="marker:text-[var(--text-muted)]">{detail}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <SectionList title="未覆盖的冲突/线索" items={analysis.missingConflicts} icon={AlertCircle} />
        <SectionList title="场景拓展建议" items={analysis.sceneOpportunities} icon={Lightbulb} />
      </div>
    </div>
  );
}
