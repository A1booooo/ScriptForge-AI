# YAML Schema 设计文档

本文档说明 ScriptForge AI 当前使用的 screenplay YAML 设计。本文严格以仓库现有实现为依据，覆盖 `packages/shared` 中已经存在的共享契约、shared validator runtime，以及 `apps/web` 中已经存在的 YAML 工作区 / 校验结果 / 导出流程。

Schema 不是 LLM provider 的原始响应格式，而是后端从模型输出中提取、解析并校验后的结构化剧本契约。它也不是 Final Draft、Fountain 或传统行业剧本排版格式的替代品，而是 AI 小说改编工作流的结构化中间层。

## 当前范围

当前 YAML 契约服务于仓库内已经实现的一条结构化改编链路：

- 后端从真实 LLM 返回文本中提取 JSON object
- 对结果执行 `JSON.parse`
- 规范化 `metadata.title`
- 基于 shared schema validation 与 consistency checks 收敛出 `ScreenplayDocument`
- 前端把该对象序列化为可读、可编辑、可校验、可导出的 YAML

当前文档不定义以下内容：

- LLM provider 的原始文本响应格式
- 面向外部工具的行业剧本交换格式
- Final Draft / Fountain 兼容格式

## 设计目标

当前设计围绕以下五个实际目标展开。

### 1. 使草稿可被机器校验

screenplay draft 需要具备稳定的文档结构，才能由 `packages/shared/src/screenplaySchema.ts` 使用 `JSON Schema` 执行校验，并将失败结果归一化为 `ValidationIssue[]`。

### 2. 使草稿具备可引用关系

角色、地点、源章节、场景、beats 与 dialogue 需要稳定标识符，以便后续检查能够发现断裂引用，而不是把整份文档视为无结构文本。

### 3. 保持 YAML 可编辑性

当前前端同时暴露只读的 generated baseline 与可编辑的 YAML working copy。因此，文档结构既要对人工编辑保持可读性，也要足够严格以支撑校验。

### 4. 保留源内容可追溯性

当前 schema 在 scene 与 beat 层保留了到 source chapter identifier 的显式链接，使草稿可以对照提交的章节集合进行检查。

### 5. 支撑当前工作台而不过度承诺

当前共享 `ScreenplayDocument` 结构已经能够支撑仓库内现有的 generated-draft reference views，例如 `Scene Board` 与 `Character Bible`；同时，校验与导出仍然保持在独立的 edited-YAML 路径中。

## 为什么选择 YAML

在当前项目阶段，仓库选择 YAML 作为可编辑草稿表面，是因为它在人工可读性与机器可校验性之间更适合作为人机协作中间层。

### YAML 与 JSON 的取舍

JSON 对机器更直接，但对于当前前端工作区中的人工编辑场景并不友好。仓库当前已经将共享 `ScreenplayDocument` 对象序列化为格式化 YAML 以供查看和编辑，shared validation runtime 也已直接支持 YAML parse。

### YAML 与 Markdown / 自由文本的取舍

Markdown 或自由文本虽更宽松，但无法稳定保留 scenes、chapter references、dialogue speaker 与可复用实体的结构化契约。当前 validator 依赖的是显式结构字段与可引用 ID，而不是从散文文本中做启发式提取。

### YAML 与行业剧本格式的取舍

当前产品目标并不是构建 Final Draft 或 Fountain 兼容的编剧工具。当前阶段真正需要的是一种严格、可检查、可展示、可导出、适合作为 AI 改编中间层的结构化剧本契约。

## 真实实现边界

本文档说明基于以下当前实现锚点：

- `packages/shared/src/screenplayTypes.ts`
- `packages/shared/src/screenplaySchema.ts`
- `packages/shared/src/validation/parseScreenplayYaml.ts`
- `packages/shared/src/validation/schemaValidator.ts`
- `packages/shared/src/validation/consistencyChecks.ts`
- `packages/shared/src/validation/validateScreenplayYaml.ts`
- `apps/api/src/services/realConversionService.ts`
- `apps/web/src/components/ConversionResultWorkbench.tsx`
- `apps/web/src/components/YamlPreviewPanel.tsx`
- `apps/web/src/components/ValidationResultPanel.tsx`

如代码与旧文档存在不一致，以代码作为事实来源。

## YAML 文档形状

当前根文档类型为 `ScreenplayDocument`：

