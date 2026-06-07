import { Edit3, Sliders, Sparkles, FileCheck, ChevronRight } from "lucide-react";

interface WorkflowStripProps {
  isSuccess: boolean;
}

export function WorkflowStrip({ isSuccess }: WorkflowStripProps) {
  return (
    <div className="workflow-strip py-4 border-b border-[var(--line-soft)] mb-6">
      <div className={`workflow-step ${!isSuccess ? "active font-bold" : ""}`}>
        <span className="workflow-step-num">
          <Edit3 className="w-3.5 h-3.5" />
        </span>
        <span>输入章节</span>
      </div>
      
      <ChevronRight className="w-4 h-4 text-[var(--line-soft)]" />
      
      <div className={`workflow-step ${!isSuccess ? "active font-bold" : ""}`}>
        <span className="workflow-step-num">
          <Sliders className="w-3.5 h-3.5" />
        </span>
        <span>选择模式</span>
      </div>
      
      <ChevronRight className="w-4 h-4 text-[var(--line-soft)]" />
      
      <div className={`workflow-step ${isSuccess ? "active font-bold" : "opacity-50"}`}>
        <span className="workflow-step-num">
          <Sparkles className="w-3.5 h-3.5" />
        </span>
        <span>生成工作台</span>
      </div>
      
      <ChevronRight className="w-4 h-4 text-[var(--line-soft)]" />
      
      <div className={`workflow-step ${isSuccess ? "active font-bold" : "opacity-50"}`}>
        <span className="workflow-step-num">
          <FileCheck className="w-3.5 h-3.5" />
        </span>
        <span>校验并导出 YAML</span>
      </div>
    </div>
  );
}
