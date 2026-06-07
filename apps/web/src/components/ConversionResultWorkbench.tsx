import { useEffect, useMemo, useState } from "react";
import { validateScreenplayYaml } from "@scriptforge/shared";
import { FileText, BarChart2, ShieldCheck, AlignLeft } from "lucide-react";

import type { ConversionResponse } from "../types";
import {
  analyzeChapterAdaptation,
  type SubmittedSourceSnapshot
} from "../lib/chapterAnalysis";
import { getAdaptationQualityScore } from "../lib/adaptationQualityScore";
import { getRewriteSuggestions } from "../lib/rewriteSuggestions";
import { screenplayToYaml } from "../lib/screenplayToYaml";
import { downloadYamlFile, getYamlExportFilename } from "../lib/yamlExport";
import { AdaptationQualityScorePanel } from "./AdaptationQualityScorePanel";
import { ChapterAnalyzerPanel } from "./ChapterAnalyzerPanel";
import { CharacterBiblePanel } from "./CharacterBiblePanel";
import { ConversionResultSummary } from "./ConversionResultSummary";
import { PreviewChecksPanel } from "./PreviewChecksPanel";
import { RewriteSuggestionsPanel } from "./RewriteSuggestionsPanel";
import { SceneBoardPanel } from "./SceneBoardPanel";
import { ValidationResultPanel } from "./ValidationResultPanel";
import { YamlPreviewPanel } from "./YamlPreviewPanel";

interface ConversionResultWorkbenchProps {
  result: ConversionResponse;
  sourceSnapshot: SubmittedSourceSnapshot;
}

