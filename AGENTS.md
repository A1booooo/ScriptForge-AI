# AGENTS.md

This file defines the working rules for contributors and AI coding agents in ScriptForge AI.

## Core Rules

- 一次只做一个任务。
- 不提前实现未来任务。
- main 分支始终可运行。
- 每个 PR 只做一件事。
- PR 标题与描述必须清楚。
- PR 描述必须包含功能描述、实现思路和测试方式。

## Scope Control

- 严格遵守当前任务的 Scope、Out of Scope 和 Expected changed files。
- 不允许把未来任务的实现混入当前 PR。
- 不允许创建大而全文件。
- 不允许把复杂逻辑塞进单个页面或 service。
- 如果发现任务范围不清晰，先补充说明或提出最小可执行边界，再继续。

## Verification Rules

- 行为变更必须有测试、fixture 或手动验证。
- bug fix 必须写 Root Cause 和 Regression Guard。
- 合并前必须运行与当前任务匹配的验证命令。
- 如果暂时没有自动化测试，必须写清手动验证方式。

## Frontend Verification Rules

- 前端本地验收默认采用轻量手动点检，不默认升级为完整浏览器自动化排障任务。
- 前端点检优先级固定为：先跑 typecheck / test / build，再启动 API 和 Web，确认页面可访问。
- 页面可访问后，只验证当前 Task 范围内最关键的 2-3 条交互，不扩展到未来任务或无关页面。
- A 级点检：每个前端 PR 必做，覆盖构建可通过、页面可访问、当前任务核心交互可完成。
- B 级点检：重要 UI PR 使用，在 A 级基础上补充关键状态切换、关键表单流或主要错误提示检查。
- C 级点检：Demo 前使用，在 B 级基础上补充演示路径连贯性、关键文案和主要视觉回归检查。
- 如果内置 browser 工具不稳定，优先切换到 Playwright CLI；如果仍无法稳定完成点检，应请求用户人工查看。
- 不要因为自动化工具异常就擅自修改产品代码；先区分是产品问题、测试工具问题还是本地环境问题。
- 不要为了观察 loading 状态而加入人为延迟，除非当前 Task 明确要求这样做。
- 前端点检报告必须明确区分产品问题、测试工具问题和本地环境问题，避免混淆结论。

## AI and YAML Rules

- LLM 输出必须经过结构化解析和校验。
- YAML 输出必须经过 schema validation。
- Mock / Demo 数据必须明确标注。
- 不允许把未校验的 LLM 原始输出直接作为最终结果。
- Schema、TypeScript 类型、fixtures 和 validator 的契约必须保持一致。

## Documentation Rules

- docs 必须和真实命令、路由、端口、环境变量保持同步。
- 引入依赖必须更新 README。
- 修改启动方式、验证命令、环境变量或目录结构时，必须同步更新相关文档。
- 文档不得描述尚未存在的可运行能力为已完成能力。

## Dependency Rules

- 引入第三方依赖必须说明用途。
- 引入第三方依赖必须更新 README。
- 不允许为临时 Demo 随意引入重型依赖。

## Branch and PR Discipline

- 每个任务使用独立任务分支。
- 每个 PR 保持小而可审查。
- PR 合并后 main 分支必须保持可运行。
- 禁止最后一天一次性导入大量代码。
