# ScriptForge AI

ScriptForge AI, 中文名“剧本工坊”，是面向小说作者的 AI 辅助剧本创作工具。本项目参加 2026 年 6 月 5 日 00:00 至 6 月 7 日 23:59 的 72 小时作品开发比赛，选择题目三：AI 小说转剧本工具。

## Project Positioning

许多小说作者希望把已有作品改编成剧本，但剧本结构、场景拆分、角色台词、动作描述和格式规范都会提高改编门槛。ScriptForge AI 的目标是把 3 个章节以上的小说文本转换为结构化、可编辑、可校验的 YAML 剧本初稿，让作者可以更快进入二次打磨阶段。

## Target Users

- 小说作者：希望快速获得剧本初稿，用于影视、短剧、广播剧或互动叙事改编。
- 编剧和内容策划：希望从长文本中提炼场景、角色、冲突和节奏。
- 小团队创作者：希望用结构化格式沉淀可复用的剧本资产。

## Core Features

- 输入 3 个章节以上的小说文本。
- 生成结构化 YAML 剧本初稿。
- 展示场景板、角色小传和校验结果。
- 支持 YAML 编辑、导出和改编报告。
- 提供 Schema Validation，帮助用户发现结构缺失和格式错误。

## MVP Scope

MVP 聚焦“小说章节输入到可校验 YAML 剧本初稿”的完整主链路：

- 章节输入工作台。
- mock conversion API。
- YAML 展示与校验结果。
- LLM client 接入。
- YAML parser、validator 和 consistency checks。
- Scene Board 与 Character Bible。
- YAML 导出与 adaptation report。

## Innovation Points

- 以 YAML Schema 作为剧本结构契约，降低 AI 输出不可控风险。
- 将小说改编拆成章节分析、场景生成、角色小传、质量评分和改写建议等可解释步骤。
- 同时面向 Demo 表达和工程质量，确保主分支持续可运行、PR 小步提交。
- 把“可编辑”和“可校验”作为核心体验，而不是只输出一段不可维护的文本。

## Planned Tech Stack

技术栈将在后续任务中确认和落地，当前 T01 不创建应用、不安装依赖、不实现业务代码。

- Frontend: planned web workbench for chapter input, YAML preview, validation, Scene Board, and Character Bible.
- Backend: planned conversion API, LLM orchestration, validation, scoring, and export services.
- Shared: planned TypeScript types, YAML Schema, fixtures, and validation contracts.
- Docs: schema design document, architecture notes, demo guide, and development rules.

## Startup Placeholder

启动方式将在前端、后端和验证脚本创建后补充。当前仓库处于 T01 文档基础阶段，没有可运行应用或依赖安装步骤。

## Development Workflow

- 一次只做一个任务。
- 每个 PR 只做一件事，并保持标题和描述清晰。
- PR 描述必须包含功能描述、实现思路和测试方式。
- main 分支必须始终保持可运行。
- 禁止最后一天一次性导入，必须持续 commit 和 PR。
- 引入第三方依赖时必须同步更新 README。
- 合并前必须完成与任务范围匹配的验证。

## Current Task Boundary

T01 只建立项目治理和文档基础，不创建前端、后端、依赖、业务代码、测试框架或 CI。
