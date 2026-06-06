import { useEffect, useMemo, useState } from "react";
import { validateScreenplayYaml } from "@scriptforge/shared";

import type { MockConversionResponse } from "../types";
import { screenplayToYaml } from "../lib/screenplayToYaml";
import { downloadYamlFile, getYamlExportFilename } from "../lib/yamlExport";
import { CharacterBiblePanel } from "./CharacterBiblePanel";
import { ConversionResultSummary } from "./ConversionResultSummary";
import { PreviewChecksPanel } from "./PreviewChecksPanel";
import { SceneBoardPanel } from "./SceneBoardPanel";
import { ValidationResultPanel } from "./ValidationResultPanel";
import { YamlPreviewPanel } from "./YamlPreviewPanel";

interface ConversionResultWorkbenchProps {
  result: MockConversionResponse;
}

export function ConversionResultWorkbench({
  result
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

  return (
    <section className="space-y-4">
      <ConversionResultSummary result={result} />
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
      <PreviewChecksPanel screenplay={result.screenplay} />
      <SceneBoardPanel screenplay={result.screenplay} />
      <CharacterBiblePanel screenplay={result.screenplay} />
    </section>
  );
}
