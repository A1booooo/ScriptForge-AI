import type { SceneDisplayItem } from "../lib/screenplayDisplay";
import { MessageSquare, Link, Sparkles } from "lucide-react";

interface SceneBoardSceneCardProps {
  scene: SceneDisplayItem;
}

function Pill({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded bg-[var(--bg-paper-soft)] border border-[var(--line-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-muted)] tracking-wide uppercase">
      {children}
    </span>
  );
}

export function SceneBoardSceneCard({ scene }: SceneBoardSceneCardProps) {
  return (
    <article className="scene-reading-item space-y-4">
      {/* Scene Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--line-soft)] pb-3">
        <div className="flex items-center gap-3">
          <span className="font-heading text-2xl font-bold text-[var(--color-primary)]">
            {scene.id}
          </span>
          <h4 className="font-heading text-lg font-bold text-[var(--text-strong)] uppercase tracking-wide">
            {scene.title}
          </h4>
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill>{scene.locationName}</Pill>
          <Pill>{scene.timeOfDay}</Pill>
          <Pill>{`${scene.dialogueCount} 条对话`}</Pill>
        </div>
      </div>

      {/* Scene Details */}
      <div className="pl-6 border-l-2 border-[var(--line-soft)] hover:border-[var(--line-strong)] transition-colors grid gap-6 md:grid-cols-2">
        <section className="space-y-4">
          <div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">场次摘要</p>
            <p className="mt-1 text-sm leading-6 text-[var(--text-strong)]">{scene.summary}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">核心冲突</p>
            <p className="mt-1 text-sm leading-6 text-[var(--text-strong)]">{scene.conflict}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">登场角色</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {scene.characterNames.map((characterName) => (
                <Pill key={characterName}>{characterName}</Pill>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">关联章节</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {scene.chapterTitles.map((chapterTitle) => (
                <Pill key={chapterTitle}>{chapterTitle}</Pill>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              剧情节奏点
            </p>
            <ul className="mt-2 space-y-2">
              {scene.beats.map((beat) => (
                <li
                  key={beat.id}
                  className="rounded bg-[var(--bg-paper-soft)] border border-[var(--line-soft)] p-3 space-y-1"
                >
                  <p className="text-xs font-bold text-[var(--text-strong)]">
                    {beat.summary}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] leading-5">
                    {beat.purpose}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              对话快照
            </p>
            {scene.representativeDialogue ? (
              <div className="mt-2 rounded bg-[var(--bg-paper-soft)] border border-[var(--line-soft)] p-3 text-xs leading-5">
                <span className="font-bold text-[var(--color-primary)] uppercase tracking-wide">
                  {scene.representativeDialogue.characterName}
                </span>
                <p className="mt-1 text-[var(--text-strong)] italic">
                  "{scene.representativeDialogue.line}"
                </p>
              </div>
            ) : (
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                本场戏没有对话快照。
              </p>
            )}
          </div>

          {scene.adaptationNotes.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                <Link className="w-3.5 h-3.5" />
                改编批注
              </p>
              <ul className="mt-2 space-y-1 text-xs text-[var(--text-muted)] list-disc list-inside">
                {scene.adaptationNotes.map((note) => (
                  <li key={note} className="marker:text-[var(--text-muted)]">{note}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </article>
  );
}
