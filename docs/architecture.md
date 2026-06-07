# 架构说明

本文档描述 ScriptForge AI 当前仓库里已经实现、已经可运行、已经可验证的真实架构。所有说明都以当前 `apps/web`、`apps/api`、`packages/shared` 的实现为准。

## 当前真实数据流

当前主链路是：

1. 用户在 `apps/web` 输入项目标题、改编模式和至少 3 个章节。
2. 用户可先点击 `加载示例章节` 填充原创中文样例输入；该动作不会发请求。
3. 用户点击 `真实 AI 生成剧本`。
4. 前端调用 `POST /api/conversions/real`。
5. `apps/api` 通过现有 `apps/api/src/llm/*` boundary 向真实 provider 请求结构化剧本草稿。
6. 后端对 provider 返回内容执行：
   - strip markdown fence
   - 提取首个 JSON object
   - `JSON.parse`
   - shared schema validation
   - shared consistency checks
7. 只有校验通过时，后端才返回 `screenplay: ScreenplayDocument`。
8. 前端基于 `result.screenplay` 构建结果工作台。
9. 前端基于本地 `Edited YAML` 调用 shared runtime 执行 validation。
10. 只有 `Edited YAML` 校验通过时才允许 `Export YAML`。

## 模块职责

## `packages/shared`

`packages/shared` 是仓库的共享 contract 与 validation runtime 层。

核心文件：

- `packages/shared/src/screenplayTypes.ts`
- `packages/shared/src/screenplaySchema.ts`
- `packages/shared/src/examples/sampleScreenplay.ts`
- `packages/shared/src/validation/*`

职责：

- 定义 `ScreenplayDocument`
- 定义 `SCREENPLAY_SCHEMA_VERSION`
- 定义 `ADAPTATION_MODES`
- 提供 JSON Schema 常量
- 提供 shared sample screenplay
- 提供 YAML parse / schema validation / consistency checks

## `apps/api`

`apps/api` 是 Fastify 服务层，当前职责聚焦在健康检查、真实 conversion、保留的 mock conversion 与内部 LLM boundary。

### Health

- `GET /health`

### Real conversion

核心文件：

- `apps/api/src/routes/realConversions.ts`
- `apps/api/src/services/realConversionService.ts`
- `apps/api/src/services/llmConversionService.ts`
- `apps/api/src/llm/*`

职责：

- 接收 `title`、`chapters`、`adaptation_mode`
- 复用现有 LLM client boundary
- 请求真实 provider
- 将返回文本收敛为 JSON object
- 复用 shared validator 做 schema + consistency 校验
- 返回 `source: "real_llm"`、`mock: false` 和 `screenplay: ScreenplayDocument`

### Mock conversion

核心文件：

- `apps/api/src/routes/mockConversions.ts`
- `apps/api/src/services/mockConversionService.ts`

职责：

- 保留 `POST /api/conversions/mock`
- 继续复用 shared sample screenplay
- 保留开发 / 测试用途
- 不再作为前端主流程

### 内部 LLM client boundary

核心文件：

- `apps/api/src/llm/config.ts`
- `apps/api/src/llm/errors.ts`
- `apps/api/src/llm/factory.ts`
- `apps/api/src/llm/openaiCompatibleClient.ts`

职责：

- 读取 `LLM_PROVIDER`、`LLM_MODEL`、`LLM_API_KEY`、`LLM_BASE_URL`、`LLM_TIMEOUT_MS`
- 当前 provider 仍限定为 `openai_compatible`
- 支持 injected `fetch`
- 处理 `missing_api_key`、`request_failed`、`timeout`、`rate_limited`、`provider_response_invalid`

## `apps/web`

`apps/web` 是作者侧工作台，负责输入、提交、结果展示、YAML 工作区和 deterministic analysis panels。

### 输入侧

核心文件：

- `apps/web/src/App.tsx`
- `apps/web/src/components/ChapterInputPanel.tsx`
- `apps/web/src/components/AdaptationModeSelector.tsx`
- `apps/web/src/lib/formDefaults.ts`
- `apps/web/src/lib/sampleInputs.ts`

职责：

- 维护项目标题、改编模式和动态章节输入状态
- 默认展示 3 个章节
- 支持 `添加章节`
- 章节数大于 3 时允许删除额外章节
- 提供 `加载示例章节`
- 发起真实 LLM conversion 提交

### 结果工作台

核心文件：

- `apps/web/src/components/ConversionResultWorkbench.tsx`

职责：

- 基于 `result.screenplay` 生成只读 `Generated YAML`
- 维护本地 `Edited YAML`
- 调用 shared runtime 获取 `validationResult`
- 基于 generated draft 计算 deterministic analysis
- 按固定顺序渲染结果面板

## YAML Workspace / Validation Result / Export YAML

核心文件：

- `apps/web/src/components/YamlPreviewPanel.tsx`
- `apps/web/src/components/ValidationResultPanel.tsx`
- `apps/web/src/lib/screenplayToYaml.ts`
- `apps/web/src/lib/yamlExport.ts`

边界：

- `Generated YAML` 来源于 `result.screenplay`
- `Edited YAML` 是本地工作副本
- `Validation Result` 来源于 `validateScreenplayYaml(editedYaml)`
- `Export YAML` 只导出当前 `Edited YAML`

## Deterministic analysis 边界

以下面板仍是 deterministic analysis，而不是真实 LLM reasoning：

- `Chapter Analyzer`
- `Adaptation Quality Score`
- `Rewrite Suggestions`

它们消费 generated draft、submitted source snapshot 和 validation signal，但不会触发新的真实 LLM 请求。

## Preview Checks 与 shared validator runtime 的区别

- `Preview Checks`
  - 基于 generated draft object
  - 轻量、快速、面向展示
- `Validation Result`
  - 基于 `Edited YAML`
  - 使用 shared `parse -> schema -> consistency` runtime
  - 是导出门禁的真实依据

## 当前未实现能力

- 历史记录
- 登录 / 用户系统
- 数据库存储
- Docker
- streaming response
- 多轮 LLM repair
- 自动应用 rewrite suggestions
