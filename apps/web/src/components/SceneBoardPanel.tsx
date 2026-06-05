import { useMemo } from "react";
import type { ScreenplayDocument } from "@scriptforge/shared";

import { getSceneDisplayItems } from "../lib/screenplayDisplay";
import { SceneBoardSceneCard } from "./SceneBoardSceneCard";

interface SceneBoardPanelProps {
  screenplay: ScreenplayDocument;
}

export function SceneBoardPanel({ screenplay }: SceneBoardPanelProps) {
  const scenes = useMemo(() => getSceneDisplayItems(screenplay), [screenplay]);

  return (
    <section className="panel-enter overflow-hidden border border-zinc-800 bg-zinc-950/80 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
      <div className="border-b border-zinc-800 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs tracking-[0.22em] text-zinc-500 uppercase">
              Scene Board
            </p>
            <h3 className="text-sm font-semibold text-zinc-100">
              Scene-level structure from the shared screenplay draft
            </h3>
          </div>
          <p className="text-xs tracking-[0.18em] text-zinc-500 uppercase">
            {scenes.length} scenes
          </p>
        </div>
      </div>

      <div className="border-b border-zinc-900 bg-black/20 px-5 py-3 text-sm leading-6 text-zinc-400">
        The Scene Board reads directly from the current mock API `ScreenplayDocument` result and resolves linked locations, characters, and chapter references for display.
      </div>

      <div className="space-y-4 px-5 py-5">
        {scenes.map((scene) => (
          <SceneBoardSceneCard key={scene.id} scene={scene} />
        ))}
      </div>
    </section>
  );
}
