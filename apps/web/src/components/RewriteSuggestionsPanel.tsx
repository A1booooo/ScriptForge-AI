import { Lightbulb } from "lucide-react";
import type { RewriteSuggestionsResult } from "../lib/rewriteSuggestions";

interface RewriteSuggestionsPanelProps {
  suggestions: RewriteSuggestionsResult;
}

const modeLabels: Record<string, string> = {
  "dialogue-enhancement": "对话增强",
  "pacing-adjustment": "节奏调整",
  "scene-compression": "场景压缩"
};

const signalSourceLabels: Record<string, string> = {
  "generated screenplay scenes[].dialogue, scenes[].characters, characters[].speech_style, and T11 AdaptationQualityScoreResult dimensions":
    "生成的剧本 scenes[].dialogue、scenes[].characters、characters[].speech_style 和 T11 改编质量评分维度",
  "generated screenplay scenes[].chapter_refs plus T10 ChapterAnalysisResult coverage, missingConflicts, sceneOpportunities, and T11 structure dimension":
    "生成的剧本 scenes[].chapter_refs、T10 章节分析覆盖率、缺失冲突、场景机会以及 T11 结构就绪度维度",
  "generated screenplay scenes[].chapter_refs, scenes[].beats, scenes[].adaptation_notes, T10 ChapterAnalysisResult sceneOpportunities, and T11 structure dimension":
    "生成的剧本 scenes[].chapter_refs、scenes[].beats、scenes[].adaptation_notes、T10 章节分析场景机会以及 T11 结构就绪度维度"
};

function translateDialogueReason(reason: string): string {
  let text = reason;
  text = text.replace("Strengthen:", "增强建议:");
  text = text.replace("Conservative pass:", "保守性检查:");
  
  const match = text.match(/(增强建议|保守性检查): (\S+) currently carries (\d+) dialogue line\(s\)\. The rule uses scene dialogue density plus (\d+) available speech-style hint\(s\), alongside T11 conflict clarity \((\d+)\) and character coverage \((\d+)\), to suggest tightening subtext or speaker contrast without generating replacement lines\./);
  if (match) {
    const [, toneText, sceneId, dialogueLines, speechHints, conflictClarity, charCoverage] = match;
    return `${toneText} 场景 ${sceneId} 当前包含 ${dialogueLines} 行对话。该规则结合场景对话密度与 ${speechHints} 个说话风格提示，以及 T11 冲突清晰度 (${conflictClarity}) 和角色覆盖度 (${charCoverage})，建议精简潜台词或增强说话人对比。`;
  }
  
  const matchFallback = text.match(/(增强建议|保守性检查): no scene-level dialogue target was found, so this suggestion stays at draft level and only reflects T11 conflict clarity \((\d+)\) and character coverage \((\d+)\) signals\./);
  if (matchFallback) {
    const [, toneText, conflictClarity, charCoverage] = matchFallback;
    return `${toneText} 未找到场景级对话目标，该建议保留在草稿级别，反映 T11 冲突清晰度 (${conflictClarity}) 和角色覆盖度 (${charCoverage})。`;
  }
  
  return text;
}

function translatePacingReason(reason: string): string {
  let text = reason;
  text = text.replace("Adjust:", "调整建议:");
  text = text.replace("Conservative pacing check:", "保守节奏检查:");
  
  const matchUnref = text.match(/(调整建议|保守节奏检查): (\S+) is currently unreferenced in T10 coverage\. The rule combines that gap with (\d+) missing-conflict signal\(s\), (\d+) scene-opportunity signal\(s\), and T11 structure \((\d+)\) to suggest revisiting where this chapter enters the generated draft\./);
  if (matchUnref) {
    const [, toneText, chapterId, conflictGaps, sceneOpp, structureScore] = matchUnref;
    return `${toneText} 章节 ${chapterId} 当前在 T10 覆盖率中未被引用。该规则结合此缺口与 ${conflictGaps} 个缺失冲突信号、${sceneOpp} 个场景机会信号以及 T11 结构就绪度 (${structureScore})，建议重新审视该章节如何切入生成的剧本草稿。`;
  }
  
  const matchMerged = text.match(/(调整建议|保守节奏检查): (\S+) merges (\d+) chapter reference\(s\)\. The rule uses this visible compression point, plus (\d+) missing-conflict signal\(s\), (\d+) scene-opportunity signal\(s\), and T11 structure \((\d+)\), to suggest checking rhythm and transition clarity\./);
  if (matchMerged) {
    const [, toneText, sceneId, chapterRefs, conflictGaps, sceneOpp, structureScore] = matchMerged;
    return `${toneText} 场景 ${sceneId} 合并了 ${chapterRefs} 个章节引用。该规则利用这一压缩点，结合 ${conflictGaps} 个缺失冲突信号、${sceneOpp} 个场景机会信号以及 T11 结构就绪度 (${structureScore})，建议检查节奏和过渡的清晰度。`;
  }
  
  const matchFallback = text.match(/(调整建议|保守节奏检查): no strong chapter-level pacing gap was found, so this stays at draft level and reflects T10 scene-opportunity signals with T11 structure \((\d+)\)\./);
  if (matchFallback) {
    const [, toneText, structureScore] = matchFallback;
    return `${toneText} 未找到明显的章节级节奏缺口，保留在草稿级别，仅反映 T10 场景机会信号与 T11 结构就绪度 (${structureScore})。`;
  }
  
  return text;
}

