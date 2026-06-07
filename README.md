# ScriptForge AI

ScriptForge AI（剧本工坊）是一个 AI 小说转结构化剧本工具：输入至少 3 章小说内容，调用真实 LLM 生成剧本草稿，再把结果收敛为可编辑、可校验、可导出的 YAML 剧本初稿。

## Demo 视频

- 视频链接：[Bilibili Demo](https://www.bilibili.com/video/BV1CVEh6zE5c/)
- 当前 Demo 使用真实 LLM 主链路。
- 视频中的等待过程已做剪辑；实际生成耗时取决于输入长度、模型响应速度和网络环境。

## 当前主链路

### 1. 输入与提交

- `apps/web` 提供项目标题、改编模式和至少 3 个章节输入。
- `加载示例章节` 只会填充示例输入，不会请求接口，也不会直接生成结果。
- 用户主流程提交到 `POST /api/conversions/real`。

### 2. 后端真实转换链路

- API 调用真实 LLM。
- LLM 返回文本形式的 JSON draft。
- 后端从文本中提取第一个 JSON object。
- 后端执行 `JSON.parse`。
- 后端把 `metadata.title` 规范化为当前提交标题。
- 后端执行 shared schema validation。
- 后端执行 consistency checks。
- 全部通过后，才返回 `ScreenplayDocument`。

### 3. repair 边界

- 仅在 `JSON.parse` 已成功，但 schema validation 或 consistency checks 失败时，才触发一次 repair。
- repair 成功后仍要重新经过标题规范化、schema validation 和 consistency checks。
- 以下情况不会进入 repair：
  - malformed JSON
  - missing API key
  - timeout
  - rate limited
  - provider response invalid

### 4. 前端结果工作台

真实转换成功后，前端结果工作台分为四个区域：

- `结果概览`
  - `ConversionResultSummary`
  - `Adaptation Quality Score`
- `结构分析`
  - `Chapter Analyzer`
  - `Rewrite Suggestions`
- `YAML 合约`
  - `Generated YAML`
  - `Edited YAML`
  - `Validation Result`
  - 轻量结构检查
- `草稿视图`
  - `Scene Board`
  - `Character Bible`

## YAML 工作流

- `Generated YAML` 来自 `result.screenplay` 的只读序列化结果。
- `Edited YAML` 是本地可编辑工作副本。
- shared runtime 会对 `Edited YAML` 执行 parse、schema validation 和 consistency checks。
- 只有当前 `Edited YAML` 校验通过时，`Export YAML` 才可用。

## 技术亮点

- Monorepo 结构：`apps/web` + `apps/api` + `packages/shared`
- 真实 LLM conversion 主链路
- `ScreenplayDocument` 结构化剧本契约
- YAML 合约工作流
- shared schema validation
- shared consistency checks
- 单次 repair
- YAML 编辑、校验与导出
- 结果区 deterministic 分析与建议层

## 第三方依赖与原创功能边界

### 第三方依赖说明

- `react` / `react-dom`：用于构建作者侧前端交互界面，包括章节输入、结果工作台和 YAML 编辑区。
- `vite`：用于前端本地开发、热更新和生产构建。
- `fastify`：用于承载后端 API 服务，包括健康检查、真实 conversion 入口和 mock conversion 入口。
- `ajv`：用于 `ScreenplayDocument` 的 JSON Schema runtime validation。
- `yaml`：用于 YAML 序列化与解析，支撑剧本草稿的生成、编辑和校验流程。
- `vitest`：用于 shared、api、web 三个 workspace 的自动化测试。
- `@testing-library/react` / `@testing-library/jest-dom`：用于前端组件与交互测试。
- `lucide-react`：用于前端界面的图标展示。
- `react-resizable-panels`：用于结果工作台中的可调整布局交互。
- `dotenv`：用于本地 API 环境变量加载，例如 `LLM_API_KEY`、`LLM_MODEL` 和 `LLM_BASE_URL`。

以上依赖主要提供通用框架、运行时能力和测试基础设施，并不等同于本项目的原创业务实现。

### 原创功能边界说明

本项目在上述第三方库之上实现的原创部分，主要包括：

- 小说章节输入与动态章节管理，包括章节卡片增删和表单状态编排。
- 至少三章输入约束，以及提交前的输入完整性校验。
- 真实 LLM conversion API 编排，即从前端提交到 `POST /api/conversions/real` 的主链路组织。
- `ScreenplayDocument` 结构化剧本契约设计，用于承载改编后的剧本草稿。
- LLM 输出的 JSON 提取、解析、Schema 校验与一致性检查，而不是直接信任模型原始文本。
- 仅在 parse 成功但校验失败时触发的一次性 repair 机制。
- YAML 生成、编辑、校验、复制、恢复与导出工作流。
- `Chapter Analyzer`、`Adaptation Quality Score`、`Rewrite Suggestions` 的 deterministic 分析逻辑；这些逻辑基于结构化信号和规则，不是 LLM 二次分析。
- `Scene Board` 与 `Character Bible` 的结构化展示。
- README 与 demo guide 中面向评审复现的演示说明与边界约束。

本项目当前不宣称自动完成完整剧本创作、通用行业剧本排版、或完全生产级的多轮智能创作系统能力。

## 真实链路与边界

### 真实 LLM 与 mock 边界

- `POST /api/conversions/real` 是用户主流程使用的真实入口。
- `POST /api/conversions/mock` 仍保留为开发 / 测试用途，不是当前最终演示主流程。
- mock response 仍基于 shared `sampleScreenplay` contract。

### deterministic 展示层边界

- `Chapter Analyzer`、`Adaptation Quality Score`、`Rewrite Suggestions` 是 deterministic frontend pipeline，不是真实 LLM 二次推理。
- 它们基于 generated draft、submitted source snapshot 和 validation signal 计算，不会发起新的真实 LLM 请求。

### Edited YAML 边界

- `Edited YAML` 只用于 validation / export。
- 它不会实时反向驱动 `Scene Board`、`Character Bible`、`Chapter Analyzer`、`Adaptation Quality Score` 或 `Rewrite Suggestions`。

### 轻量结构检查边界

- 轻量结构检查基于 generated draft 做快速展示检查。
- 它不等同于 `Validation Result` 所使用的 shared validator runtime。

## 本地运行

### 1. 安装依赖

```bash
corepack.cmd pnpm install
```

### 2. 配置 API `.env`

```powershell
Copy-Item apps/api/.env.example apps/api/.env
```

然后打开 `apps/api/.env` 并填写你自己的 `LLM_API_KEY`。默认模板如下：

```env
LLM_PROVIDER=openai_compatible
LLM_MODEL=deepseek-chat
LLM_API_KEY=your-actual-api-key
LLM_BASE_URL=https://api.deepseek.com
LLM_TIMEOUT_MS=120000
```

> [!WARNING]
> 请不要将包含真实 API Key 的 `.env` 文件提交到仓库。

### 3. 启动 API

```bash
corepack.cmd pnpm --filter @scriptforge/api dev
```

### 4. 启动 Web

```bash
corepack.cmd pnpm --filter @scriptforge/web dev
```

### 5. 默认地址

- API: `http://127.0.0.1:3001`
- Web: `http://127.0.0.1:5173`

补充说明：

- `apps/web` 在 Vite 开发环境下会把 `/api/*` 代理到 `http://127.0.0.1:3001`。
- 本地联调时应先启动 API，再启动 Web。

## 验证命令

```bash
corepack.cmd pnpm run typecheck
corepack.cmd pnpm run test
corepack.cmd pnpm run build
corepack.cmd pnpm run verify
```

## Workspace 结构

### `packages/shared`

负责共享 contract 与 validation runtime：

- `src/screenplayTypes.ts`
- `src/screenplaySchema.ts`
- `src/examples/sampleScreenplay.ts`
- `src/validation/*`

### `apps/api`

负责 Fastify 服务与 conversion endpoints：

- `GET /health`
- `POST /api/conversions/real`
- `POST /api/conversions/mock`
- `src/llm/*` 内部 LLM client boundary

### `apps/web`

负责作者侧工作台：

- 章节输入
- `加载示例章节`
- 真实 LLM 提交
- 结果工作台
- YAML 编辑 / 结构校验 / 导出
- deterministic 分析展示面板

## 当前未实现能力

- 登录 / 用户系统
- 历史记录
- 数据库存储
- Docker
- streaming response
- 真实 LLM rewrite 输出
- 自动应用 rewrite suggestions

## 相关文档

- [docs/schema.md](./docs/schema.md)
- [docs/architecture.md](./docs/architecture.md)
- [docs/demo-guide.md](./docs/demo-guide.md)
