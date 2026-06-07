# Demo 指南

本文档用于当前仓库的现场演示或本地讲解。内容只覆盖已经实现的真实行为。

## 演示目标

演示的核心目标是让观众理解：

- ScriptForge AI 当前可以把至少 3 章小说输入送入一条真实 LLM conversion 流程。
- 返回结果是结构化 `ScreenplayDocument`，而不是不可检查的黑盒文本。
- 前端会继续展示 `Generated YAML`、`Edited YAML`、`Validation Result` 和 generated-draft reference panels。
- `Chapter Analyzer`、`Adaptation Quality Score`、`Rewrite Suggestions` 仍是 deterministic analysis，不是真实 LLM reasoning。

## 演示前准备

### 1. 安装依赖

```bash
corepack.cmd pnpm install
```

### 2. 启动 API

```bash
corepack.cmd pnpm --filter @scriptforge/api dev
```

确认 `GET /health` 可访问：

- `http://127.0.0.1:3001/health`

### 3. 启动 Web

```bash
corepack.cmd pnpm --filter @scriptforge/web dev
```

默认地址：

- `http://127.0.0.1:5173`

### 4. 确认演示口径

- 当前前端主链路调用的是 `POST /api/conversions/real`。
- `加载示例章节` 只填充输入，不直接生成结果。
- `POST /api/conversions/mock` 仍保留，但只是开发 / 测试用途。
- `Edited YAML` 只用于 validation / export，不实时驱动其余 generated-draft panels。

## 路线 A：加载示例章节后生成

这是最稳定、最适合正式演示的路径。

### 演示步骤

1. 打开 Web 页面。
2. 先指出输入区里的 Sample Input 提示文案。
3. 点击 `加载示例章节`。
4. 说明此时只是填充了输入素材，尚未发起生成。
5. 点击 `真实 AI 生成剧本`。
6. 等待结果工作台出现。
7. 依次讲解结果区各面板。

### 建议讲法

可以直接说：

“这里的 `加载示例章节` 只会填入原创中文章节素材，不会请求 mock 接口，也不会直接生成固定结果。真正的主流程是点击 `真实 AI 生成剧本` 后，调用 `POST /api/conversions/real`，再由后端做 shared schema 校验和一致性检查。”

## 路线 B：手动输入至少 3 章

这条路径适合展示输入工作台和动态章节能力。

### 演示步骤

1. 填写项目标题。
2. 选择一个改编模式，例如 `dramatic`。
3. 依次填写至少 3 个章节卡片。
4. 如需展示题目要求，可点击 `添加章节` 增加第 4 章。
5. 点击 `真实 AI 生成剧本`。
6. 等待结果工作台出现。

## 推荐讲解顺序

1. `ConversionResultSummary`
   - 强调这是 shared schema 校验通过后的结构化草稿
   - 指出 `conversion_id`、`source`、`chapter count`
2. `Chapter Analyzer`
   - 说明它基于 submitted source snapshot 和 generated draft 做 deterministic analysis
3. `Generated YAML`
   - 说明这是只读基线
4. `Edited YAML`
   - 说明这是本地工作副本，供 validation / export 使用
5. `Validation Result`
   - 说明这里是真正接 shared runtime 的 parse / schema / consistency 结果
6. `Adaptation Quality Score`
   - 说明它是规则计算的 readiness / quality signal
7. `Rewrite Suggestions`
   - 说明它是 deterministic suggestions，不会自动改写
8. `Preview Checks`
   - 说明它只是 generated-draft 轻量检查
9. `Scene Board`
10. `Character Bible`

## 常见失败兜底

### 情况 1：未配置 LLM API Key

现象：

- 前端出现 `未配置 LLM API Key`

兜底：

1. 配置 `.env` 或当前 shell 环境中的 `LLM_API_KEY`
2. 重启 API
3. 重新提交

### 情况 2：真实 provider 返回结构不合法

现象：

- 前端出现 `LLM 返回内容不是合法结构化剧本`
- 或 `生成结果未通过 Schema 校验`

兜底：

1. 说明当前后端不会直接相信 LLM 文本
2. 强调 shared schema validation 是门禁
3. 如需继续演示，可切回示例章节并重新提交

### 情况 3：API 没启动

现象：

- 页面可打开，但生成失败

兜底：

1. 检查 `apps/api` 是否正在运行
2. 访问 `http://127.0.0.1:3001/health`
3. 恢复后重新走路线 A

## 演示时不能误讲的边界

- 不能说 `Chapter Analyzer`、`Adaptation Quality Score`、`Rewrite Suggestions` 是真实 LLM reasoning。
- 不能说 `Edited YAML` 会实时驱动 `Scene Board`、`Character Bible`、`Chapter Analyzer`、`Adaptation Quality Score` 或 `Rewrite Suggestions`。
- 不能说 `Preview Checks` 等同于 shared validator runtime。
- 不能说 mock endpoint 已被删除；它仍保留为开发 / 测试用途。

## 演示结束建议收口

“当前这个版本已经把真实 LLM conversion 主链路接上了，但它仍然坚持结构化 contract、YAML 工作流和 shared schema 校验的边界，不会把未校验的模型输出直接当成最终结果。”
