import { useState } from "react";
import { FileCode, Settings, Download, Copy, RotateCcw } from "lucide-react";
import type { YamlValidationStatus } from "../lib/yamlValidationStatus";

interface YamlPreviewPanelProps {
  generatedYaml: string;
  editedYaml: string;
  canExport: boolean;
  onEditedYamlChange: (value: string) => void;
  onExport: () => void;
  validationStatus: YamlValidationStatus;
}

export function YamlPreviewPanel({
  generatedYaml,
  editedYaml,
  canExport,
  onEditedYamlChange,
  onExport,
  validationStatus
}: YamlPreviewPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedYaml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleReset = () => {
    const confirmReset = window.confirm("此操作将覆盖您当前编辑的全部内容，确定继续吗？");
    if (confirmReset) {
      onEditedYamlChange(generatedYaml);
    }
  };

  const statusColors = {
    valid: "border-b border-[rgba(61,139,109,0.32)] bg-[rgba(61,139,109,0.06)] text-[#2d7257]",
    yaml_syntax_error: "border-b border-[rgba(196,82,82,0.28)] bg-[rgba(196,82,82,0.06)] text-[#8e4343]",
    schema_error: "border-b border-[rgba(216,155,43,0.32)] bg-[rgba(216,155,43,0.06)] text-[#996a14]",
    consistency_error: "border-b border-[rgba(216,155,43,0.32)] bg-[rgba(216,155,43,0.06)] text-[#996a14]",
    unknown_error: "border-b border-[rgba(216,155,43,0.32)] bg-[rgba(216,155,43,0.06)] text-[#996a14]"
  };
  const statusColorClass = statusColors[validationStatus.statusKind] || statusColors.unknown_error;

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
            <span className="text-[11px] text-[var(--text-muted)] mt-1 block">上方折叠基线参考，下方自由修改</span>
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

      {/* Collapsible reference area for Generated YAML */}
      <details className="group border-b border-[var(--line-soft)] bg-[#faf7f1] overflow-hidden">
        <summary className="px-6 py-3 text-xs font-semibold text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-strong)] transition-colors select-none flex items-center justify-between">
          <span>展开/收起 AI 生成基线参考 (只读)</span>
          <span className="text-[10px] bg-[rgba(238,230,218,0.45)] px-2 py-0.5 rounded font-mono font-normal">只读参考</span>
        </summary>
        <div className="border-t border-[var(--line-soft)] max-h-60 overflow-auto bg-[#33302C] text-[#F7F0E9] p-6 font-mono text-sm leading-6">
          <code>{generatedYaml}</code>
        </div>
      </details>

      {/* Edited YAML Workspace */}
      <div className="flex flex-col min-h-[32rem] bg-[#fffdfa]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line-soft)] bg-[rgba(255,255,255,0.7)] px-6 py-4">
          <div>
            <p className="section-kicker">当前可编辑 YAML</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              用于校验和导出的工作草稿副本。
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              className="cta-button cta-secondary inline-flex items-center gap-1.5 rounded-[4px] px-3 py-2 text-xs"
              title="会覆盖当前编辑内容"
              type="button"
              onClick={handleReset}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              恢复为生成版本
            </button>
            <button
              className="cta-button cta-secondary inline-flex items-center gap-1.5 rounded-[4px] px-3 py-2 text-xs"
              type="button"
              onClick={handleCopy}
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? "已复制！" : "复制 YAML"}
            </button>
            <button
              className="cta-button cta-primary inline-flex items-center gap-1.5 rounded-[4px] px-4 py-2 text-xs"
              disabled={!canExport}
              aria-label="导出 YAML"
              type="button"
              onClick={onExport}
            >
              <Download className="w-3.5 h-3.5" />
              导出 YAML
            </button>
          </div>
        </div>

        {/* Live validation status bar */}
        <div className={`px-6 py-3 text-xs font-semibold flex items-center gap-1.5 ${statusColorClass}`}>
          <span>{validationStatus.shortMessage}</span>
        </div>

        <label className="sr-only" htmlFor="edited-yaml">
          编辑中的 YAML
        </label>
        <textarea
          id="edited-yaml"
          aria-label="编辑中的 YAML"
          className="flex-grow w-full min-h-[26rem] resize-none bg-[#33302C] text-[#F7F0E9] p-6 font-mono text-sm leading-6 outline-none"
          spellCheck={false}
          value={editedYaml}
          onChange={(event) => onEditedYamlChange(event.target.value)}
        />
      </div>
    </div>
  );
}