export function ConversionResultWorkbench({
  result,
  sourceSnapshot
}: ConversionResultWorkbenchProps) {
  const generatedYaml = useMemo(
    () => screenplayToYaml(result.screenplay),
    [result.screenplay]
  );
  const [editedYaml, setEditedYaml] = useState(generatedYaml);

  useEffect(() => {
    setEditedYaml(generatedYaml);
  }, [generatedYaml]);

  const validationResult = useMemo(
    () => validateScreenplayYaml(editedYaml),
    [editedYaml]
  );
  const chapterAnalysis = useMemo(
    () =>
      analyzeChapterAdaptation({
        screenplay: result.screenplay,
        sourceSnapshot
      }),
    [result.screenplay, sourceSnapshot]
  );
  const adaptationQualityScore = useMemo(
    () =>
      getAdaptationQualityScore({
        screenplay: result.screenplay,
        chapterAnalysis,
        validationResult
      }),
    [chapterAnalysis, result.screenplay, validationResult]
  );
  const rewriteSuggestions = useMemo(
    () =>
      getRewriteSuggestions({
        screenplay: result.screenplay,
        chapterAnalysis,
        adaptationQualityScore
      }),
    [adaptationQualityScore, chapterAnalysis, result.screenplay]
  );

  const [activeSection, setActiveSection] = useState<
    "overview" | "analysis" | "contract" | "draft-view"
  >("overview");

  return (
    <div className="result-workbench mt-8 flex flex-col gap-8">
      {/* workbench title and narrative overview */}
      <div className="border-b border-[var(--line-soft)] pb-4">
        <p className="section-kicker">Result Workspace</p>
        <h2 className="font-heading text-3xl font-bold tracking-tight text-[var(--text-strong)] mt-1">
          生成结果工作台
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          当前结果区包含剧本摘要、章节分析、修改建议、YAML 合约、场景板、角色档案。可在正式定稿前进行最终微调。
        </p>
      </div>

      {/* Lightweight section navigation tab switcher */}
      <nav className="result-navigation-strip" aria-label="结果工作台分区导航">
        <button
          type="button"
          onClick={() => setActiveSection("overview")}
          className={`flex items-center gap-1 ${activeSection === "overview" ? "active" : ""}`}
          aria-selected={activeSection === "overview"}
        >
          <FileText className="w-3.5 h-3.5" />
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("analysis")}
          className={`flex items-center gap-1 ${activeSection === "analysis" ? "active" : ""}`}
          aria-selected={activeSection === "analysis"}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          Analysis
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("contract")}
          className={`flex items-center gap-1 ${activeSection === "contract" ? "active" : ""}`}
          aria-selected={activeSection === "contract"}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Contract
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("draft-view")}
          className={`flex items-center gap-1 ${activeSection === "draft-view" ? "active" : ""}`}
          aria-selected={activeSection === "draft-view"}
        >
          <AlignLeft className="w-3.5 h-3.5" />
          Draft View
        </button>
      </nav>

      {/* Main Sections flow */}
      <div className="mt-4">
        {/* Section 1: Overview */}
        {activeSection === "overview" && (
          <section id="overview" className="animate-view-fade-in space-y-4">
            <div className="border-b border-[var(--line-soft)] pb-2">
              <p className="section-kicker">01 / Overview</p>
              <h3 className="text-lg font-bold text-[var(--text-strong)] mt-0.5">
                Conversion summary and adaptation readiness
              </h3>
            </div>
            <div className="result-overview-grid">
              <ConversionResultSummary result={result} />
              <AdaptationQualityScorePanel score={adaptationQualityScore} />
            </div>
          </section>
        )}

        {/* Section 2: Analysis */}
        {activeSection === "analysis" && (
          <section id="analysis" className="animate-view-fade-in space-y-4">
            <div className="border-b border-[var(--line-soft)] pb-2">
              <p className="section-kicker">02 / Analysis</p>
              <h3 className="text-lg font-bold text-[var(--text-strong)] mt-0.5">
                章节分析 and rewrite guidance
              </h3>
            </div>
            <div className="studio-report-panel flex flex-col gap-8">
              <ChapterAnalyzerPanel analysis={chapterAnalysis} />
              <RewriteSuggestionsPanel suggestions={rewriteSuggestions} />
            </div>
          </section>
        )}

        {/* Section 3: Contract */}
        {activeSection === "contract" && (
          <section id="contract" className="animate-view-fade-in space-y-4">
            <div className="border-b border-[var(--line-soft)] pb-2">
              <p className="section-kicker">03 / Contract</p>
              <h3 className="text-lg font-bold text-[var(--text-strong)] mt-0.5">
                YAML 合约, validation, and preview checks
              </h3>
            </div>
            <div className="space-y-6">
              <div className="yaml-dark-editor">
                <YamlPreviewPanel
                  canExport={validationResult.ok}
                  editedYaml={editedYaml}
                  generatedYaml={generatedYaml}
                  onEditedYamlChange={setEditedYaml}
                  onExport={() =>
                    downloadYamlFile(
                      getYamlExportFilename(result.screenplay.metadata.title),
                      editedYaml
                    )
                  }
                />
              </div>
              <ValidationResultPanel validationResult={validationResult} />
              <PreviewChecksPanel screenplay={result.screenplay} />
            </div>
          </section>
        )}

        {/* Section 4: Draft View */}
        {activeSection === "draft-view" && (
          <section id="draft-view" className="animate-view-fade-in space-y-4">
            <div className="border-b border-[var(--line-soft)] pb-2">
              <p className="section-kicker">04 / Draft View</p>
              <h3 className="text-lg font-bold text-[var(--text-strong)] mt-0.5">
                场景板 as the main reading surface, with 角色档案 as support
              </h3>
            </div>
            <div className="grid gap-8 grid-cols-1 lg:grid-cols-12">
              {/* Scene Board (Left - 8 cols) */}
              <div className="scene-reading-panel lg:col-span-8">
                <SceneBoardPanel screenplay={result.screenplay} />
              </div>

              {/* Character Bible (Right - 4 cols) */}
              <div className="character-support-rail lg:col-span-4">
                <CharacterBiblePanel screenplay={result.screenplay} />
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
