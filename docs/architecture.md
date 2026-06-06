# 架构说明

本文档描述 ScriptForge AI 当前仓库里已经实现、已经可运行、已经可验证的真实架构。这里不再保留早期占位式规划口吻，所有说明都以当前 `apps/web`、`apps/api`、`packages/shared` 的实现为准。

如果需要字段级 schema 设计细节、rationale 或校验策略，请查看 [schema.md](./schema.md)。

## 当前真实数据流

当前主链路是：

1. 用户在 `apps/web` 输入项目标题、改编模式和至少 3 个章节。
2. 用户点击提交，或点击 `Run Demo Sample` 触发一键 Demo。
3. 前端调用 `POST /api/conversions/mock`。
4. `apps/api` 返回一个明确标记为 mock 的 `MockConversionResponse`，其中包含 `screenplay: ScreenplayDocument`。
5. 前端基于 `result.screenplay` 构建结果工作台：
   - `Generated YAML`
   - generated-draft reference panels
   - deterministic Demo analysis panels
6. 前端基于本地 `Edited YAML` 调用 shared runtime 执行 validation。
7. 只有 `Edited YAML` 校验通过时才允许 `Export YAML`。

这条链路当前不包含真实 LLM 前端生成流程。

## 模块职责

## `packages/shared`

`packages/shared` 是仓库的共享 contract 与 validation runtime 层。

### Contract 与 schema

核心文件：

- `packages/shared/src/screenplayTypes.ts`
- `packages/shared/src/screenplaySchema.ts`
- `packages/shared/src/examples/sampleScreenplay.ts`

职责：

- 定义 `ScreenplayDocument`
- 定义 `SCREENPLAY_SCHEMA_VERSION`
- 定义 `ADAPTATION_MODES`
- 提供 JSON Schema 常量
- 提供 shared sample screenplay，供 mock conversion 复用

这一层是前后端共同依赖的结构化 screenplay contract 来源。

### Parser / Validator / Consistency Checks

核心文件：

- `packages/shared/src/validation/parseScreenplayYaml.ts`
- `packages/shared/src/validation/schemaValidator.ts`
- `packages/shared/src/validation/consistencyChecks.ts`
- `packages/shared/src/validation/validateScreenplayYaml.ts`
- `packages/shared/src/validation/validationTypes.ts`

职责拆分：

- `parseScreenplayYaml()`
  - 负责 YAML parse
  - parse 失败时返回 `yaml_parse_error`
- `validateScreenplayDocument()`
  - 负责基于 JSON Schema 的结构校验
- `runScreenplayConsistencyChecks()`
  - 负责跨字段引用完整性与重复 ID 检查
- `validateScreenplayYaml()`
  - 负责按 `parse -> schema -> consistency` 的顺序组织完整校验流程

当前 shared validator runtime 是 `Edited YAML` 校验的真实执行入口。

## `apps/api`

`apps/api` 是当前的 Fastify 服务层，职责聚焦在健康检查、mock conversion 和内部 LLM boundary。

### Health

核心文件：

- `apps/api/src/server.ts`
- `apps/api/src/routes/health.ts`

当前暴露：

- `GET /health`

返回：

```json
{
  "ok": true,
  "service": "scriptforge-api"
}
```

### Mock conversion

核心文件：

- `apps/api/src/routes/mockConversions.ts`
- `apps/api/src/services/mockConversionService.ts`
- `apps/api/src/types.ts`

职责：

- 接收 `title`、`chapters`、`adaptation_mode`
- 校验请求体最小合法性
- 生成 `MockConversionResponse`
- 返回 `screenplay: ScreenplayDocument`
- 明确标记 `mock: true`
- 返回 warning，说明没有执行真实 LLM conversion

当前 `POST /api/conversions/mock` 会复用 `sampleScreenplay`，并按请求重写部分 metadata，例如：

- `metadata.title`
- `metadata.adaptation_mode`
- `metadata.source_chapters`

这条链路是当前真实可运行的转换入口，但它不是生产生成链路。

### 内部 LLM client boundary

核心文件：

- `apps/api/src/llm/config.ts`
- `apps/api/src/llm/errors.ts`
- `apps/api/src/llm/factory.ts`
- `apps/api/src/llm/openaiCompatibleClient.ts`
- `apps/api/src/services/llmConversionService.ts`

职责：

- 读取 `LLM_PROVIDER`、`LLM_MODEL`、`LLM_API_KEY`、`LLM_BASE_URL`、`LLM_TIMEOUT_MS`
- 约束当前 provider 为 `openai_compatible`
- 创建可注入 `fetch` 的 provider client
- 生成中间态 draft text
- 返回 provider / model metadata

当前边界：

- 这是 API 内部能力，不是前端主链路的一部分
- 当前前端不会调用这套 LLM client boundary
- 当前没有新增真实 public generation endpoint
- 当前不会把 LLM draft 自动归一化成最终 `ScreenplayDocument`

## `apps/web`

`apps/web` 是当前作者侧工作台，负责输入、提交、结果展示、YAML 工作区和 deterministic Demo panels。

### 章节输入与 `Run Demo Sample`

核心文件：

- `apps/web/src/App.tsx`
- `apps/web/src/components/ChapterInputPanel.tsx`
- `apps/web/src/components/AdaptationModeSelector.tsx`
- `apps/web/src/lib/formDefaults.ts`
- `apps/web/src/lib/demoFixtures.ts`

职责：

- 维护项目标题、改编模式和章节输入状态
- 保证至少 3 章才允许形成有效提交
- 提供 `Run Demo Sample`
- 在 Demo 路径下写入明确的 Demo disclosure

`Run Demo Sample` 的真实行为是：