```yaml
schema_version: "1.0.0"
metadata:
  title: "Lanterns Over River Street"
  source_chapters:
    - chapter_id: chapter_01
      chapter_title: The Letter at Dawn
      chapter_order: 1
      summary: Lin Xia discovers a letter that may prove her brother is alive.
  genre: drama thriller
  language: zh-CN
  adaptation_mode: dramatic
  logline: A courier follows a rumor trail to uncover a political cover-up.
  adaptation_notes:
    - Travel beats are compressed for stronger scene momentum.
characters:
  - id: char_lin_xia
    name: Lin Xia
    role: protagonist
    description: A stubborn courier with unresolved grief.
    motivation: Find her missing brother.
    speech_style: Direct and emotionally restrained.
    relationships:
      - character_id: char_captain_zhou
        relation: adversarial ally
        description: Distrusts him but believes he knows the truth.
locations:
  - id: loc_river_market
    name: River Street Market
    description: A crowded covered market near the river.
    atmosphere: Wet, noisy, and tense.
scenes:
  - id: scene_market_reveal
    title: Rumors Under Lantern Light
    chapter_refs:
      - chapter_01
      - chapter_02
    location_id: loc_river_market
    time_of_day: evening
    characters:
      - char_lin_xia
      - char_captain_zhou
    summary: Lin Xia corners the captain in the market.
    conflict: She needs the truth while he needs control.
    beats:
      - id: beat_market_probe
        summary: Lin Xia challenges the official story.
        purpose: Surface the transfer cover-up.
        source_chapter_ids:
          - chapter_01
          - chapter_02
    dialogue:
      - character_id: char_lin_xia
        line: You sealed the road record after midnight.
        emotion: controlled anger
        action: She drops the wet ledger scrap on the table.
    stage_directions:
      - id: dir_market_noise
        instruction: Rain and vendor calls cover the short silences.
    adaptation_notes:
      - Merged several rumor beats into one confrontation.
quality_hints:
  coverage_notes:
    - All source chapters are represented.
  character_consistency_notes:
    - Keep Lin Xia action-first in later rewrites.
  pacing_notes:
    - The current draft intentionally moves quickly into confrontation.
  revision_suggestions:
    - Add a supporting witness only if public pressure is needed.
```

在顶层，当前 schema 明确要求以下 section：

- `schema_version`
- `metadata`
- `characters`
- `locations`
- `scenes`
- `quality_hints`

当前 `JSON Schema` 在根层及大多数嵌套对象上均设置了 `additionalProperties: false`，因此这是一种严格文档形状，而不是开放式 metadata 容器。

## 字段设计 rationale

### `schema_version`

字段目的：

- 使 YAML 契约具备明确版本
- 使 shared schema 可以要求一个已知 contract version

当前约束：

- required
- 必须等于 `SCREENPLAY_SCHEMA_VERSION`
- 当前值为 `"1.0.0"`

### `metadata`

字段目的：

- 统一承载标题、源章节来源、改编模式、语言、题材和高层改编说明
- 把 draft 级上下文与 scene 级执行细节分离

关键子字段：

- `title`
- `source_chapters`
- `genre`
- `language`
- `adaptation_mode`
- `logline`
- `adaptation_notes`

### `metadata.source_chapters`

字段目的：

- 保留章节来源与顺序
- 定义所有后续 `chapter_refs` / `source_chapter_ids` 的合法目标集合

当前约束：

- required
- 最少 3 项
- 每项必须包含 `chapter_id`、`chapter_title`、`chapter_order`、`summary`

### `characters` 与 `locations`

字段目的：

- 把角色与地点建模为可复用实体
- 为 `Scene Board`、`Character Bible` 和 consistency checks 提供统一引用目标

### `scenes`

字段目的：

- 承载剧本草稿的核心戏剧单元
- 在 scene 层同时保留摘要、冲突、引用、节奏与对话

关键子字段：

- `id`
- `title`
- `chapter_refs`
- `location_id`
- `time_of_day`
- `characters`
- `summary`
- `conflict`
- `beats`
- `dialogue`
- `stage_directions`
- `adaptation_notes`

### `quality_hints`

字段目的：

- 随 draft 一起携带结构化 advisory 信息
- 为后续展示与人工修改提供可读线索

当前子字段：

- `coverage_notes`
- `character_consistency_notes`
- `pacing_notes`
- `revision_suggestions`

## 标识符与引用模型

当前 schema 使用显式 identifier string，而不是隐式的 name matching。

### Identifier 形状

当前 `JSON Schema` 对多类 identifier 字段使用相同 pattern 约束：

- 必须是非空字符串
- 必须匹配 `^[a-z][a-z0-9_-]*$`

适用范围包括：

- `chapter_id`
- `characters[].id`
- `locations[].id`
- `scenes[].id`
- `beats[].id`
- 指向这些 ID 的 reference fields

### 通过 `Consistency Checks` 保证跨引用完整性

`JSON Schema` 只能验证字段存在且形状正确，无法证明 target 是否真的存在于同一文档的其他位置。这一职责由 `Consistency Checks` 负责。

当前覆盖：

- 角色关系引用必须存在
- scene `location_id` 必须存在
- scene `characters[]` 必须存在
- dialogue `character_id` 必须存在
- scene `chapter_refs[]` 必须存在
- beat `source_chapter_ids[]` 必须存在
- character / location / scene / source chapter 的重复 ID 会被拒绝

## 校验策略

当前 shared validator runtime 采用分层设计。

### 1. YAML parse

实现位置：

- `packages/shared/src/validation/parseScreenplayYaml.ts`

职责：

- 将原始 YAML text 解析为 candidate object
- 一旦 YAML 语法无效，则立刻停止后续流程

