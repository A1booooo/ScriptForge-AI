# Demo 指南

本文档用于当前仓库的现场演示或本地讲解。内容只覆盖已经实现的真实行为。

## Demo 视频

- 视频链接：[Bilibili Demo](https://www.bilibili.com/video/BV1CVEh6zE5c/)
- 当前 Demo 使用真实 LLM 主链路。
- 视频中的等待过程已剪辑；实际生成耗时取决于输入长度、模型响应速度和网络环境。

## 演示目标

演示的核心目标是让观众理解：

- ScriptForge AI 当前可以把至少 3 章小说输入送入真实 LLM conversion 流程。
- 后端不会直接把模型原始文本当成最终结果，而是会提取、解析并校验结构化草稿。
- 前端结果工作台会继续展示结构概览、结构分析、YAML 合约工作区和草稿视图。
- `Chapter Analyzer`、`Adaptation Quality Score`、`Rewrite Suggestions` 仍是 deterministic analysis，不是真实 LLM reasoning。

## 演示前准备

### 1. 安装依赖

```bash
corepack.cmd pnpm install
```

### 2. 配置 API `.env`

```powershell
Copy-Item apps/api/.env.example apps/api/.env
```

然后在 `apps/api/.env` 中填写真实 `LLM_API_KEY`。不要在演示中展示 API key。

### 3. 启动 API

```bash
corepack.cmd pnpm --filter @scriptforge/api dev
```

确认 `GET /health` 可访问：

- `http://127.0.0.1:3001/health`

### 4. 启动 Web

```bash
corepack.cmd pnpm --filter @scriptforge/web dev
```

默认地址：

- `http://127.0.0.1:5173`

### 5. 确认演示口径

- 当前前端主链路调用的是 `POST /api/conversions/real`。
- `加载示例章节` 只填充输入，不会直接生成结果。
- `POST /api/conversions/mock` 仍保留，但只是开发 / 测试用途。
- `Edited YAML` 只用于 validation / export，不实时驱动其余 generated-draft panels。

## 推荐演示路径

### 路线 A：加载示例章节后生成

这是最稳定、最适合正式演示的路径。

1. 打开首页。
2. 指出这是一个“输入小说章节 -> 输出结构化 YAML 剧本草稿”的工具。
3. 点击 `加载示例章节`。
4. 展示至少 3 章输入已经填充完成。
5. 说明此时仍未请求接口。
6. 点击 `真实 AI 生成剧本`。
7. 等待结果返回。
8. 进入结果工作台，按四个分区依次讲解。

建议讲法：

“这里的 `加载示例章节` 只会填入用于演示的章节素材，不会请求 mock 接口，也不会直接生成固定结果。真正的主流程是点击 `真实 AI 生成剧本` 后，调用 `POST /api/conversions/real`，再由后端做 JSON 提取、解析、标题规范化、shared schema 校验和一致性检查。”

### 路线 B：手动输入至少 3 章

适合展示输入工作台和动态章节能力。

1. 填写项目标题。
2. 选择一个改编模式，例如 `dramatic`。
3. 依次填写至少 3 个章节卡片。
4. 如需展示可扩展输入，可点击 `添加章节` 增加第 4 章。
5. 点击 `真实 AI 生成剧本`。
6. 等待结果返回。

## 推荐讲解顺序

### 1. 结果概览

- 强调这是 shared schema 校验通过后的结构化草稿。
- 指出 `conversion_id`、`source`、`chapter count` 和剧本标题。
- 说明质量评分是 deterministic readiness / quality signal，不是模型二次打分。

### 2. 结构分析

- `Chapter Analyzer`
  - 说明它基于 submitted source snapshot 和 generated draft 做 deterministic analysis。
- `Rewrite Suggestions`
  - 说明它是规则生成的修改建议，不会自动改写。

### 3. YAML 合约

- `Generated YAML`
  - 说明这是只读基线。
- `Edited YAML`
  - 说明这是本地工作副本，用于 validation / export。
- `Validation Result`
  - 说明这里是真正接 shared runtime 的 parse / schema / consistency 结果。
- 轻量结构检查
  - 说明它只是 generated draft 的轻量检查，不等同于 shared validator runtime。

### 4. 草稿视图

- `Scene Board`
  - 说明它从 generated draft 读取。
- `Character Bible`
  - 说明它作为草稿阅读辅助，而不是独立编辑源。

## repair 边界说明

讲解真实链路时，可以明确说：

- 真实 LLM 先返回文本形式的 JSON draft。
- 后端会 extract first JSON object、`JSON.parse`、normalize `metadata.title`，再走 shared schema validation 和 consistency checks。
- 只有在 parse 已成功、但校验失败时，才会触发一次 repair。

不要讲成以下口径：

- LLM 直接生成可信 `ScreenplayDocument`
- 任意失败都会自动 repair
- malformed JSON / timeout / missing API key 也会进入 repair

## 常见失败兜底

### 情况 1：未配置 LLM API Key

现象：

- 前端出现 `未配置 LLM API Key`

兜底：

1. 确认已复制并配置本地环境变量文件：
   ```powershell
   Copy-Item apps/api/.env.example apps/api/.env
   ```
2. 在 `apps/api/.env` 中正确填写 `LLM_API_KEY`。
3. 重启 API 服务。
4. 重试生成。

### 情况 2：provider 返回内容不合法

现象：

- 前端出现 `LLM 返回内容不是合法结构化剧本`
- 或 `生成结果未通过 Schema 校验`

兜底：

1. 说明当前后端不会直接相信 LLM 文本。
2. 强调 shared schema validation 是门禁。
3. 如需继续演示，可回到示例章节路径重新提交。

### 情况 3：API 没启动

现象：

- 页面可打开，但生成失败

兜底：

1. 检查 `apps/api` 是否正在运行。
2. 访问 `http://127.0.0.1:3001/health`。
3. 恢复后重新演示路线 A。

## 演示时不能误讲的边界

- 不能说 `Chapter Analyzer`、`Adaptation Quality Score`、`Rewrite Suggestions` 是真实 LLM reasoning。
- 不能说 `Edited YAML` 会实时驱动 `Scene Board`、`Character Bible`、`Chapter Analyzer`、`Adaptation Quality Score` 或 `Rewrite Suggestions`。
- 不能说轻量结构检查等同于 shared validator runtime。
- 不能说 mock endpoint 已被删除；它仍保留为开发 / 测试用途。
- 不能说 repair 会覆盖 malformed JSON、missing API key、timeout、rate limited 或 provider response invalid。

## 演示结束建议收口

“当前这个版本已经把真实 LLM conversion 主链路接上了，但它仍然坚持结构化 contract、YAML 工作流和 shared schema 校验边界，不会把未校验的模型输出直接当成最终结果。”
