import { ADAPTATION_MODES, type AdaptationMode } from "@scriptforge/shared";
import { Sliders } from "lucide-react";

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
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <label className="field-kicker flex items-center gap-1.5" htmlFor="adaptation-mode">
          <Sliders className="w-3.5 h-3.5 text-[var(--color-primary)]" />
          改编模式
        </label>
        <span className="text-xs text-[var(--text-muted)]">
          仅使用 T03 Mock API
        </span>
      </div>
      <div className="relative">
        <select
          id="adaptation-mode"
          aria-label="改编模式"
          className="input-control appearance-none cursor-pointer pr-10"
          value={value}
          onChange={(event) => onChange(event.target.value as AdaptationMode)}
        >
          {ADAPTATION_MODES.map((mode) => (
            <option key={mode} value={mode}>
              {modeLabels[mode]}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase">
          ▼
        </span>
      </div>
    </div>
  );
}
