import { useState, useEffect } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { FileCode, Settings, Download } from "lucide-react";

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
  const [direction, setDirection] = useState<"horizontal" | "vertical">("horizontal");

  useEffect(() => {
    function handleResize() {
      setDirection(window.innerWidth < 1024 ? "vertical" : "horizontal");
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="bg-[var(--bg-paper)] border border-[var(--line-soft)] rounded-[0.25rem] overflow-hidden shadow-[var(--shadow-soft)]">
      {/* Productized Explanation Header */}
      <div className="border-b border-[var(--line-soft)] px-6 py-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="section-kicker flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-[var(--color-primary)]" />
              YAML 合约工作区
            </p>
            <h3 className="text-base font-bold text-[var(--text-strong)]">
              YAML 合约是本次改编结果的结构化剧本草稿。你可以编辑、校验并导出它，用于后续剧本打磨、系统集成或再次交给 AI 继续修改。
            </h3>
          </div>
          <span className="text-xs font-mono font-semibold tracking-wider text-[var(--text-muted)] uppercase">
            Shared contract
          </span>
        </div>
        
        {/* Three core pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-center text-xs">
          <div className="rounded border border-[var(--line-soft)] bg-[var(--bg-paper-soft)] p-3">
            <span className="block font-bold text-[var(--text-strong)]">可编辑</span>
            <span className="text-[11px] text-[var(--text-muted)] mt-1 block">左侧基线参考，右侧自由修改</span>
          </div>
          <div className="rounded border border-[var(--line-soft)] bg-[var(--bg-paper-soft)] p-3">
            <span className="block font-bold text-[var(--text-strong)]">可校验</span>
            <span className="text-[11px] text-[var(--text-muted)] mt-1 block">语法与一致性自动实时校验</span>
          </div>
          <div className="rounded border border-[var(--line-soft)] bg-[var(--bg-paper-soft)] p-3">
            <span className="block font-bold text-[var(--text-strong)]">可导出</span>
            <span className="text-[11px] text-[var(--text-muted)] mt-1 block">校验通过后可一键下载 YAML</span>
          </div>
        </div>
      </div>

      <div className="border-b border-[var(--line-soft)] bg-[var(--bg-paper-soft)] px-6 py-4 text-xs leading-6 text-[var(--text-muted)] flex items-start gap-1.5">
        <Settings className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0 mt-0.5" />
        <p>
          生成基线为只读参考，编辑中的 YAML 是校验及最终导出的唯一源。
        </p>
      </div>

      <Group orientation={direction} className="min-h-[38rem]">
        {/* Left/Top Panel: Generated YAML */}
        <Panel defaultSize={50} minSize={25}>
          <div className="flex flex-col h-full bg-[#faf7f1]">
            <div className="border-b border-[var(--line-soft)] bg-[rgba(238,230,218,0.45)] px-6 py-4">
              <p className="section-kicker">生成基线</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                AI 模型最近一次生成的结果（只读 baseline）。
              </p>
            </div>
            <pre className="flex-grow overflow-auto bg-[#33302C] text-[#F7F0E9] p-6 font-mono text-sm leading-6">
              <code>{generatedYaml}</code>
            </pre>
          </div>
        </Panel>

        <Separator className="PanelResizeHandle" />

        {/* Right/Bottom Panel: Edited YAML */}
        <Panel defaultSize={50} minSize={25}>
          <div className="flex flex-col h-full bg-[#fffdfa] border-t lg:border-t-0 lg:border-l border-[var(--line-soft)]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line-soft)] bg-[rgba(255,255,255,0.7)] px-6 py-4">
              <div>
                <p className="section-kicker">编辑中的 YAML</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  用于校验和导出的工作草稿副本。
                </p>
              </div>
              <button
                className="cta-button cta-primary inline-flex items-center gap-1.5 rounded-[4px] px-4 py-2 text-xs"
                disabled={!canExport}
                aria-label="Export YAML"
                type="button"
                onClick={onExport}
              >
                <Download className="w-3.5 h-3.5" />
                导出 YAML
              </button>
            </div>

            <div className="border-b border-[var(--line-soft)] bg-[rgba(238,230,218,0.35)] px-6 py-3 text-xs leading-5 text-[var(--text-muted)]">
              校验通过（即校验结果无错误和阻断）时才允许导出。
            </div>

            <label className="sr-only" htmlFor="edited-yaml">
              Edited YAML
            </label>
            <textarea
              id="edited-yaml"
              aria-label="Edited YAML"
              className="flex-grow w-full resize-none bg-[#33302C] text-[#F7F0E9] p-6 font-mono text-sm leading-6 outline-none"
              spellCheck={false}
              value={editedYaml}
              onChange={(event) => onEditedYamlChange(event.target.value)}
            />
          </div>
        </Panel>
      </Group>
    </div>
  );
}
