import type { CharacterDisplayItem } from "../lib/screenplayDisplay";

interface CharacterBibleCardProps {
  character: CharacterDisplayItem;
}

function MiniPill({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center border border-zinc-700 bg-zinc-900/80 px-2.5 py-1 text-[11px] tracking-[0.12em] text-zinc-300 uppercase">
      {children}
    </span>
  );
}

export function CharacterBibleCard({ character }: CharacterBibleCardProps) {
  return (
    <article className="border border-zinc-800 bg-zinc-950/70 p-5 shadow-[0_14px_30px_rgba(0,0,0,0.22)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-4">
        <div className="space-y-2">
          <p className="text-[11px] tracking-[0.22em] text-zinc-500 uppercase">
            {character.id}
          </p>
          <h4 className="font-['Iowan_Old_Style','Source_Han_Serif_SC','Noto_Serif_SC',serif] text-xl leading-tight text-white">
            {character.name}
          </h4>
        </div>
        <MiniPill>{character.role}</MiniPill>
      </div>

      <div className="grid gap-4 pt-4 md:grid-cols-2">
        <section className="space-y-3">
          <div>
            <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
              Description
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-200">
              {character.description}
            </p>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
              Motivation
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              {character.motivation}
            </p>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
              Speech Style
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              {character.speechStyle}
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <div>
            <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
              Relationships
            </p>
            {character.relationships.length > 0 ? (
              <ul className="mt-2 space-y-2 text-sm leading-6 text-zinc-300">
                {character.relationships.map((relationship) => (
                  <li
                    key={`${character.id}-${relationship.characterId}`}
                    className="border border-zinc-800 bg-black/20 px-3 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <MiniPill>{relationship.relation}</MiniPill>
                      <span className="text-sm font-medium text-zinc-100">
                        {relationship.characterName}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-zinc-400">
                      {relationship.description}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                No explicit relationships are listed for this character.
              </p>
            )}
          </div>

          <div>
            <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
              Appearance Scenes
            </p>
            {character.appearanceScenes.length > 0 ? (
              <ul className="mt-2 space-y-2 text-sm leading-6 text-zinc-300">
                {character.appearanceScenes.map((scene) => (
                  <li
                    key={scene.id}
                    className="flex items-center justify-between gap-3 border border-zinc-800 bg-black/20 px-3 py-3"
                  >
                    <div>
                      <p className="font-medium text-zinc-100">{scene.title}</p>
                      <p className="mt-1 text-xs text-zinc-500">{scene.id}</p>
                    </div>
                    <MiniPill>{scene.locationName}</MiniPill>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                This character does not appear in any current scene entries.
              </p>
            )}
          </div>
        </section>
      </div>
    </article>
  );
}
