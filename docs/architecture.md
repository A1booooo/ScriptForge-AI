# 架构说明

本文档描述 ScriptForge AI 当前仓库中已经实现、已经可运行、已经可验证的真实架构。所有说明都以当前 `apps/web`、`apps/api`、`packages/shared` 的实现为准。

## Monorepo 结构

- `apps/web`
  - 作者侧输入与结果工作台
- `apps/api`
  - Fastify API、真实转换入口、mock 转换入口、内部 LLM client boundary
- `packages/shared`
  - `ScreenplayDocument` contract、JSON Schema、YAML 校验 runtime、shared sample data

## 当前真实数据流

当前主链路是：

1. 用户在 `apps/web` 输入项目标题、改编模式和至少 3 个章节。
2. 用户可先点击 `加载示例章节` 填充示例输入；该操作不会请求接口。
3. 用户点击 `真实 AI 生成剧本`。
4. 前端调用 `POST /api/conversions/real`。
5. `apps/api` 通过 `apps/api/src/llm/*` boundary 调用真实 LLM。
6. provider 返回文本形式的 JSON draft。
7. 后端执行：
   - extract first JSON object
   - `JSON.parse`
   - normalize `metadata.title`
   - shared schema validation
   - consistency checks
8. 只有全部通过后，后端才返回 `screenplay: ScreenplayDocument`。
9. 前端基于 `result.screenplay` 构建结果工作台。
10. 前端基于本地 `Edited YAML` 调用 shared runtime 执行 validation。
11. 只有 `Edited YAML` 校验通过时才允许 `Export YAML`。

## repair 边界

真实转换链路中的 repair 是一次性兜底，而不是通用恢复层。

- 仅在 `JSON.parse` 已成功，但 schema validation 或 consistency checks 失败时触发一次 repair。
- repair 会把“原始 draft 对象 + 校验问题摘要”再次交给 LLM 修复。
- repair 输出仍需重新经过：
  - extract / parse
  - normalize `metadata.title`
  - shared schema validation
  - consistency checks

以下错误不会触发 repair：

- malformed JSON
- missing API key
- invalid provider
- timeout
- rate limited
- request failed
- provider response invalid

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
- `apps/api/src/routes/conversionRequest.ts`
- `apps/api/src/services/realConversionService.ts`
- `apps/api/src/services/llmConversionService.ts`
- `apps/api/src/services/validationIssueSummary.ts`
- `apps/api/src/llm/*`

职责：

- 接收 `title`、`chapters`、`adaptation_mode`
- 复用现有 LLM client boundary
- 请求真实 provider
- 从 provider 返回文本中提取第一个 JSON object
- 对结果执行 `JSON.parse`
- 规范化 `metadata.title`
- 复用 shared validator 做 schema validation + consistency checks
- 仅在 parse 成功但校验失败时触发一次 repair
- 返回 `source: "real_llm"`、`mock: false` 和 `screenplay: ScreenplayDocument`

### Mock conversion

核心文件：

- `apps/api/src/routes/mockConversions.ts`
- `apps/api/src/services/mockConversionService.ts`

职责：

- 保留 `POST /api/conversions/mock`
- 继续复用 shared sample screenplay
- 保留开发 / 测试用途
- 不作为当前用户主流程

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
- 处理 `missing_api_key`、`request_failed`、`timeout`、`rate_limited`、`provider_response_invalid`、`schema_validation_failed`

## `apps/web`

`apps/web` 是作者侧工作台，负责输入、提交、结果展示、YAML 工作区和 deterministic analysis panels。

### 输入区

核心文件：

- `apps/web/src/App.tsx`
- `apps/web/src/components/ChapterInputPanel.tsx`
- `apps/web/src/components/AdaptationModeSelector.tsx`
- `apps/web/src/lib/formDefaults.ts`
- `apps/web/src/lib/sampleInputs.ts`

职责：

- 维护项目标题、改编模式和动态章节输入状态
- 默认显示 3 个章节
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
- 按四大分区组织结果界面：
  - 结果概览
  - 结构分析
  - YAML 合约
  - 草稿视图

## YAML 工作区边界

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

## deterministic pipeline 边界

以下面板仍是 deterministic frontend pipeline，而不是真实 LLM reasoning：

- `Chapter Analyzer`
- `Adaptation Quality Score`
- `Rewrite Suggestions`

它们消费 generated draft、submitted source snapshot 和 validation signal，但不会触发新的真实 LLM 请求。

## 轻量结构检查与 shared validator runtime 的区别

- 轻量结构检查
  - 基于 generated draft object
  - 快速、轻量、面向展示
- `Validation Result`
  - 基于 `Edited YAML`
  - 使用 shared `parse -> schema -> consistency` runtime
  - 是导出门禁的真实依据

## 重要非目标

当前架构不包含以下能力：

- 登录 / 用户系统
- 数据库
- 历史记录
- Docker
- streaming response
- 多轮 LLM repair
- 基于 `Edited YAML` 反向驱动所有结果面板
- 自动应用 rewrite suggestions
