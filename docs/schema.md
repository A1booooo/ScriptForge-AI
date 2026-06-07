# YAML Schema 设计文档

本文档说明 ScriptForge AI 当前使用的 screenplay YAML 设计。本文严格以仓库现有实现为依据，覆盖 `packages/shared` 中已经存在的共享契约、当前 shared validator runtime，以及 `apps/web` 中已经存在的 YAML Workspace / Validation Result / Export 流程。

当前 YAML 属于 Demo-oriented screenplay contract。它不是 Final Draft、Fountain，也不是行业标准剧本文件格式。

## 当前范围

当前 YAML 契约服务于仓库内已经实现的一条收敛型产品链路：

- 跨 package 共享的结构化 screenplay draft 对象
- 面向展示与编辑的 YAML 序列化
- 基于 parse、`JSON Schema` validation 与 `Consistency Checks` 的共享校验链路
- 前端中“查看 Generated YAML、编辑工作副本、校验 Edited YAML、通过后执行 Export YAML”的现有工作流

当前文档不定义以下内容：

- 面向生产环境真实生成链路的 LLM 输出契约
- 面向外部工具的剧本交换格式
- 面向未来所有 ScriptForge 功能的通用创作格式

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

### 5. 支撑当前 Demo 展示面而不过度承诺

当前共享 `ScreenplayDocument` 结构已经能够支撑仓库内现有的 generated-draft reference views，例如 Scene Board 与 Character Bible；同时，校验与导出仍然保持在独立的 edited-YAML 路径中。

## 为什么选择 YAML

在当前项目阶段，仓库选择 YAML 作为可编辑草稿表面，是因为它在人工可读性与机器可校验性之间，比主要替代方案更符合现阶段目标。

### YAML 与 JSON 的取舍

JSON 对机器更直接，但对于当前前端工作区中的人工作者编辑场景并不友好。仓库当前已经将共享 `ScreenplayDocument` 对象序列化为格式化 YAML 以供查看和编辑，shared validation runtime 也已直接支持 YAML parse。

### YAML 与 Markdown / 自由文本的取舍

Markdown 或自由文本虽然更宽松，但无法稳定保留 scenes、chapter references、dialogue speaker 与可复用实体的结构化契约。当前 validator 依赖的是显式结构字段与可引用 ID，而不是从散文文本中做启发式提取。

### YAML 与行业剧本格式的取舍

当前产品目标并不是构建 Final Draft 或 Fountain 兼容的编剧工具。当前阶段真正需要的是一种严格、可检查、适合 Demo、可序列化、可编辑、可校验、可导出的结构化草稿契约。

## 真实实现边界

本文档说明基于以下当前实现锚点：

- `packages/shared/src/screenplayTypes.ts`
- `packages/shared/src/screenplaySchema.ts`
- `packages/shared/src/validation/parseScreenplayYaml.ts`
- `packages/shared/src/validation/schemaValidator.ts`
- `packages/shared/src/validation/consistencyChecks.ts`
- `packages/shared/src/validation/validateScreenplayYaml.ts`
- `apps/web/src/components/ConversionResultWorkbench.tsx`
- `apps/web/src/components/YamlPreviewPanel.tsx`
- `apps/web/src/components/ValidationResultPanel.tsx`

若代码与旧文档存在不一致，以代码作为 D01 阶段的事实来源。

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

本节将“文档形状是什么”与“字段为什么存在”明确分开。

### `schema_version`

字段定义：

- 根层 contract marker

字段目的：

- 使 YAML 契约具有明确版本，而不是通过字段存在与否来推断
- 使 shared schema 可以要求一个已知 contract version

当前 required 边界：

- required
- 必须等于 `SCREENPLAY_SCHEMA_VERSION`
- 当前约束值为 `"1.0.0"`

### `metadata`

字段定义：

- 文档级 adaptation context

字段目的：

- 在统一位置保留 title、source chapter provenance、adaptation mode、language、genre 与高层 adaptation notes
- 将 draft 级上下文与 scene 级执行细节分离

