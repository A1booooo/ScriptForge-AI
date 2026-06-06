# ScriptForge AI

ScriptForge AI（剧本工坊）是一个面向小说作者的结构化改编 Demo 项目。当前仓库展示的是一条可运行、可验证、可演示的最小闭环：输入至少 3 章小说内容，提交到 mock conversion API，获得一个结构化 `ScreenplayDocument`，并在前端查看 YAML、校验结果和若干基于规则的 Demo 分析面板。

当前项目重点不是“真实 LLM 生产生成”，而是把结构化 screenplay contract、YAML 工作流、校验链路和可演示的结果工作台先搭建清楚。

## 项目定位

- 提供一个从小说章节输入到结构化 screenplay draft 展示的 Demo 工作台。
- 用 `ScreenplayDocument`、YAML 和 shared validation runtime 把结果变成可检查、可编辑、可导出的结构化对象。
- 用 deterministic Demo panels 展示章节覆盖、质量信号和改写建议的说明型能力。

## 当前真实能力

### 1. 章节输入与 mock 提交

- `apps/web` 提供项目标题、改编模式、3 个章节输入卡片。
- 前端提交到 `POST /api/conversions/mock`。
- 当前主链路只接 mock conversion，不接真实 LLM 前端生成链路。

### 2. 一键 Demo

- 页面提供 `Run Demo Sample`。
- 该入口会加载前端本地 Demo fixture，并立即复用现有 `POST /api/conversions/mock` 流程提交。
- 页面会在输入区和结果区同时保留 Demo 标识，避免误解为真实用户数据或真实 LLM 输出。

### 3. 结果工作台

提交成功后，前端会展示：

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

### 4. YAML Workspace / Validation / Export

- `Generated YAML` 是根据当前 `result.screenplay` 序列化得到的只读基线。
- `Edited YAML` 是本地可编辑工作副本。
- shared runtime 会对 `Edited YAML` 执行 parse、schema validation 和 consistency checks。
- 只有当前 `Edited YAML` 校验通过时，`Export YAML` 才可用。

### 5. shared contract 与 validator runtime

`packages/shared` 当前已经提供：

- `ScreenplayDocument`、`AdaptationMode` 等 TypeScript 类型
- JSON Schema 常量
- shared sample screenplay
- YAML parser
- schema validator
- consistency checks
- `validateScreenplayYaml()`

Schema 设计细节、字段 rationale 和校验策略请查看 [docs/schema.md](./docs/schema.md)。

## mock / deterministic Demo 边界

以下边界是当前仓库最重要的真实口径：

- `POST /api/conversions/mock` 是 mock conversion，不是生产生成链路。
- mock response 基于 shared sample screenplay contract，并只按请求内容改写部分 metadata。
- `apps/api` 内部已经存在 LLM client boundary，但它尚未接入前端主链路，也没有替代当前 mock conversion API。
- `Chapter Analyzer`、`Adaptation Quality Score`、`Rewrite Suggestions` 都是 deterministic Demo analysis，不是真实 LLM 推理。
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

仓库根目录验证命令：

```bash
corepack.cmd pnpm run typecheck
corepack.cmd pnpm run test
corepack.cmd pnpm run build
```

聚合验证入口：

```bash
corepack.cmd pnpm run verify
```

当前这些命令会覆盖真实存在的检查：

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

负责 Fastify 服务与 mock conversion：

- `GET /health`
- `POST /api/conversions/mock`
- `src/llm/*` 内部 LLM client boundary

### `apps/web`

负责作者侧工作台：

- 章节输入
- `Run Demo Sample`
- mock 提交
- 结果工作台
- YAML Workspace / Validation Result / Export YAML
- deterministic Demo analysis panels

## 当前未实现能力

以下能力当前没有落地，不应视为已完成：

- 真实 LLM 前端主链路接入
- 真实生产级 screenplay generation pipeline
- 真实 LLM rewrite 输出或自动改写应用
- 历史记录
- 登录 / 用户系统
- 数据库存储
- Docker

## 相关文档

- [docs/schema.md](./docs/schema.md)
- [docs/architecture.md](./docs/architecture.md)
- [docs/demo-guide.md](./docs/demo-guide.md)
