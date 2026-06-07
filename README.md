# ScriptForge AI

ScriptForge AI（剧本工坊）是一个面向小说作者的结构化改编 Demo 项目。当前仓库已经打通一条可运行、可验证的真实主链路：输入至少 3 章小说内容，调用真实 LLM conversion，后端把模型输出收敛为 `ScreenplayDocument`，再在前端结果工作台中展示 YAML、校验结果和若干 deterministic analysis 面板。

## 项目定位

- 提供一个从小说章节输入到结构化 screenplay draft 展示的工作台。
- 用 `ScreenplayDocument`、YAML 和 shared validation runtime 把结果变成可检查、可编辑、可导出的结构化对象。
- 用 deterministic panels 展示章节覆盖、质量信号和改写建议等说明型能力。

## 当前真实能力

### 1. 真实 LLM conversion 主链路

- `apps/web` 提供项目标题、改编模式和至少 3 个章节输入。
- 用户主流程调用 `POST /api/conversions/real`。
- `apps/api` 复用现有 `apps/api/src/llm/*` client boundary 发起真实 LLM 请求。
- 后端会对 LLM 输出执行：
  - 提取 JSON object
  - `JSON.parse`
  - shared schema validation
  - shared consistency checks
- 校验通过后才返回 `screenplay: ScreenplayDocument`。

### 2. 示例章节加载

- 页面提供 `加载示例章节`。
- 该入口只会填入原创中文示例章节输入。
- 它不会请求 `/api/conversions/mock`。
- 它不会请求 `/api/conversions/real`。
- 它不会直接进入结果工作台。

### 3. 动态章节输入

- 默认显示 3 个章节输入卡片。
- 支持 `添加章节`。
- 超过 3 章后，额外章节支持删除。
- 章节总数不会低于 3。
- 提交时会发送当前全部 `chapters[]`。

### 4. 结果工作台

真实 conversion 成功后，前端会展示：

- `ConversionResultSummary`
- `Chapter Analyzer`
- `Generated YAML`
- `Edited YAML`
- `Validation Result`
- `Adaptation Quality Score`
- `Rewrite Suggestions`
- `Preview Checks`
- `Scene Board`
- `Character Bible`

### 5. YAML Workspace / Validation / Export

- `Generated YAML` 根据 `result.screenplay` 序列化得到，只读展示。
- `Edited YAML` 是本地可编辑副本。
- shared runtime 会对 `Edited YAML` 执行 parse、schema validation 和 consistency checks。
- 只有当前 `Edited YAML` 校验通过时，`Export YAML` 才可用。

### 6. shared contract 与 validator runtime

`packages/shared` 当前提供：

- `ScreenplayDocument`、`AdaptationMode` 等 TypeScript 类型
- JSON Schema 常量
- shared sample screenplay
- YAML parser
- schema validator
- consistency checks
- `validateScreenplayYaml()`

Schema 设计细节请见 [docs/schema.md](./docs/schema.md)。

## 真实链路与 mock / deterministic 边界

- `POST /api/conversions/real` 是用户主流程使用的真实 LLM conversion 入口。
- `POST /api/conversions/mock` 仍保留为开发 / 测试用途，不再作为用户主流程。
- mock response 仍基于 shared sample screenplay contract。
- `Chapter Analyzer`、`Adaptation Quality Score`、`Rewrite Suggestions` 仍是 deterministic analysis，不是真实 LLM reasoning。
- `Edited YAML` 只用于 validation / export，不实时驱动 `Scene Board`、`Character Bible`、`Chapter Analyzer`、`Adaptation Quality Score` 或 `Rewrite Suggestions`。
- `Preview Checks` 是基于 generated draft 的轻量检查，不等同于 shared validator runtime。

## 本地启动

安装依赖：

```bash
corepack.cmd pnpm install
```

启动 API：

```bash
corepack.cmd pnpm --filter @scriptforge/api dev
```

启动 Web：

```bash
corepack.cmd pnpm --filter @scriptforge/web dev
```

默认地址：

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

当前覆盖：

- `@scriptforge/shared` typecheck / test
- `@scriptforge/api` typecheck / test
- `@scriptforge/web` typecheck / test
- `@scriptforge/web` build

## Workspace 结构

### `packages/shared`

负责共享 contract 和 validation runtime：

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
- YAML Workspace / Validation Result / Export YAML
- deterministic analysis panels

## 当前未实现能力

- 历史记录
- 登录 / 用户系统
- 数据库存储
- Docker
- 真实 LLM rewrite 输出或自动改写应用
- streaming response

## 相关文档

- [docs/schema.md](./docs/schema.md)
- [docs/architecture.md](./docs/architecture.md)
- [docs/demo-guide.md](./docs/demo-guide.md)