function translateCompressionReason(reason: string): string {
  let text = reason;
  text = text.replace("Compression review:", "压缩评估:");
  text = text.replace("Conservative compression check:", "保守压缩检查:");
  
  const matchHeavy = text.match(/(压缩评估|保守压缩检查): (\S+) currently carries (\d+) beat\(s\) across (\d+) chapter reference\(s\)\. The rule uses that density, scene adaptation notes, (\d+) T10 scene-opportunity signal\(s\), and T11 structure \((\d+)\) to suggest checking whether the current compression boundary is still readable\./);
  if (matchHeavy) {
    const [, toneText, sceneId, beatsCount, chapterRefs, sceneOpp, structureScore] = matchHeavy;
    return `${toneText} 场景 ${sceneId} 当前在 ${chapterRefs} 个章节引用中包含 ${beatsCount} 个 beat。该规则结合此密度、场景改编备注、${sceneOpp} 个 T10 场景机会信号以及 T11 结构就绪度 (${structureScore})，建议检查当前的压缩边界是否具有可读性。`;
  }
  
  const matchFallback = text.match(/(压缩评估|保守压缩检查): no single scene target was available, so this remains a draft-level suggestion derived from T10 scene-opportunity signals and T11 structure \((\d+)\)\./);
  if (matchFallback) {
    const [, toneText, structureScore] = matchFallback;
    return `${toneText} 没有可用的单个场景目标，这仍然是基于 T10 场景机会信号和 T11 结构就绪度 (${structureScore}) 派生的草稿级建议。`;
  }
  
  return text;
}

function translateReason(mode: string, reason: string): string {
  if (mode === "dialogue-enhancement") {
    return translateDialogueReason(reason);
  }
  if (mode === "pacing-adjustment") {
    return translatePacingReason(reason);
  }
  if (mode === "scene-compression") {
    return translateCompressionReason(reason);
  }
  return reason;
}

export function RewriteSuggestionsPanel({
  suggestions
}: RewriteSuggestionsPanelProps) {
  const title = suggestions.title === "Rewrite Suggestions" ? "修改建议" : suggestions.title;
  const badgeLabel = suggestions.badgeLabel === "Deterministic Demo suggestions" ? "确定性 Demo 建议" : suggestions.badgeLabel;

  return (
    <div className="space-y-6">
      <div className="studio-report-panel-header flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="section-kicker flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-[var(--color-primary)]" />
            {title}
          </p>
          <h3 className="text-xl font-bold text-[var(--text-strong)]">
            基于生成剧本信号的修改与重写建议
          </h3>
        </div>
        <span className="rounded border border-[rgba(61,139,109,0.32)] bg-[rgba(61,139,109,0.08)] px-2.5 py-0.5 text-xs font-semibold text-[#2d7257] uppercase">
          {badgeLabel}
        </span>
      </div>

      <div className="bg-[var(--bg-paper-soft)] border border-[var(--line-soft)] rounded-[0.25rem] px-5 py-4 text-xs leading-6 text-[var(--text-muted)]">
        {suggestions.description}
      </div>

      <div className="space-y-6 divide-y divide-[var(--line-soft)]">
        {suggestions.suggestions.map((suggestion) => {
          const isPacing = suggestion.mode.includes("pacing");
          const isScene = suggestion.mode.includes("scene");
          const accentClass = isPacing 
            ? "border-l-4 border-[var(--color-accent-sky)] pl-4" 
            : isScene 
              ? "border-l-4 border-[var(--color-accent-violet)] pl-4" 
              : "border-l-4 border-[var(--color-accent-emerald)] pl-4";

          const badgeBg = isPacing
            ? "bg-[rgba(76,143,214,0.08)] text-[#3f75b1] border-[rgba(76,143,214,0.32)]"
            : isScene
              ? "bg-[rgba(123,111,214,0.08)] text-[#5e53b1] border-[rgba(123,111,214,0.32)]"
              : "bg-[rgba(61,139,109,0.08)] text-[#2d7257] border-[rgba(61,139,109,0.32)]";

          return (
            <article
              key={`${suggestion.mode}-${suggestion.target}`}
              className={`studio-report-item ${accentClass} pt-6 first:pt-0 border-t-0`}
            >
              {/* Top: Mode badge and target */}
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded border px-2.5 py-0.5 text-xs font-semibold uppercase ${badgeBg}`}>
                  <span>建议类型</span>: <span>{modeLabels[suggestion.mode] || suggestion.mode}</span>
                  <span className="sr-only">{suggestion.mode}</span>
                </span>
                <span className="text-sm font-semibold text-[var(--text-strong)]">
                  <span>作用对象</span>: <span>{suggestion.target}</span>
                </span>
              </div>

              {/* Middle: Reason */}
              <div className="mt-3">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  建议原因
                </p>
                <p className="mt-1 text-sm text-[var(--text-strong)] leading-6">
                  {translateReason(suggestion.mode, suggestion.reason)}
                </p>
              </div>

              {/* Bottom: Signal source (collapsible summary details) */}
              <div className="mt-3">
                <details className="group">
                  <summary className="text-[11px] font-bold text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-strong)] transition-colors select-none flex items-center gap-1">
                    <span>信号来源</span> (点击展开/收起)
                  </summary>
                  <p className="mt-1.5 text-xs text-[var(--text-muted)] leading-relaxed pl-3 border-l border-[var(--line-soft)] italic">
                    {signalSourceLabels[suggestion.signalSource] || suggestion.signalSource}
                  </p>
                </details>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

