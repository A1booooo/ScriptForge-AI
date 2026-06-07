import { useMemo } from "react";
import { Users } from "lucide-react";
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
    <div className="bg-[var(--bg-paper)] border border-[var(--line-soft)] rounded-[0.25rem] p-6 shadow-[var(--shadow-soft)]">
      <div className="border-b border-[var(--line-soft)] pb-4 mb-4 flex justify-between items-center">
        <div className="space-y-1">
          <p className="section-kicker flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[var(--color-primary)]" />
            角色档案
          </p>
          <h3 className="text-base font-bold text-[var(--text-strong)]">
            角色档案作为辅助草稿栏
          </h3>
        </div>
        <span className="text-xs bg-[var(--bg-paper-soft)] px-2.5 py-1 rounded text-[var(--text-muted)] border border-[var(--line-soft)] uppercase tracking-wider font-semibold">
          共 {characters.length} 个角色
        </span>
      </div>

      <div className="bg-[var(--bg-paper-soft)] border border-[var(--line-soft)] rounded-[0.25rem] px-4 py-3 text-xs leading-5 text-[var(--text-muted)] mb-6">
        角色概况及场次出场情况作为主要场景板阅读流的辅助参考。
      </div>

      <div className="space-y-6">
        {characters.map((character) => (
          <CharacterBibleCard key={character.id} character={character} />
        ))}
      </div>
    </div>
  );
}
