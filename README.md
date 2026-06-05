# ScriptForge AI

ScriptForge AI（剧本工坊）是一个面向小说作者的 AI 小说转剧本工具。项目目标是把 3 个章节以上的小说文本转换为结构化、可编辑、可校验的剧本草稿，帮助作者更快进入二次打磨阶段。

本项目参加 2026 年 6 月 5 日至 2026 年 6 月 7 日的 72 小时作品开发比赛，当前仓库按任务阶段逐步推进实现。

## Current Status

当前仓库已经完成：

- T01：项目文档、任务边界、PR 模板和交付约束
- T02：`@scriptforge/shared` 共享类型、JSON Schema 常量、示例剧本对象
- T03：`@scriptforge/api` mock 小说转剧本 API

当前仓库尚未实现：

- 前端工作台
- 真实 LLM 调用
- YAML parser
- AJV validator runtime
- 历史记录
- 用户系统
- CI
- Docker
- streaming

## Workspace Packages

- `packages/shared`
  - 提供 `ScreenplayDocument`、`AdaptationMode` 等 TypeScript 类型
  - 提供剧本 JSON Schema 常量
  - 提供 `sampleScreenplay` 示例对象
- `apps/api`
  - 提供 Fastify mock API
  - 复用 `@scriptforge/shared` 中的类型和示例剧本

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
- `chapters` 至少 3 个
- 每个 chapter 都必须有非空 `id`、`title`、`content`
- `adaptation_mode` 必须是 `faithful`、`dramatic`、`short_drama` 之一

错误响应格式统一为：

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

- 返回结果明确标记为 mock 数据
- 不会伪装成真实 AI 输出
- `screenplay` 基于 `@scriptforge/shared` 中的 `sampleScreenplay`

## Development

安装依赖：

```bash
corepack.cmd pnpm install
```

启动 mock API：

```bash
corepack.cmd pnpm --filter @scriptforge/api dev
```

默认监听地址：

```text
http://127.0.0.1:3001
```

## Verification

T03 对应验证命令：

```bash
corepack.cmd pnpm install
corepack.cmd pnpm --filter @scriptforge/shared typecheck
corepack.cmd pnpm --filter @scriptforge/api typecheck
corepack.cmd pnpm --filter @scriptforge/api test
```

## Dependency Notes

本次 T03 新增依赖及用途：

- `fastify`：HTTP API 服务，承载 `GET /health` 和 `POST /api/conversions/mock`
- `vitest`：API 测试
- `tsx`：本地运行 TypeScript API
- `typescript`：类型检查
- `@types/node`：为 Fastify 入口、`process.env` 和测试环境提供 Node.js 类型定义

## Task Boundary

当前 README 只描述已经存在的真实能力。T03 的边界仅包括 mock 后端转换链路，不包含真实 LLM、前端、YAML 解析、AJV 运行时校验、历史记录、用户系统、CI、Docker 或 streaming。
