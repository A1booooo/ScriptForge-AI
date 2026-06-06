# Demo 指南

本文档用于当前仓库的现场演示或本地讲解。内容只覆盖已经实现的真实行为，默认以最稳定、最容易复现的演示路径为准。

## 演示目标

演示的核心目标是让观众理解：

- ScriptForge AI 当前可以把至少 3 章小说输入送入一条可运行的 mock conversion 流程。
- 返回结果是结构化 `ScreenplayDocument`，而不是不可检查的黑盒文本。
- 前端可以同时展示 `Generated YAML`、`Edited YAML`、`Validation Result` 和 generated-draft reference panels。
- `Chapter Analyzer`、`Adaptation Quality Score`、`Rewrite Suggestions` 当前是 deterministic Demo analysis，不是真实 LLM 推理。

## 演示前准备

### 1. 安装依赖

```bash
corepack.cmd pnpm install
```

### 2. 启动 API

```bash
corepack.cmd pnpm --filter @scriptforge/api dev
```

确认 `GET /health` 可访问，默认地址：

- `http://127.0.0.1:3001/health`

### 3. 启动 Web

```bash
corepack.cmd pnpm --filter @scriptforge/web dev
```

默认地址：

- `http://127.0.0.1:5173`

### 4. 确认演示口径

演示前请先统一下面几句口径：

- 当前前端主链路调用的是 `POST /api/conversions/mock`。
- 这不是生产生成链路，也不是接入真实 LLM 的端到端流程。
- API 内部虽然有 LLM client boundary，但尚未接入前端主链路。
- `Edited YAML` 只用于 validation / export，不实时驱动其余 generated-draft panels。

## 路线 A：`Run Demo Sample`

这是最稳定、最适合正式演示的路径。

### 演示步骤

1. 打开 Web 页面。
2. 先指出输入区里的 Demo 提示文案。
3. 点击 `Run Demo Sample`。
4. 等待请求完成，进入结果工作台。
5. 依次讲解结果区各面板。

### 这条路径适合强调什么

- 仓库已经内置了明确标识的 Demo fixture。
- 一键 Demo 仍然走真实前端提交流程，而不是静态截图。
- 结果页会明确保留 Demo disclosure，不会伪装成真实用户数据或真实 LLM 输出。

### 建议讲法

可以直接说：

“这里的 `Run Demo Sample` 会加载前端本地 Demo fixture，然后复用现有 `POST /api/conversions/mock` 提交流程。它不是新的后端接口，也不是接入真实 LLM 的演示模式。”

## 路线 B：手动输入 3 章

这条路径适合展示输入工作台和最小业务闭环。

### 演示步骤

1. 填写项目标题。
2. 选择一个改编模式，例如 `dramatic`。
3. 依次填写 3 个章节卡片的：
   - `id`
   - `title`
   - `content`
4. 点击提交按钮。
5. 等待结果工作台出现。

### 建议准备的输入形式

- 每章内容不需要很长，但要能看出明确情节推进。
- 至少准备 3 章，避免现场再补数据。
- 如果是中文演示，建议标题和正文用中文；`id` 保持类似 `chapter_01` 的结构化形式即可。

### 这条路径适合强调什么

- 当前工作台已经具备基本输入、提交、状态切换和结果展示能力。
- 返回结果虽然是 mock，但结构化 contract、YAML 工作流和校验链路是真实运行的。

## 推荐讲解顺序

无论路线 A 还是路线 B，结果区都建议按下面顺序讲解：

1. `ConversionResultSummary`
   - 强调这是 mock screenplay draft
   - 指出 `conversion_id`、chapter count、标题和 warning
2. `Chapter Analyzer`
   - 说明它基于 submitted source snapshot 和 generated draft 做 deterministic Demo analysis
3. `Generated YAML`
   - 说明这是只读基线，不可编辑
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
   - 展示 scene、location、characters、chapter refs 的结构化映射
10. `Character Bible`
   - 展示角色信息和 appearance scenes

## 常见失败兜底

### 情况 1：API 没启动

现象：

- 页面提交失败
- 前端停留在 error 状态

兜底：

1. 检查 `apps/api` 是否正在运行。
2. 访问 `http://127.0.0.1:3001/health`。
3. 恢复后优先走路线 A：`Run Demo Sample`。

### 情况 2：Web 已启动，但代理请求失败

现象：

- 页面可打开，但提交请求失败

兜底：

1. 确认 Vite dev server 正常运行在 `5173`。
2. 确认 API 在 `3001`。
3. 刷新页面后优先重试 `Run Demo Sample`。

### 情况 3：手动输入不完整导致提交失败

现象：

- 标题为空
- 少于 3 章
- 某章缺少 `id`、`title` 或 `content`

兜底：

- 直接切换到 `Run Demo Sample`，避免现场补填。

### 情况 4：想展示校验能力但现场编辑 YAML 失误

现象：

- `Validation Result` 出现 parse 或 schema 错误
- `Export YAML` 被禁用

兜底：

- 这本身也可以作为演示点，说明导出门禁是受 shared runtime 控制的。
- 如果不想停留太久，可以说明“这里只演示校验门禁”，然后刷新并重新走 `Run Demo Sample`。

## 演示时不能误讲的边界

以下内容不能说成“已经实现”：

- 不能说前端已经接入真实 LLM 主链路。
- 不能说 `POST /api/conversions/mock` 是生产生成链路。
- 不能说 API 内部 LLM client boundary 已经驱动当前前端生成。
- 不能说 `Chapter Analyzer`、`Adaptation Quality Score`、`Rewrite Suggestions` 是真实 LLM reasoning。
- 不能说 `Edited YAML` 会实时驱动 `Scene Board`、`Character Bible`、`Chapter Analyzer`、`Adaptation Quality Score` 或 `Rewrite Suggestions`。
- 不能说 `Preview Checks` 等同于 shared validator runtime。

更准确的表述应当是：

- 当前真实主链路是 mock conversion + shared YAML workflow + deterministic Demo analysis。
- shared validator runtime 当前服务于 `Edited YAML` 的 validation / export。
- generated-draft reference panels 仍然展示提交成功后得到的 generated draft 结果。

## 演示结束建议收口

建议用一句话收口：

“当前这个版本重点验证的是结构化 contract、YAML 工作流、校验闭环和可演示结果面板，而不是把真实 LLM 生产生成链路提前伪装成已经完成。”
