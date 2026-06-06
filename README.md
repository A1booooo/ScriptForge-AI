# ScriptForge AI

ScriptForge AI（剧本工坊）是一个面向小说作者的 AI 小说转剧本工具。当前仓库按任务阶段逐步交付，优先打通“输入章节 -> 请求转换 -> 查看结果摘要”的主链路，再继续扩展 YAML、校验、导出和创作分析能力。

## Current Status

当前已完成：

- T01：项目基础文档、任务边界、PR 模板和交付约束
- T02：`@scriptforge/shared` 共享类型、JSON Schema 常量和示例剧本对象
- T03：`@scriptforge/api` Fastify mock API
- T04：`@scriptforge/web` 前端章节输入工作台
- T05：`@scriptforge/web` 只读 YAML 预览与轻量 Preview checks
- T06：`@scriptforge/api` LLM client boundary、config、mockable provider client 与内部 draft service
- T07：`@scriptforge/shared` YAML parser、JSON Schema validator runtime、consistency checks 和稳定 `ValidationIssue[]` 结果结构
- T08：`@scriptforge/web` Scene Board 与 Character Bible 展示
- T09：`@scriptforge/web` Generated YAML / Edited YAML / Validation Result 闭环与 `.yaml` 导出
- T10：`@scriptforge/web` Chapter Analyzer 与 deterministic Demo analysis 展示
- T11：`@scriptforge/web` Adaptation Quality Score deterministic Demo 评分展示
- C01：仓库级 CI 与根 verification scripts

当前尚未实现：

- 真实 LLM public endpoint / 前端主链路接入
- Rewrite Modes
- 历史记录
- 登录 / 用户系统
- Docker

## Workspace Packages

- `packages/shared`
  - 提供 `ScreenplayDocument`、`AdaptationMode` 等 TypeScript 类型
  - 提供剧本 JSON Schema 常量
  - 提供 `sampleScreenplay` 示例对象
  - 提供 shared runtime YAML parser、schema validator、consistency checks 和 `validateScreenplayYaml()`
- `apps/api`
  - 提供 Fastify mock API
  - 当前包含 `GET /health` 和 `POST /api/conversions/mock`
  - 当前还包含 API 内部使用的 LLM client boundary、config、结构化错误类型和 mockable provider client；默认不暴露新的 public endpoint
- `apps/web`
  - 提供 T04/T05/T08/T09/T10/T11 前端章节输入工作台
  - 当前能力边界包含章节输入、改编模式选择、提交状态展示、mock 剧本摘要、Chapter Analyzer deterministic Demo analysis、Adaptation Quality Score deterministic Demo 评分、Generated YAML 基线、Edited YAML 编辑、shared validator runtime 校验结果、`.yaml` 导出、轻量 Preview checks、Scene Board 和 Character Bible

## Mock API

### `GET /health`

返回：

```json
{
  "ok": true,
  "service": "scriptforge-api"
}
```

### `POST /api/conversions/mock`

请求体：

```json
{
  "title": "River Street Mystery",
  "chapters": [
    {
      "id": "chapter_01",
      "title": "Dawn Letter",
      "content": "Lin Xia receives a letter at dawn."
    },
    {
      "id": "chapter_02",
      "title": "Market Rumors",
      "content": "She searches the market for clues."
    },
    {
      "id": "chapter_03",
      "title": "Watchtower Rain",
      "content": "She confronts the captain at night."
    }
  ],
  "adaptation_mode": "dramatic"
}
```

请求校验规则：

- `title` 必须是非空字符串
- `chapters` 至少包含 3 项
- 每个 chapter 必须有非空 `id`、`title`、`content`
- `adaptation_mode` 必须是 `faithful`、`dramatic`、`short_drama` 之一