当前 required 字段：

- `title`
- `source_chapters`
- `genre`
- `language`
- `adaptation_mode`
- `logline`
- `adaptation_notes`

#### `metadata.source_chapters`

字段定义：

- 当前 draft 对应的 source chapter 列表

字段目的：

- 定义后续引用必须指向的 chapter ID 集合
- 保留章节顺序与简短摘要，便于检查

当前 required 边界：

- required
- 最少 3 项
- 每项必须包含 `chapter_id`、`chapter_title`、`chapter_order`、`summary`

设计取舍：

- 当前 contract 存储的是标准化 chapter list，而不是原始源文本；因为 YAML draft 旨在表达结构化 screenplay 侧结果，而不是完整 novel input payload

#### `metadata.adaptation_mode`

字段定义：

- 当前 draft 声明的 adaptation mode

字段目的：

- 使当前 draft 与产品流程中选择的 mode 保持一致
- 将取值限制为仓库中已被稳定使用的可预测集合

当前 required 边界：

- required
- enum 约束为 `faithful`、`dramatic`、`short_drama`

### `characters`

字段定义：

- draft 角色的可复用实体列表

字段目的：

- 避免在每个 scene 或 dialogue line 中重复拷贝角色细节
- 为 scenes 与 dialogue 提供稳定引用目标
- 为 Scene Board 与 Character Bible 提供统一共享事实来源

当前 item 字段：

- `id`
- `name`
- `role`
- `description`
- `motivation`
- `speech_style`
- `relationships`

当前 required 边界：

- `characters` 在文档层 required
- 每个 character object 均要求以上全部字段

设计取舍：

- 当前 contract 偏向“完整角色条目”，而不是“逐步补全的部分草稿形状”，因为 validator 与现有展示面都默认角色对象已经包含 role、motivation 与 voice hints

#### `characters[].relationships`

字段定义：

- 角色之间的结构化关联

字段目的：

- 在角色名称变更后仍然保持关系信息稳定
- 通过 ID 而不是名称匹配支撑后续完整性检查

当前 required 边界：

- 每个 character 上 required
- 每条 relationship 必须包含 `character_id`、`relation`、`description`

### `locations`

字段定义：

- draft 地点的可复用实体列表

字段目的：

- 避免 scenes 中重复出现自由文本 location 描述
- 为 scenes 提供稳定 location reference target

当前 item 字段：

- `id`
- `name`
- `description`
- `atmosphere`

当前 required 边界：

- `locations` 在文档层 required
- 每个 location object 均要求以上全部字段

设计取舍：

- 当前 contract 采用顶层标准化 locations，而非 scene-local location string，这样缺失引用可以由 `Consistency Checks` 显式发现

### `scenes`

字段定义：

- draft 中核心的戏剧单元列表

字段目的：

- 承载实际 screenplay progression，同时保留到 source chapters、可复用实体与更细粒度 beat 结构的可追溯关系

当前 item 字段：

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

当前 required 边界：

- `scenes` 在文档层 required
- 每个 scene object 均要求以上全部字段

设计取舍：

- 当前 contract 被刻意设计得较为严格和完整，以满足现有 Demo review surfaces，而不是去表达一种稀疏、渐进填充式的剧本工作稿格式

#### `scenes[].chapter_refs`

字段定义：

- scene 到 source chapter 的显式链接

字段目的：

- 在 scene 级保留章节 provenance
- 使当前 deterministic Demo analysis 与 `Consistency Checks` 能依赖显式 identifier，而非文本推断

当前 required 边界：

- required
- 最少 1 项

#### `scenes[].location_id`

字段定义：

- scene 的地点引用

字段目的：

- 将 scene 连接到标准化顶层 location
- 支撑引用有效性校验

当前 required 边界：

- required
- 必须是 machine-readable identifier string

#### `scenes[].characters`

字段定义：

- 参与当前 scene 的角色引用列表

字段目的：

