interface YamlPreviewPanelProps {
  generatedYaml: string;
  editedYaml: string;
  canExport: boolean;
  onEditedYamlChange: (value: string) => void;
  onExport: () => void;
}

export function YamlPreviewPanel({
  generatedYaml,
  editedYaml,
  canExport,
  onEditedYamlChange,
  onExport
}: YamlPreviewPanelProps) {
  return (
    <section className="panel-enter overflow-hidden border border-zinc-800 bg-zinc-950/90 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between gap-4 border-b border-zinc-800 px-5 py-4">
        <div className="space-y-1">
          <p className="text-xs tracking-[0.22em] text-zinc-500 uppercase">
            YAML Workspace
          </p>
          <h3 className="text-sm font-semibold text-zinc-100">
            Generated baseline plus editable YAML draft
          </h3>
        </div>
        <p className="text-[11px] tracking-[0.18em] text-zinc-600 uppercase">
          Shared contract
        </p>
      </div>

      <div className="border-b border-zinc-900 bg-black/30 px-5 py-3 text-sm leading-6 text-zinc-400">
        Generated YAML stays read-only as the original conversion result. Edited YAML is the only source used for validation and export.
      </div>

      <div className="grid gap-0 lg:grid-cols-2">
        <div className="border-b border-zinc-900 lg:border-r lg:border-b-0">
          <div className="border-b border-zinc-900 bg-black/25 px-5 py-3">
            <p className="text-xs tracking-[0.18em] text-zinc-500 uppercase">
              Generated YAML
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Read-only baseline from the latest generated draft.
            </p>
          </div>
          <pre className="max-h-[34rem] overflow-auto bg-[#050608] px-5 py-5 font-mono text-[12px] leading-6 text-zinc-200">
            <code>{generatedYaml}</code>
          </pre>
        </div>

        <div>
          <div className="flex items-center justify-between gap-4 border-b border-zinc-900 bg-black/25 px-5 py-3">
            <div>
              <p className="text-xs tracking-[0.18em] text-zinc-500 uppercase">
                Edited YAML
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Editable working copy for validation and export.
              </p>
            </div>
            <button
              className="inline-flex items-center justify-center rounded-none border border-zinc-200 px-4 py-2 text-xs font-medium tracking-[0.16em] text-zinc-100 uppercase transition duration-200 ease-out hover:border-zinc-50 hover:bg-zinc-50 hover:text-zinc-950 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-950 disabled:text-zinc-600"
              disabled={!canExport}
              type="button"
              onClick={onExport}
            >
              Export YAML
            </button>
          </div>

          <div className="border-b border-zinc-900 bg-black/10 px-5 py-3 text-sm leading-6 text-zinc-500">
            Export is enabled only when the current edited YAML passes shared parse, schema, and consistency checks.
          </div>

          <label className="sr-only" htmlFor="edited-yaml">
            Edited YAML
          </label>
          <textarea
            id="edited-yaml"
            aria-label="Edited YAML"
            className="min-h-[34rem] w-full resize-y border-0 bg-[#050608] px-5 py-5 font-mono text-[12px] leading-6 text-zinc-100 outline-none"
            spellCheck={false}
            value={editedYaml}
            onChange={(event) => onEditedYamlChange(event.target.value)}
          />
        </div>
      </div>
    </section>
  );
}