### 2. `JSON Schema` validation

实现位置：

- `packages/shared/src/validation/schemaValidator.ts`

职责：

- 对解析结果执行 `screenplayDocumentSchema` 校验
- 约束 required fields、object shape、enum、const、string length、array minimums、identifier pattern 以及 `additionalProperties: false`

### 3. `Consistency Checks`

实现位置：

- `packages/shared/src/validation/consistencyChecks.ts`

职责：

- 在 schema validation 成功后，校验跨引用完整性与 duplicate-ID 完整性

### 4. 聚合校验入口

实现位置：

- `packages/shared/src/validation/validateScreenplayYaml.ts`

职责：

- 按当前顺序执行：
  - parse
  - schema validation
  - consistency checks

## 与真实 LLM 链路的关系

当前 schema 的位置在真实链路中非常明确：

1. 真实 LLM 返回文本形式的 JSON draft。
2. 后端先 extract first JSON object。
3. 后端执行 `JSON.parse`。
4. 后端规范化 `metadata.title`。
5. 后端执行 shared schema validation。
6. 后端执行 consistency checks。
7. 全部通过后，结果才作为 `ScreenplayDocument` 返回给前端。

这意味着：

- schema 不是 provider 原始响应格式
- schema 是后端收敛和校验后的结构化剧本契约
- schema 负责定义“什么样的 draft 可以进入工作台与 YAML 工作流”

## repair 边界

repair 是真实链路中的一次性补救步骤，而不是通用解析器。

- 仅在 `JSON.parse` 成功，但 schema validation 或 consistency checks 失败时，才触发一次 repair。
- repair 输入是“原始 draft 对象 + 校验问题摘要”。
- repair 输出仍需重新经过解析、标题规范化、schema validation 和 consistency checks。

以下情况不会触发 repair：

- malformed JSON
- missing API key
- timeout
- rate limited
- provider response invalid

## 前端工作流映射

### `Generated YAML`

- 通过 `screenplayToYaml()` 从 `result.screenplay` 序列化得到
- 作为最新 generated draft 的只读基线

### `Edited YAML`

- 由 `Generated YAML` 初始化出的本地可编辑 working copy
- 是唯一用于 shared validation 与导出的 YAML 文本来源

关键边界：

- `Edited YAML` 不会实时驱动 `Scene Board`、`Character Bible`、`Chapter Analyzer`、`Adaptation Quality Score` 或 `Rewrite Suggestions` 的重算

### `Validation Result`

- 来源于 `validateScreenplayYaml(editedYaml)`
- 展示当前 `Edited YAML` 的 parse、schema 与 consistency 结果
- 是导出开关的真实门禁

### `Export YAML`

- 下载的是当前 `Edited YAML` 文本，而不是原始 `Generated YAML`
- 只有 shared validation result `ok` 时才启用

### 轻量结构检查

- 当前应用包含一层 generated-draft review panel
- 它只做轻量结构检查
- 它不能替代 `Validation Result` 所使用的 parse -> schema -> consistency 校验链路

## mock 与 deterministic 边界

### mock conversion 边界

- 当前 mock conversion 不是真实用户主链路
- `POST /api/conversions/mock` 仍然存在
- 它仍基于 shared `sampleScreenplay` contract
- 它的定位是开发 / 测试用途

### deterministic analysis 边界

当前 `Chapter Analyzer`、`Adaptation Quality Score` 与 `Rewrite Suggestions` 都属于 deterministic frontend pipeline，而不是真实 LLM reasoning。

- `Chapter Analyzer` 使用 submitted source snapshot 与 generated-draft references
- `Adaptation Quality Score` 使用 generated draft structure、chapter analysis signals 与当前 YAML validation state
- `Rewrite Suggestions` 使用 generated draft、chapter analysis output 与 quality score output 的 deterministic signals

## 设计取舍

### 严格性优先于松散 authoring

当前 schema 严格且封闭，是因为仓库现阶段对“可预测校验”和“稳定展示面”的需求，高于对宽松 authoring freedom 的需求。

### 显式引用优先于隐式理解

ID 与 reference fields 虽增加了文档长度，但它们使 runtime 可以直接发现断裂引用，而不是从 prose 中推断结构。

### 结构化中间层优先于行业兼容格式

当前 contract 围绕 AI 小说改编工作流的中间层设计，而不是围绕现有 screenplay interchange standards 设计。

### 分离 validation loop 优先于 live round-tripping

当前前端将 `Edited YAML` 的 validation / export 与 generated-draft reference panels 分离处理。这简化了当前 UI contract，也避免错误暗示“所有面板都已经支持完整的 edited-YAML round-tripping”。

## 非目标

本文档不声明当前 schema：

- 是 Final Draft 或 Fountain 的替代品
- 是通用行业剧本交换格式
- 是 LLM provider 的原始响应格式
- 已支持基于 `Edited YAML` 对所有展示面板的完整实时重算
- 使轻量结构检查等同于 shared validator runtime 的完整 UI