- 将 scene membership 与 dialogue 分离表达
- 支撑展示面与 `Consistency Checks`

当前 required 边界：

- required
- 最少 1 项

#### `scenes[].beats`

字段定义：

- scene 内部更细粒度的戏剧单元

字段目的：

- 在 scene 之下保留 adaptation detail
- 为 scene 内更小的戏剧转折保留 chapter provenance

当前 beat 字段：

- `id`
- `summary`
- `purpose`
- `source_chapter_ids`

当前 required 边界：

- `beats` 在每个 scene 上 required
- 每个 beat 要求以上全部字段
- 每个 beat 的 `source_chapter_ids` 至少 1 项

#### `scenes[].dialogue`

字段定义：

- 结构化 spoken lines

字段目的：

- 通过 `character_id` 保持 speaker identity 显式可解析
- 通过 `emotion` 与 `action` 保留台词之外的轻量表演上下文

当前 dialogue 字段：

- `character_id`
- `line`
- `emotion`
- `action`

当前 required 边界：

- `dialogue` 在每个 scene 上 required
- 每个 dialogue entry 要求以上全部字段

设计取舍：

- 当前 contract 将 dialogue 建模为结构化对象，而不是 screenplay 风格的纯文本段落，这样 validator 与展示面可以直接解析 speaker

#### `scenes[].stage_directions`

字段定义：

- 结构化的非对白表演或环境指令

字段目的：

- 将 scene blocking 与环境指令从 spoken lines 中分离出来

当前 required 边界：

- `stage_directions` 在每个 scene 上 required
- 每条 direction 必须包含 `id` 与 `instruction`

#### `scenes[].adaptation_notes`

字段定义：

- scene 级的压缩、删改、重组说明

字段目的：

- 记录显式 adaptation decisions，而不将这些信息混入 `summary` 或 `conflict`

当前 required 边界：

- required
- 表达为 string list

### `quality_hints`

字段定义：

- 随 draft 一起携带的结构化 advisory notes

字段目的：

- 以 machine-readable 方式保留 review-oriented notes
- 在不把当前 draft 描述为完成版 screenplay format 的前提下，显式表达质量相关提示

当前字段：

- `coverage_notes`
- `character_consistency_notes`
- `pacing_notes`
- `revision_suggestions`

当前 required 边界：

- `quality_hints` 为 required
- 四个嵌套字段全部为 required

设计取舍：

- 从产品语义看，这些 hints 更接近 advisory 信息；但在当前 schema 中，它们仍然是 required 字段，因为当前 contract 表达的是“完整 Demo draft object”，而不是“最小部分填写的 screenplay”

## 标识符与引用模型

当前 schema 使用显式 identifier string，而不是隐式的 name matching。

### Identifier 形状

当前 `JSON Schema` 对多类 identifier 字段使用了相同 pattern 约束：

- 必须是非空字符串
- 必须匹配 `^[a-z][a-z0-9_-]*$`

该约束适用于如下标识符：

- `chapter_id`
- `characters[].id`
- `locations[].id`
- `scenes[].id`
- `beats[].id`
- 指向这些 ID 的 reference fields

### 需要通过 `Consistency Checks` 保证完整性的引用

当前 `JSON Schema` 可以验证某个字段存在，并且形状上像一个 identifier string，但它无法证明该 target 是否真的存在于同一文档的其他位置。这一职责由 `Consistency Checks` 负责。

当前 `Consistency Checks` 覆盖：

- 角色关系目标必须存在
  - `characters[].relationships[].character_id`
- scene location 目标必须存在
  - `scenes[].location_id`
- scene character 目标必须存在
  - `scenes[].characters[]`
- dialogue speaker 目标必须存在
  - `scenes[].dialogue[].character_id`
- scene chapter 目标必须存在
  - `scenes[].chapter_refs[]`
- beat chapter 目标必须存在
  - `scenes[].beats[].source_chapter_ids[]`
- 以下范围内的重复 ID 会被拒绝：
  - `characters[].id`
  - `locations[].id`
  - `scenes[].id`
  - `metadata.source_chapters[].chapter_id`