1. 加载 `apps/web/src/lib/demoFixtures.ts` 中的本地 Demo fixture。
2. 立即复用同一个提交流程。
3. 调用 `POST /api/conversions/mock`。
4. 在结果区保留 Demo 标识。

它不是独立 demo endpoint，也不是新的后端链路。

### mock 提交与结果切换

核心文件：

- `apps/web/src/api/conversions.ts`
- `apps/web/src/components/ConversionStatusPanel.tsx`
- `apps/web/src/components/ConversionResultSummary.tsx`

职责：

- 发起 `fetch("/api/conversions/mock")`
- 处理 API 错误响应
- 在 `idle / loading / error / success` 间切换 UI
- 展示 `conversion_id`、mock 标识、章节数、标题与 warning

### 结果工作台

核心文件：

- `apps/web/src/components/ConversionResultWorkbench.tsx`

这是当前前端结果区的总装配层。它负责：

- 从 `result.screenplay` 生成只读 `Generated YAML`
- 维护本地 `Edited YAML`
- 调用 shared runtime 获取 `validationResult`
- 基于 generated draft 计算 deterministic Demo analysis
- 按固定顺序渲染各结果面板

## YAML Workspace / Validation Result / Export YAML

核心文件：

- `apps/web/src/components/YamlPreviewPanel.tsx`
- `apps/web/src/components/ValidationResultPanel.tsx`
- `apps/web/src/lib/screenplayToYaml.ts`
- `apps/web/src/lib/yamlExport.ts`

### `Generated YAML`

- 来源：`result.screenplay`
- 角色：只读基线
- 用途：展示最新生成结果

### `Edited YAML`

- 来源：由 `Generated YAML` 初始化
- 角色：本地可编辑工作副本
- 用途：validation / export 的唯一 YAML 文本来源

### `Validation Result`

- 来源：`validateScreenplayYaml(editedYaml)`
- 内容：parse、schema、consistency 三层结果
- 作用：展示问题摘要与 issue 列表，并决定是否允许导出

### `Export YAML`

- 仅在 `validationResult.ok === true` 时启用
- 导出的内容是当前 `Edited YAML`
- 不会导出只读的 `Generated YAML`

## Deterministic Demo analysis pipeline

当前 `Chapter Analyzer`、`Adaptation Quality Score`、`Rewrite Suggestions` 都不是 LLM 推理层，而是 deterministic Demo analysis。

### `Chapter Analyzer`

核心文件：

- `apps/web/src/lib/chapterAnalysis.ts`
- `apps/web/src/components/ChapterAnalyzerPanel.tsx`

输入：

- submitted source snapshot
- generated `ScreenplayDocument`

职责：

- 分析 source chapter 是否被显式引用
- 统计 adaptation choices
- 输出 coverage、missing conflicts、scene opportunities

它是规则驱动的 Demo 分析，不会调用真实模型。

### `Adaptation Quality Score`

核心文件：

- `apps/web/src/lib/adaptationQualityScore.ts`
- `apps/web/src/components/AdaptationQualityScorePanel.tsx`

输入：

- generated `ScreenplayDocument`
- `ChapterAnalyzer` 输出
- 当前 `validationResult`

职责：

- 计算 `structure`
- 计算 `character-coverage`
- 计算 `conflict-clarity`
- 计算 `schema-completeness`
- 汇总为整体 readiness / quality score

特别说明：

- 这一层虽然会读取当前 `validationResult` 信号，但它仍然是 deterministic Demo score
- 它不是实时 LLM 质量判断
- 它不会生成真实 rewrite 内容

### `Rewrite Suggestions`

核心文件：

- `apps/web/src/lib/rewriteSuggestions.ts`
- `apps/web/src/components/RewriteSuggestionsPanel.tsx`

输入：

- generated `ScreenplayDocument`
- `ChapterAnalyzer` 输出
- `AdaptationQualityScore` 输出

职责：

- 生成 `dialogue-enhancement`
- 生成 `pacing-adjustment`
- 生成 `scene-compression`

这些建议是规则生成的说明型建议：

- 不是实时 LLM rewrite
- 不会自动应用
- 不会修改 YAML

## Preview Checks 与 shared validator runtime 的区别

核心文件：

- `apps/web/src/lib/screenplayPreviewChecks.ts`
- `apps/web/src/components/PreviewChecksPanel.tsx`

`Preview Checks` 当前只做 generated-draft 轻量检查，例如：

- 顶层 section 是否存在
- 是否存在 scenes
- scene 的 character / location 引用是否可解析

它的定位是轻量 review panel，而不是 shared validator runtime 的前端等价物。

必须区分：

- `Preview Checks`
  - 基于 generated draft object
  - 轻量、快速、面向展示
- `Validation Result`
  - 基于 `Edited YAML`
  - 使用 shared `parse -> schema -> consistency` runtime
  - 是导出门禁的真实依据

## Edited YAML 与 generated-draft panels 的边界

这是当前前端行为最容易被误解的一条边界。

当前真实行为是：

- `Edited YAML` 只用于 validation / export
- `Scene Board`、`Character Bible`、`Chapter Analyzer`、`Rewrite Suggestions` 都继续基于 generated draft 展示
- `Adaptation Quality Score` 主要基于 generated draft 和 `Chapter Analyzer`，并额外读取当前 `validationResult` 作为一个信号

当前没有实现：

- 将 `Edited YAML` 重新解析为 canonical `ScreenplayDocument`
- 用用户编辑后的 YAML 反向驱动所有 generated-draft panels
- 完整的 edited-YAML round-trip result surface

## 非目标与当前未接入能力

以下内容当前不在已实现架构内：

- 真实 LLM 前端主链路
- 真实生产级 screenplay generation pipeline
- 新的 public LLM generation endpoint
- 自动改写应用
- 历史记录
- 用户系统
- 数据库存储
- Docker
