import type { MockConversionResponse } from "../types";
import { CharacterBiblePanel } from "./CharacterBiblePanel";
import { ConversionResultSummary } from "./ConversionResultSummary";
import { PreviewChecksPanel } from "./PreviewChecksPanel";
import { SceneBoardPanel } from "./SceneBoardPanel";
import { YamlPreviewPanel } from "./YamlPreviewPanel";

interface ConversionResultWorkbenchProps {
  result: MockConversionResponse;
}

export function ConversionResultWorkbench({
  result
}: ConversionResultWorkbenchProps) {
  return (
    <section className="space-y-4">
      <ConversionResultSummary result={result} />
      <YamlPreviewPanel screenplay={result.screenplay} />
      <PreviewChecksPanel screenplay={result.screenplay} />
      <SceneBoardPanel screenplay={result.screenplay} />
      <CharacterBiblePanel screenplay={result.screenplay} />
    </section>
  );
}
