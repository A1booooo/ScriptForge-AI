# ScriptForge AI

ScriptForge AI（剧本工坊）是一个面向小说作者的 AI 小说转剧本工具。当前仓库按任务阶段逐步交付，优先打通“输入章节 -> 请求转换 -> 查看结果摘要”的主链路，再继续扩展 YAML、校验、导出和创作分析能力。

## Current Status

当前已完成：

- T01：项目基础文档、任务边界、PR 模板和交付约束
- T02：`@scriptforge/shared` 共享类型、JSON Schema 常量和示例剧本对象
- T03：`@scriptforge/api` Fastify mock API
- T04：`@scriptforge/web` 前端章节输入工作台
- T05：`@scriptforge/web` 只读 YAML 预览与轻量 Preview checks

当前尚未实现：

- 真实 LLM 调用
- YAML parser
- 完整 JSON Schema validator runtime
- YAML parser
- Scene Board
- Character Bible
- Quality Score
- Rewrite Modes
- 导出功能
- 历史记录
- 登录 / 用户系统
- CI
- Docker

## Workspace Packages

- `packages/shared`
  - 提供 `ScreenplayDocument`、`AdaptationMode` 等 TypeScript 类型
  - 提供剧本 JSON Schema 常量
  - 提供 `sampleScreenplay` 示例对象
- `apps/api`
  - 提供 Fastify mock API
  - 当前包含 `GET /health` 和 `POST /api/conversions/mock`
- `apps/web`
  - 提供 T04/T05 前端章节输入工作台
  - 当前能力边界包含章节输入、改编模式选择、提交状态展示、mock 剧本摘要、只读 YAML 预览和轻量 Preview checks

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

## Frontend Workbench

T04/T05 对应的前端工作台，当前页面能力包括：

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
  - 基于 `@scriptforge/shared` `ScreenplayDocument` 的只读 YAML 预览
  - 轻量 Preview checks：
    - 顶层区块存在性
    - scenes 是否为空
    - scene 对 character / location 的引用是否可解析
  - “Full schema validator planned for later” 提示

当前明确不做：

- 完整 YAML parser / validator runtime
- Scene Board
- Character Bible
- Quality Score
- Rewrite Modes
- 导出
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

T05 对应验证命令：

```bash
corepack.cmd pnpm install
corepack.cmd pnpm --filter @scriptforge/shared typecheck
corepack.cmd pnpm --filter @scriptforge/api typecheck
corepack.cmd pnpm --filter @scriptforge/web typecheck
corepack.cmd pnpm --filter @scriptforge/web test
corepack.cmd pnpm --filter @scriptforge/web build
```

手动验证方式：

1. 启动 `apps/api`
2. 启动 `apps/web`
3. 输入项目标题、选择改编模式并填写 3 个章节
4. 点击“生成 mock 剧本摘要”
5. 检查 loading、错误提示、YAML 预览和 Preview checks 是否符合预期

## Dependency Notes

T04/T05 相关依赖及用途：

- `react`
  - 构建前端工作台界面
- `react-dom`
  - 将 React 应用挂载到浏览器
- `yaml`
  - 仅用于 `apps/web` 将共享 `ScreenplayDocument` 序列化为只读 YAML 字符串展示，不承担 YAML 解析或完整校验
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
  - 前端测试运行器
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

当前 README 只描述仓库中已经真实存在的能力。T05 的边界包括前端章节输入工作台、Mock API 调用、基础请求状态与摘要展示、只读 YAML 预览以及轻量 Preview checks；不包含真实 LLM、完整 YAML parser、完整 JSON Schema validator runtime、Scene Board、Character Bible、Quality Score、Rewrite Modes、导出、历史记录、用户系统、CI 或 Docker。
