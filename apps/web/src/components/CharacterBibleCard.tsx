import type { CharacterDisplayItem } from "../lib/screenplayDisplay";
import { User, ShieldAlert, Video } from "lucide-react";

interface CharacterBibleCardProps {
  character: CharacterDisplayItem;
}

function MiniPill({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded bg-[var(--bg-paper-soft)] border border-[var(--line-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-muted)] tracking-wider uppercase">
      {children}
    </span>
  );
}

export function CharacterBibleCard({ character }: CharacterBibleCardProps) {
  return (
    <div className="character-support-item space-y-3 pb-6 border-b border-dashed border-[var(--line-soft)] last:border-b-0 last:pb-0">
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line-soft)] pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--text-muted)] font-mono">
            {character.id}
          </span>
          <h4 className="font-heading text-sm font-bold text-[var(--text-strong)]">
            {character.name}
          </h4>
        </div>
        <MiniPill>{character.role === "protagonist" ? "主角" : character.role === "antagonist" ? "反派" : "配角"}</MiniPill>
      </div>

      {/* Profile Details */}
      <div className="space-y-3 text-xs leading-5 text-[var(--text-muted)]">
        <div>
          <span className="font-semibold text-[var(--text-strong)] flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            描述
          </span>
          <p className="mt-1">{character.description}</p>
        </div>
        <div>
          <span className="font-semibold text-[var(--text-strong)] flex items-center gap-1">
            动机
          </span>
          <p className="mt-1">{character.motivation}</p>
        </div>
        <div>
          <span className="font-semibold text-[var(--text-strong)] flex items-center gap-1">
            语言风格
          </span>
          <p className="mt-1 italic">"{character.speechStyle}"</p>
        </div>

        {/* Relationships list */}
        <div>
          <span className="font-semibold text-[var(--text-strong)] flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            角色关系
          </span>
          {character.relationshipState.kind === "present" ? (
            <ul className="mt-1 space-y-1.5">
              {character.relationships.map((relationship) => (
                <li
                  key={`${character.id}-${relationship.characterId}`}
                  className="rounded bg-[var(--bg-paper-soft)] border border-[var(--line-soft)] p-2 space-y-0.5"
                >
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <MiniPill>{relationship.relation}</MiniPill>
                    <span className="font-semibold text-[var(--text-strong)]">
                      {relationship.characterName}
                    </span>
                  </div>
                  <p className="text-[11px] leading-4">{relationship.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-1 p-2.5 rounded bg-[var(--bg-paper-soft)] border border-dashed border-[var(--line-soft)] text-xs text-[var(--text-muted)] space-y-0.5">
              <p className="font-semibold text-[var(--text-strong)]">{character.relationshipState.title}</p>
              <p>{character.relationshipState.description}</p>
            </div>
          )}
        </div>

        {/* Scene Appearances */}
        {character.appearanceScenes.length > 0 && (
          <div>
            <span className="font-semibold text-[var(--text-strong)] flex items-center gap-1">
              <Video className="w-3.5 h-3.5" />
              登场场次
            </span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {character.appearanceScenes.map((scene) => (
                <span
                  key={scene.id}
                  title={`${scene.title} (${scene.locationName})`}
                  className="px-2 py-0.5 rounded bg-[var(--bg-paper-soft)] border border-[var(--line-soft)] text-[10px] font-mono"
                >
                  {scene.id}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