## 校验策略

当前 shared validator runtime 采用分层设计。每一层承担不同责任。

### 1. YAML parse

实现位置：

- `packages/shared/src/validation/parseScreenplayYaml.ts`

职责：

- 将原始 YAML text 解析为 unknown candidate object
- 一旦 YAML 语法无效，则立即停止后续流程

当前失败行为：

- 产生 `yaml_parse_error`
- 在路径 `$` 上返回归一化 validation issue
- parse 失败后不再进入 schema 或 consistency validation

### 2. `JSON Schema` validation

实现位置：

- `packages/shared/src/validation/schemaValidator.ts`

职责：

- 对解析结果执行 `screenplayDocumentSchema` 校验
- 约束 required fields、object shape、enum、const、string length、array minimums、identifier pattern，以及 `additionalProperties: false`

`JSON Schema` validation 当前覆盖的典型问题包括：

- 缺失 required 字段，例如 `metadata.title`
- 非法 `adaptation_mode`
- 非法 `schema_version`
- 应满足 `minLength` 却为空的字符串
- `source_chapters` 数量不足
- 严格对象上出现额外未识别字段
- 不符合规则的 identifier string

### 3. `Consistency Checks`

实现位置：

- `packages/shared/src/validation/consistencyChecks.ts`

职责：

- 在 schema validation 成功后，校验跨引用完整性与 duplicate-ID 完整性

`Consistency Checks` 当前覆盖的典型问题包括：

- scene 引用了不存在的 location ID
- dialogue 引用了不存在的 character ID
- beat 引用了不存在的 source chapter ID
- character、location、scene 或 source chapter ID 重复

### 4. 聚合校验入口

实现位置：

- `packages/shared/src/validation/validateScreenplayYaml.ts`

职责：

- 按当前顺序执行完整流程：
  - parse
  - schema validation
  - consistency checks

这一顺序具有实际意义。YAML parse 失败会阻断后续步骤；只有 schema validation 成功后，`Consistency Checks` 才会在一个类型上已满足 `ScreenplayDocument` 的对象上运行。

## Required 与 Optional 边界

当前 contract 比宽松的 screenplay working draft 格式更严格。

当前关键边界如下：

- 大多数顶层字段与嵌套对象字段均为 required
- 许多数组即使允许为空，也仍然是 required
- 若干数组还必须满足 `minItems`，例如 `metadata.source_chapters`、`scenes[].chapter_refs`、`scenes[].characters` 与 `beats[].source_chapter_ids`
- 对象普遍采用 `additionalProperties: false` 封闭

这意味着当前 schema 并非在建模一份“可局部缺失的作者笔记”，而是在建模一份“完整、结构化、可验证、可展示的 Demo screenplay draft object”。

## 前端工作流映射

当前文档形状也直接映射到 `apps/web` 的现有 workbench 行为。

### `Generated YAML`

当前来源：

- 通过 `screenplayToYaml()` 从 `result.screenplay` 序列化得到

当前作用：

- 作为最新 generated draft 的只读基线

### `Edited YAML`

当前来源：

- 由 `Generated YAML` 初始化出的本地可编辑 working copy

当前作用：

- 唯一用于 shared validation 与导出的 YAML 文本来源

关键边界：

- `Edited YAML` 不会实时驱动 Scene Board、Character Bible、Chapter Analyzer、Adaptation Quality Score 或 Rewrite Suggestions 的重算

这些面板当前仍然主要基于 generated draft object 工作，但存在一个例外：

- Adaptation Quality Score 还会额外读取当前 validation result，作为其 deterministic Demo scoring 的输入信号之一

### `Validation Result`

当前来源：

- 在 `ConversionResultWorkbench.tsx` 中对 `validateScreenplayYaml(editedYaml)` 的调用结果

当前作用：

- 展示当前 `Edited YAML` 的 parse、schema 与 consistency 结果
- 作为导出可用性的 gate

