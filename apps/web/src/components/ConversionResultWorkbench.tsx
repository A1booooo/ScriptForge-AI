import { useEffect, useMemo, useState } from "react";
import { validateScreenplayYaml } from "@scriptforge/shared";

import type { MockConversionResponse } from "../types";
import {
  analyzeChapterAdaptation,
  type SubmittedSourceSnapshot
} from "../lib/chapterAnalysis";
import { getAdaptationQualityScore } from "../lib/adaptationQualityScore";
import { screenplayToYaml } from "../lib/screenplayToYaml";
import { downloadYamlFile, getYamlExportFilename } from "../lib/yamlExport";
import { AdaptationQualityScorePanel } from "./AdaptationQualityScorePanel";
import { ChapterAnalyzerPanel } from "./ChapterAnalyzerPanel";
import { CharacterBiblePanel } from "./CharacterBiblePanel";
import { ConversionResultSummary } from "./ConversionResultSummary";
import { PreviewChecksPanel } from "./PreviewChecksPanel";
import { SceneBoardPanel } from "./SceneBoardPanel";
import { ValidationResultPanel } from "./ValidationResultPanel";
import { YamlPreviewPanel } from "./YamlPreviewPanel";

interface ConversionResultWorkbenchProps {
  result: MockConversionResponse;
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

  return (
    <section className="space-y-4">
      <ConversionResultSummary result={result} />
      <ChapterAnalyzerPanel analysis={chapterAnalysis} />
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
      <ValidationResultPanel validationResult={validationResult} />
      <AdaptationQualityScorePanel score={adaptationQualityScore} />
      <PreviewChecksPanel screenplay={result.screenplay} />
      <SceneBoardPanel screenplay={result.screenplay} />
      <CharacterBiblePanel screenplay={result.screenplay} />
    </section>
  );
}
