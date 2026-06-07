import { useMemo } from "react";
import { Film } from "lucide-react";
import type { ScreenplayDocument } from "@scriptforge/shared";

import { getSceneDisplayItems } from "../lib/screenplayDisplay";
import { SceneBoardSceneCard } from "./SceneBoardSceneCard";

interface SceneBoardPanelProps {
  screenplay: ScreenplayDocument;
}

export function SceneBoardPanel({ screenplay }: SceneBoardPanelProps) {
  const scenes = useMemo(() => getSceneDisplayItems(screenplay), [screenplay]);

  return (
    <div>
      <div className="border-b border-[var(--line-soft)] pb-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="section-kicker flex items-center gap-1.5">
              <Film className="w-4 h-4 text-[var(--color-primary)]" />
              场景板
            </p>
            <h3 className="text-xl font-bold text-[var(--text-strong)]">
              场景板作为剧本草稿的主要阅读区
            </h3>
          </div>
          <span className="text-xs bg-[var(--bg-paper-soft)] px-2.5 py-1 rounded text-[var(--text-muted)] border border-[var(--line-soft)] uppercase tracking-wider font-semibold">
            共 {scenes.length} 场戏
          </span>
        </div>
      </div>

      <div className="bg-[var(--bg-paper-soft)] border border-[var(--line-soft)] rounded-[0.25rem] px-5 py-4 text-xs leading-6 text-[var(--text-muted)] mb-6">
        仅用于展示生成的草稿。场景板从当前 Mock API 的剧本结果中读取，而编辑中的 YAML 保持在 YAML 合约工作区独立管理。
      </div>

      <div className="space-y-2">
        {scenes.map((scene) => (
          <SceneBoardSceneCard key={scene.id} scene={scene} />
        ))}
      </div>
    </div>
  );
}