错误响应格式：

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "..."
  }
}
```

成功响应包含：

- `conversion_id`
- `status`
- `mode`
- `input_summary`
- `screenplay`
- `warnings`
- `mock: true`

说明：

- 返回结果会明确标记为 mock 数据
- 不会伪装成真实 AI 输出
- `screenplay` 基于 `@scriptforge/shared` 中的 `sampleScreenplay`

## LLM Client Boundary

T06 当前只在 `apps/api` 内部建立 LLM client boundary，不接入前端主链路，也不替换现有 mock conversion API。

当前已完成的真实边界包括：

- `apps/api/src/llm/config.ts`
  - 读取 `LLM_PROVIDER`、`LLM_MODEL`、`LLM_API_KEY`、`LLM_BASE_URL`、`LLM_TIMEOUT_MS`
- `apps/api/src/llm/errors.ts`
  - 提供结构化错误类型：`missing_api_key`、`request_failed`、`provider_response_invalid`、`timeout`
- `apps/api/src/llm/openaiCompatibleClient.ts`
  - 基于 Node 24 原生 `fetch` 的 OpenAI-compatible provider client
  - `fetch` 可注入，便于单元测试，测试不会真实请求网络
  - timeout 使用 `AbortController`
- `apps/api/src/services/llmConversionService.ts`
  - 只负责编排中间态 draft 生成
  - 返回中间态 draft text 和 provider/model metadata
  - 不承诺最终 `ScreenplayDocument`

当前明确不做：

- 不新增真实 public endpoint
- 不接前端主链路
- 不在这个 API boundary 内接入 shared YAML parser / validator runtime
- 不做最终 schema-normalized result
- 不把未稳定的 provider contract 放进 `packages/shared`

环境变量说明：

- `LLM_PROVIDER`
  - 当前支持 `openai_compatible`
- `LLM_MODEL`
  - provider model name
- `LLM_API_KEY`
  - provider API key；README 只说明变量名，不展示真实值
- `LLM_BASE_URL`
  - provider base URL
- `LLM_TIMEOUT_MS`
  - request timeout in milliseconds

## Frontend Workbench

T04/T05/T08/T09/T10/T11 对应的前端工作台，当前页面能力包括：

- 输入项目标题
- 选择改编模式：`faithful`、`dramatic`、`short_drama`
- 填写 3 个默认章节卡片，每个卡片包含 `id`、`title`、`content`
- 提交到 `POST /api/conversions/mock`
- 展示 `idle / loading / error / success` 状态
- 成功后展示结果工作台：
  - `conversion_id`
  - `mock` 标记
  - 章节数量
  - `screenplay.metadata.title`
  - Chapter Analyzer：
    - 基于 submitted chapters snapshot + generated draft 做 deterministic rule-based analysis
    - 输出 adaptation summary、chapter coverage、missing conflicts 和 scene opportunities
    - 明确标注为 Demo analysis，不是真实 LLM 推理
  - Adaptation Quality Score：
    - 基于 generated draft structure、T10 Chapter Analyzer signals 与当前 YAML validation state 做 deterministic rule-based readiness / quality score
    - 展示 overall score，以及 structure、character coverage、conflict clarity、schema completeness 四个维度
    - 每个维度展示 score、reason、signal source
    - `schema completeness` 只读取当前 validation result 信号，不直接读取或重新解析 Edited YAML 文本
    - 明确标注为 deterministic Demo score，不是真实 LLM 质量判断，也不生成具体改写建议
  - Scene Board：
    - 展示 scene id / title、location、linked characters、chapter refs、beats 和 dialogue summary
    - 展示映射仅来自当前 `ScreenplayDocument` 字段与引用解析
  - Character Bible：
    - 展示 character id / name、role、description、motivation、speech style、relationships
    - 通过 `scenes` 反查 appearance scenes
  - 基于 `@scriptforge/shared` `ScreenplayDocument` 的 Generated YAML 只读基线
  - 可编辑的 Edited YAML 工作区
  - 基于 `@scriptforge/shared` `validateScreenplayYaml()` 的 Validation Result 面板
  - 仅当当前 Edited YAML 通过 parse / schema / consistency checks 时允许导出 `.yaml`
  - 轻量 Preview checks：
    - 顶层区块存在性
    - scenes 是否为空
    - scene 对 character / location 的引用是否可解析
  - 提示当前 Preview Checks 仍是 lightweight panel；shared validator runtime 已用于 Edited YAML 校验，Chapter Analyzer / Adaptation Quality Score / Scene Board / Character Bible 仍展示 generated draft 相关参考视图，其中 Chapter Analyzer 额外使用 submitted chapters snapshot 做 deterministic Demo analysis，而 Adaptation Quality Score 额外读取当前 validation result 状态信号

当前明确不做：

- Rewrite Modes
- 历史记录

## Development

安装依赖：

```bash
corepack.cmd pnpm install
```

启动 mock API：

```bash
corepack.cmd pnpm --filter @scriptforge/api dev
```

启动前端工作台：

```bash
corepack.cmd pnpm --filter @scriptforge/web dev
```

默认地址：

- API: `http://127.0.0.1:3001`
- Web: `http://127.0.0.1:5173`