### `Export YAML`

当前来源：

- 下载的是当前 `Edited YAML` 文本，而不是原始 `Generated YAML` 文本

当前 gate：

- 只有在 shared validation result 为 `ok` 时才启用

## Preview Checks 边界

当前应用还包含 Preview Checks，但该面板刻意设计得比 shared validator runtime 更轻量。

当前行为：

- 检查顶层 section 是否存在
- 检查 scenes 是否存在
- 检查 generated draft object 中的 scene character 与 location references 是否可解析

关键边界：

- Preview Checks 是轻量的 generated-draft review panel
- 它不是 shared validator runtime 的完整 UI
- 它不能替代 `Validation Result` 所使用的 parse -> schema -> consistency 校验链路

## Mock 与 Demo 边界

理解当前 schema 文档时，还必须同时考虑仓库中已经存在的 mock 与 deterministic Demo 边界。

### mock conversion 边界

当前 mock conversion 流程不是真实 LLM 主链路。

当前真实存在的内容：

- `POST /api/conversions/mock`
- 响应结构中包含 `screenplay: ScreenplayDocument`
- 明确将结果标记为 mock output 的 warning strings
- 一个基于 shared `sampleScreenplay` contract，并结合请求 metadata 局部改写得到的 screenplay 对象

补充说明：

- 当前真实用户主流程已改为 `POST /api/conversions/real`。
- 真实 LLM conversion 的 provider 返回文本也不会被直接信任。
- 后端会先提取 JSON object，再经过 shared schema validation 与 consistency checks。
- 只有校验通过后，结果才会作为 `ScreenplayDocument` 返回给前端。

这对 schema 文档的含义是：

- schema 描述的是当前结构化 draft contract
- 它并不证明该 draft 来自真实 LLM generation pipeline

### Deterministic Demo analysis 边界

当前 Chapter Analyzer、Adaptation Quality Score 与 Rewrite Suggestions 都属于 Deterministic Demo analysis，而不是真实 LLM reasoning。

当前边界：

- Chapter Analyzer 使用 submitted source snapshot 与显式 generated-draft references
- Adaptation Quality Score 使用 generated draft structure、Chapter Analyzer signals 与当前 YAML validation state
- Rewrite Suggestions 使用来自 generated draft、Chapter Analyzer output 与 quality score output 的 deterministic signals

关键约束：

- 这些面板不会将 `Edited YAML` 重新转换为 canonical `ScreenplayDocument`，再去反向驱动所有 generated-draft surfaces
- 它们仍然是建立在 generated draft 之上的 Demo-oriented analysis layers；其中 quality score 额外读取当前 validation result

## 设计取舍

当前设计包含若干明确取舍。

### 严格性优先于灵活性

当前 schema 之所以严格且封闭，是因为仓库现阶段对“可预测校验”和“稳定展示面”的需求，高于对宽松 authoring freedom 的需求。

### 显式引用优先于隐式文本理解

ID 与 reference fields 确实增加了文档冗长度，但它们使 runtime 可以直接发现断裂引用，而不是从 prose 中推断结构。

### Demo 完整性优先于行业剧本兼容性

当前 contract 围绕 Demo product loop 设计，而不是围绕既有 screenplay interchange standards 设计。

### 分离的 validation loop 优先于统一的 live-edit 重算

当前前端将 `Edited YAML` 的 validation / export 与 generated-draft reference panels 分离处理。这简化了当前 UI contract，也避免错误暗示“所有面板都已经支持完整的 edited-YAML round-tripping”。

## 非目标

本文档不声明当前 schema：

- 与 Final Draft 或 Fountain 兼容
- 适合作为通用行业剧本交换格式
- 已经是面向真实生产链路的 LLM 输出契约
- 已经支持基于 `Edited YAML` 对 Scene Board、Character Bible、Chapter Analyzer、Adaptation Quality Score、Rewrite Suggestions 的完整实时重算
- 使 Preview Checks 等同于 shared validator runtime 的完整 UI
