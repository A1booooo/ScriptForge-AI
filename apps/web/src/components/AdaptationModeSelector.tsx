import { ADAPTATION_MODES, type AdaptationMode } from "@scriptforge/shared";

const modeLabels: Record<AdaptationMode, string> = {
  faithful: "faithful · 忠实改编",
  dramatic: "dramatic · 戏剧强化",
  short_drama: "short_drama · 短剧节奏"
};

interface AdaptationModeSelectorProps {
  value: AdaptationMode;
  onChange: (nextValue: AdaptationMode) => void;
}

export function AdaptationModeSelector({
  value,
  onChange
}: AdaptationModeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label
          className="text-sm font-medium tracking-[0.18em] text-zinc-300 uppercase"
          htmlFor="adaptation-mode"
        >
          改编模式
        </label>
        <span className="text-xs text-zinc-500">仅使用 T03 Mock API</span>
      </div>
      <div className="relative">
        <select
          id="adaptation-mode"
          aria-label="改编模式"
          className="w-full appearance-none rounded-none border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition duration-200 ease-out hover:border-zinc-500 focus:border-zinc-100 focus:ring-2 focus:ring-zinc-300/20"
          value={value}
          onChange={(event) => onChange(event.target.value as AdaptationMode)}
        >
          {ADAPTATION_MODES.map((mode) => (
            <option key={mode} value={mode}>
              {modeLabels[mode]}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs tracking-[0.2em] text-zinc-500 uppercase">
          Select
        </span>
      </div>
    </div>
  );
}