说明：

- `apps/web` 在 Vite 开发环境下通过代理把 `/api/*` 转发到 `http://127.0.0.1:3001`
- 本地联调时请先启动 API，再启动 Web

## Verification

T06 / C01 对应验证命令：

```bash
corepack.cmd pnpm install
corepack.cmd pnpm run verify
```

`verify` 聚合脚本当前会运行这些真实存在的检查：

- `@scriptforge/shared` typecheck
- `@scriptforge/shared` test
- `@scriptforge/api` typecheck
- `@scriptforge/api` test
- `@scriptforge/web` typecheck
- `@scriptforge/web` test
- `@scriptforge/web` build

如需单独执行，可使用以下根脚本：

```bash
corepack.cmd pnpm run typecheck
corepack.cmd pnpm run test
corepack.cmd pnpm run build
```

## CI

C01 已接入 GitHub Actions CI，会在 `pull_request` 和 push 到 `main` 时运行与本地一致的验证入口：

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm run verify
```

CI 当前使用 `Node 24.x`，并通过 Corepack 启用根仓库已声明的 `pnpm@11.5.1`。

说明：

- C01 当前只接入仓库里真实存在的检查。
- 完整 schema validation 和 fixture verification 会在后续相关任务具备能力后再接入。
- 本次不新增 ESLint、Docker、demo fixtures 或新的测试框架。

手动验证方式：

1. 启动 `apps/api`
2. 启动 `apps/web`
3. 输入项目标题、选择改编模式并填写 3 个章节
4. 点击“生成 mock 剧本摘要”
5. 检查 loading、错误提示、YAML 预览和 Preview checks 是否符合预期

## Dependency Notes

T04/T05/T06/T07/T08/T09/T10/T11 相关依赖及用途：

- `react`
  - 构建前端工作台界面
- `react-dom`
  - 将 React 应用挂载到浏览器
- `yaml`
  - 用于 `apps/web` 的 Generated / Edited YAML 文本处理，以及 `packages/shared` 的 T07 parser runtime
- `ajv`
  - 用于 `packages/shared` 复用 `screenplayDocumentSchema` 执行 JSON Schema runtime validation，并将 Ajv 错误归一化为 `ValidationIssue[]`
- `vite`
  - 提供前端开发服务器与打包能力
- `@vitejs/plugin-react`
  - 提供 React 的 Vite 集成
- `tailwindcss`
  - 提供基础样式系统，支撑工作台布局、状态面板和交互状态样式
- `@tailwindcss/postcss`
  - 让 Tailwind 接入当前 PostCSS 构建链
- `postcss`
  - 支撑 CSS 构建处理
- `autoprefixer`
  - 补充浏览器兼容前缀处理
- `vitest`
  - 前端测试运行器；`apps/api` 也使用现有 Vitest 测试 LLM boundary
- `@testing-library/react`
  - 组件渲染与交互测试
- `@testing-library/jest-dom`
  - DOM 断言增强
- `jsdom`
  - 提供浏览器测试环境
- `@types/react`
  - React 类型定义
- `@types/react-dom`
  - React DOM 类型定义

## Task Boundary

当前 README 只描述仓库中已经真实存在的能力。当前边界包括前端章节输入工作台、Mock API 调用、基础请求状态与摘要展示、Chapter Analyzer deterministic Demo analysis、Adaptation Quality Score deterministic Demo 评分、Generated YAML 基线、Edited YAML 编辑、Validation Result、`.yaml` 导出、轻量 Preview checks、Scene Board、Character Bible、API 内部 LLM client boundary / config / mockable provider client / draft service、`@scriptforge/shared` YAML parser / JSON Schema validator runtime / consistency checks、项目级 CI 以及根 verification scripts；不包含真实 LLM public endpoint、前端主链路接入、真实 LLM 推理分析、Rewrite Modes、历史记录、用户系统、Docker，或任何未完成的后续能力。
