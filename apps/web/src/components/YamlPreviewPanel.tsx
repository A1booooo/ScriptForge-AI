import { useMemo } from "react";
import type { ScreenplayDocument } from "@scriptforge/shared";

import { screenplayToYaml } from "../lib/screenplayToYaml";

interface YamlPreviewPanelProps {
  screenplay: ScreenplayDocument;
}

export function YamlPreviewPanel({ screenplay }: YamlPreviewPanelProps) {
  const yamlText = useMemo(() => screenplayToYaml(screenplay), [screenplay]);

  return (
    <section className="panel-enter overflow-hidden border border-zinc-800 bg-zinc-950/90 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between gap-4 border-b border-zinc-800 px-5 py-4">
        <div className="space-y-1">
          <p className="text-xs tracking-[0.22em] text-zinc-500 uppercase">
            YAML Preview
          </p>
          <h3 className="text-sm font-semibold text-zinc-100">
            Read-only screenplay draft
          </h3>
        </div>
        <p className="text-[11px] tracking-[0.18em] text-zinc-600 uppercase">
          Shared contract
        </p>
      </div>

      <div className="border-b border-zinc-900 bg-black/30 px-5 py-3 text-sm leading-6 text-zinc-400">
        Generated from the shared `ScreenplayDocument` object returned by the mock conversion API.
      </div>

      <pre className="max-h-[32rem] overflow-auto bg-[#050608] px-5 py-5 font-mono text-[12px] leading-6 text-zinc-200">
        <code>{yamlText}</code>
      </pre>
    </section>
  );
}
