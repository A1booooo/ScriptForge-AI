import type { SceneDisplayItem } from "../lib/screenplayDisplay";

interface SceneBoardSceneCardProps {
  scene: SceneDisplayItem;
}

function Pill({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center border border-zinc-700 bg-zinc-900/80 px-2.5 py-1 text-[11px] tracking-[0.12em] text-zinc-300 uppercase">
      {children}
    </span>
  );
}

export function SceneBoardSceneCard({ scene }: SceneBoardSceneCardProps) {
  return (
    <article className="border border-zinc-800 bg-zinc-950/70 p-5 shadow-[0_14px_30px_rgba(0,0,0,0.22)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-4">
        <div className="space-y-2">
          <p className="text-[11px] tracking-[0.22em] text-zinc-500 uppercase">
            {scene.id}
          </p>
          <h4 className="font-['Iowan_Old_Style','Source_Han_Serif_SC','Noto_Serif_SC',serif] text-xl leading-tight text-white">
            {scene.title}
          </h4>
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill>{scene.locationName}</Pill>
          <Pill>{scene.timeOfDay}</Pill>
          <Pill>{`${scene.dialogueCount} dialogue`}</Pill>
        </div>
      </div>

      <div className="grid gap-4 pt-4 md:grid-cols-2">
        <section className="space-y-3">
          <div>
            <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
              Summary
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-200">{scene.summary}</p>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
              Conflict
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">{scene.conflict}</p>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
              Linked Characters
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {scene.characterNames.map((characterName) => (
                <Pill key={characterName}>{characterName}</Pill>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
              Chapter Refs
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {scene.chapterTitles.map((chapterTitle) => (
                <Pill key={chapterTitle}>{chapterTitle}</Pill>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div>
            <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
              Beats
            </p>
            <ul className="mt-2 space-y-2 text-sm leading-6 text-zinc-300">
              {scene.beats.map((beat) => (
                <li key={beat.id} className="border border-zinc-800 bg-black/20 px-3 py-3">
                  <p className="font-medium text-zinc-100">{beat.summary}</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-400">{beat.purpose}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
              Dialogue Snapshot
            </p>
            {scene.representativeDialogue ? (
              <div className="mt-2 border border-zinc-800 bg-black/20 px-3 py-3">
                <p className="text-xs tracking-[0.16em] text-zinc-500 uppercase">
                  {scene.representativeDialogue.characterName}
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-200">
                  {scene.representativeDialogue.line}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                No dialogue line is available for this scene.
              </p>
            )}
          </div>

          {scene.adaptationNotes.length > 0 ? (
            <div>
              <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
                Adaptation Notes
              </p>
              <ul className="mt-2 space-y-2 text-sm leading-6 text-zinc-400">
                {scene.adaptationNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      </div>
    </article>
  );
}
