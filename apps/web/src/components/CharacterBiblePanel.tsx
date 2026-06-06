import { useMemo } from "react";
import type { ScreenplayDocument } from "@scriptforge/shared";

import { getCharacterDisplayItems } from "../lib/screenplayDisplay";
import { CharacterBibleCard } from "./CharacterBibleCard";

interface CharacterBiblePanelProps {
  screenplay: ScreenplayDocument;
}

export function CharacterBiblePanel({ screenplay }: CharacterBiblePanelProps) {
  const characters = useMemo(
    () => getCharacterDisplayItems(screenplay),
    [screenplay]
  );

  return (
    <section className="panel-enter overflow-hidden border border-zinc-800 bg-zinc-950/80 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
      <div className="border-b border-zinc-800 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs tracking-[0.22em] text-zinc-500 uppercase">
              Character Bible
            </p>
            <h3 className="text-sm font-semibold text-zinc-100">
              Character profiles and scene appearances from the shared draft
            </h3>
          </div>
          <p className="text-xs tracking-[0.18em] text-zinc-500 uppercase">
            {characters.length} characters
          </p>
        </div>
      </div>

      <div className="border-b border-zinc-900 bg-black/20 px-5 py-3 text-sm leading-6 text-zinc-400">
        Generated draft view only. The Character Bible stays within current schema fields from the generated result, while edited YAML powers the validation and export loop.
      </div>

      <div className="space-y-4 px-5 py-5">
        {characters.map((character) => (
          <CharacterBibleCard key={character.id} character={character} />
        ))}
      </div>
    </section>
  );
}
