---
name: admin-page
description: Generate or adjust standard admin framework list/detail pages from a complete Figma URL, PRD, and generated Admin OpenAPI in that priority order, including filters, table columns, detail drawers, tabs, and operation records.
---

# AI 通用后台页面生成 Skill

适用对象：Codex、Claude Code、Cursor，以及其它会读取仓库 Markdown 约定的 AI 编码助手。

本 skill 用于在本后台框架或派生项目中，根据完整 Figma 页面地址、产品 PRD 与脚本生成的 Admin OpenAPI 接口，生成或调整标准后台列表页、详情 Drawer、操作记录等通用管理页面。

生成页面前先读取 `docs/skills/api-generation/SKILL.md`、`docs/skills/component-usage/SKILL.md` 与 `docs/skills/css-usage/SKILL.md`；任务提供完整 Figma 地址时同时读取 `docs/skills/figma-rules/SKILL.md`。本 skill 只补充 Figma / PRD / OpenAPI 的信息优先级、字段推导、接口接线和页面生成规则。

## 触发场景

当用户要求新增或调整后台管理页面，且页面包含以下任一内容时使用本 skill：

- 列表页
- 搜索 / 筛选条件
- 表格展示列
- 详情 Drawer / Modal
- 操作记录、变更记录、登录记录、审计记录等详情内表格
- 根据完整 Figma 地址还原页面字段、结构和交互
- 根据 OpenAPI 生成接口接入真实请求

## 信息优先级

按以下顺序确定页面信息，前者优先级高于后者：

1. 完整 Figma 地址：用户贴出能够定位目标文件和页面 / Frame / 节点的完整 `figma.com` 地址，并且该地址可通过只读工具读取时，以 Figma 为最高优先级。
   - Figma 决定搜索字段、字段控件类型、标签与占位文案、排列顺序、表格列、详情字段与分组、Drawer / Modal、Tab、记录表格、操作入口、状态和页面布局。
   - PRD 与接口只补充 Figma 没有提供的整个视图 / 区域，或设计稿明确标注待补的信息，不得覆盖 Figma 已明确的字段、顺序或展示结构。
   - 完整地址无法读取时必须明确说明，禁止假装读取或静默把 PRD 当作同等设计稿；后续只能基于实际可读取的信息继续。
2. 产品 PRD：没有完整可读的 Figma 地址，或 Figma 未覆盖某块信息时，查找当前任务范围内的 `prd.md`、`PRD.md`、需求说明和产品文档。PRD 有明确字段、交互、展示顺序、文案时，以 PRD 为准。
3. 接口文件：Figma 与 PRD 都未覆盖某块信息时，从脚本生成的接口文件推导。接口来源包括 `src/shared/api/admin/**` 与全局 `AdminAPI` 类型。
4. 现有页面模式：同类页面仅作为组件和交互模式参考，不自动扩面修改，也不覆盖前三类来源。

### 显式集合与补充边界

- 完整目标 Frame 中已经出现筛选区、表头、详情字段列表、Tab 或操作入口时，该区域的可见项视为闭合集合；未出现的字段、列、Tab 或操作默认是明确不展示，PRD、接口和现有页面不得自行补入。
- PRD 明确列出完整字段、列、Tab 或操作集合时，同样按闭合集合处理；接口只负责绑定和数据契约，不追加可见项。
- 低优先级来源可以补充闭合集合中已有项的实现信息，例如 `AdminAPI` 字段绑定、枚举来源、校验规则、请求格式、时间格式、权限和空值处理。
- 只有高优先级来源完全没有提供某个视图 / 区域，例如只提供列表 Frame 而没有详情设计，或明确标注该区域待补时，才由下一优先级来源定义该区域的可见项。
- 不得把“设计稿 / PRD 没有出现某项”解释成“尚未覆盖”，进而从接口自动增加筛选、列、详情字段、Tab 或操作。

### UI 定义与数据契约

- Figma / PRD 决定页面展示什么以及如何组织；生成接口决定真实可请求、可提交和可读取的数据契约。
- Figma 明确的 UI 字段能够对应接口字段时，代码直接使用 `AdminAPI` 字段名，不增加映射层。
- 只有完整可读 Figma 地址中明确展示、但生成接口未提供的字段，允许作为 Figma 专项例外继续实现 UI 壳；不得手改生成 API、虚构请求参数或伪造响应数据。该字段使用局部 UI 状态或空值展示，并在完成说明中列出接口缺口。
- Figma 专项例外不适用于普通 PRD / API 页面，也不是“接口不支持仍保留 UI”的全局规则。只有 PRD 而接口缺少对应契约时，报告契约缺口，不创建未接线字段或控件。
- 不根据模糊截图、文件首页或无法定位目标节点的链接启用该例外或臆造字段。

## 增量生成与接口变更同步

每次生成或调整页面都按增量任务处理，不能假设工作区干净。

开始实现前必须查看当前未提交 git 状态：

- 识别用户已有改动、上次 AI 已生成但未提交的改动、当前任务相关改动。
- 不回滚、不覆盖、不格式化无关未提交文件。
- 如果未提交改动与本次页面相关，先读懂现状，在现有实现上增量修改。
- 如果未提交改动与本次任务无关，保持不动。

接口文件由脚本生成。发现接口有变更时，按以下规则处理：

1. 已有页面对应的接口发生变更：同步更新已有页面、请求体、响应读取、表格列、详情字段、筛选接线、类型引用和 locale 文案。
2. 新增接口能够明确组成可独立落页的新业务能力：新增对应路由、页面、feature / widget、locale、菜单配置等必要文件。单个辅助、动作、上传、详情或记录接口不单独生成页面。
3. 任务提供具体 PRD、完整可读 Figma 地址，或明确点名页面、路由、接口、代码文件时，只处理该目标及必要直接依赖。
4. 没有这些明确目标时，遵循现有路由、页面、生成函数 import 和类型引用，同步接口变化直接影响的现有代码；新增接口只有满足第 2 条时才按现有页面模式落页。
5. 无调用关系的页面、相似问题和无关工程债只在回复中提示，不自行扩面。

判断“已有页面”时优先搜索：

- `src/shared/config/routes.ts`
- `src/pages/**/index.tsx`
- 页面内已引用的 `@shared/api/admin/*` 生成函数
- 相关 feature / widget 名称
- locale key 与菜单 key

## 语义化英文

代码标识必须使用语义化英文，不使用中文拼音、机器翻译式缩写或接口路径碎片堆砌。

适用范围：

- 路由 key
- 文件夹名
- 组件名
- 变量名
- 表单类型名
- Drawer / Modal 状态名
- tab key
- 内部 helper 名

接口字段已经是英文时，优先沿用 `AdminAPI` 字段名，不额外做字段映射。Figma / PRD 展示概念是中文时，把代码标识翻译为清晰英文，例如：

| 中文概念 | 推荐英文 |
| --- | --- |
| 操作记录 | `operationRecords` |
| 变更记录 | `changeRecords` |
| 登录记录 | `loginRecords` |
| 基本信息 | `basicInfo` |
| 风控状态 | `riskStatus` |
| 用户分组 | `userGroup` |

## 接口读取规则

生成页面前先定位相关接口：

- list / page / query / search：列表接口
- detail / get：详情接口
- create / add：新增接口
- update / edit：编辑接口
- delete / remove：删除接口
- enable / disable / status：状态切换接口
- logs / records / history / audit / operation：记录类接口

读取时重点看：

- 请求类型：决定搜索条件、分页参数、可传字段。
- 响应类型：决定表格列和详情字段。
- 枚举联合类型：决定 `Select` 选项。
- 字段注释：决定文案、含义、是否敏感。
- list envelope：默认从 `res.data?.list` / `res.data?.total` 取数据。

禁止手改 `src/shared/api/admin/**`。接口缺失时不要补 mock，不要绕过生成物自写同名 API。

## 列表页生成规则

列表页优先复用 `@widgets/biz-list`，具体组件选择遵守 `docs/skills/component-usage/SKILL.md`：

- 页面壳：`BizListPage`
- 筛选区：`SearchFilterBar` + `FilterField`
- 输入：`FilterInput`
- 关键词组合：`FilterKeywordInput`
- 单选：`FilterSelect`
- 多选：`FilterMultiSelect`
- 时间范围：`FilterDateRange`
- 操作列：`ActionLinks`
- 状态：`StatusBadge`

### 搜索条件推导

搜索条件按完整可读 Figma > PRD > 列表接口请求类型推导。Figma / PRD 已明确筛选集合时，不从接口追加条件；低优先级来源只补已有条件的字段绑定、枚举、校验和请求格式。只有整个筛选区域未提供时，才从下一优先级来源推导。

Figma / PRD 没有明确控件类型时，才使用以下默认映射：

| 字段类型 / 语义 | 推荐组件 | 说明 |
| --- | --- | --- |
| `keyword` / `q` / `search` | `FilterInput` 或 `FilterKeywordInput` | Figma / PRD 有多字段搜索时用 `FilterKeywordInput` |
| `id` / `*_id` | `FilterInput` | ID 通常保持文本输入，避免超长数字精度问题 |
| `name` / `title` / `username` / `account` | `FilterInput` | 普通文本搜索 |
| 字符串枚举 union | `FilterSelect` | 选项文案走 locale |
| boolean | `FilterSelect` | 列表筛选用「全部 / 是 / 否」或业务文案，不用 Switch |
| enum array / `*_list` / `*_ids` | `FilterMultiSelect` | 多选筛选 |
| `start_at` + `end_at` / `*_start_at` + `*_end_at` | `FilterDateRange showTime` | 提交时转接口需要的时间格式 |
| `date` / `*_date` | `FilterDateRange` | 不带时间 |
| number min/max | Arco `InputNumber` | 放在 `FilterField` 内，保留 Arco Form/Grid |
| status/state/type/category | `FilterSelect` | 优先使用接口枚举 |
| ip / phone / email | `FilterInput` | 不自行格式化，除非 Figma / PRD 要求校验 |

筛选区布局 fallback：

- 只有 Figma / PRD 未明确筛选布局时，默认一行四个筛选项。
- 不使用 Tailwind 重做 Form/Grid。

### 表格列推导

表格列按完整可读 Figma > PRD > 列表响应类型推导。Figma / PRD 已明确列集合时，不从响应类型追加列；低优先级来源只补已有列的数据绑定、枚举和格式。只有整个列集合未提供时，才从下一优先级来源推导。

以下规则仅在 Figma / PRD 未明确对应字段展示、单元格样式、操作列或分页时作为 fallback：

- ID 与名称/标题/账号优先合并为一列展示，例如主行展示名称，副行展示 ID，可复用 `AvatarNameCell` / `DoubleLineCell`。
- 当 Figma / PRD 完全没有提供列集合、需要从接口推导时，除 ID/名称合并外，一个响应字段一列展示。
- 状态字段使用 `StatusBadge` 或业务已有状态组件。
- 时间字段使用 `formatDateTime`。
- 图片 / 头像字段使用 `UserAvatar` 或 Arco Image/Avatar，不直接裸露 URL。
- 长文本默认单行省略；需要全文时用 Tooltip 或详情 Drawer。
- 操作列使用 `ActionLinks`，并交给 `BizListPage` 自动 fixed right。
- 分页默认 15 条，选项 15 / 30 / 50，沿用 `BizListPage` 默认约定。

生成 `columns` 前必须先做列宽分析，具体计算口径以 `docs/skills/component-usage/SKILL.md` 的“列宽分析”章节为准：

- Figma / PRD 明确列宽时优先采用；未明确时，根据中英文最长表头、实际单元格形态、字段典型值、排序图标和单元格 padding 推导最小宽度。
- 先列出每列的内容类型、最小宽度和固定 / 弹性选择，再写 `columns`；禁止按接口字段类型机械套同一个宽度，也禁止所有列都使用偏大的固定宽度。
- 存在长文本或主要内容列时，优先至少保留一列不设 `width`，让它吸收剩余空间；ID、状态、时间、IP、数量和操作列等稳定格式列再设置合理固定宽度。
- 操作列只计算 `ActionLinks` 实际外露的文字 / 图标、更多按钮、间距与操作列 padding；进入下拉菜单的操作不占列宽。动态操作文案按所有状态及 zh-CN / en-US 中最长者计算。
- 列宽完成后检查整表宽度；真实最小宽度超过内容区时才接受横向滚动，不得用扩大 `scroll.x` 掩盖明显过宽的列。

只有在 Figma / PRD 完全没有提供列集合、页面按接口 fallback 推导全部列时，才适用“不要因为列很多自行删字段”；确实过宽时使用横向滚动、合理宽度和省略。Figma / PRD 已提供闭合列集合时，不添加其中未出现的响应字段。

## 详情 Drawer 生成规则

详情优先使用 `@widgets/biz-detail-drawer` 的 `BizDetailDrawer`，具体纯详情 / 多分组 / 多 Tab / 操作记录表格用法遵守 `docs/skills/component-usage/SKILL.md`。

以下纯详情、分组和 Tab 规则仅在 Figma / PRD 未明确对应详情结构时作为 fallback；完整详情 Frame 已给出的字段、分组和 Tab 是闭合集合，不从接口追加未展示项。

### 纯详情

如果详情只有一类基本信息：

- 使用 `fields` 或单个 `sections`。
- 默认 tab 不显示，只展示详情内容。
- 字段为空展示 `--`。
- ID 与名称可以在详情中分开展示，除非 Figma 或 PRD 要求合并。

### 多分组详情

如果详情存在多个信息分组，但仍属于同一类详情：

- 使用多个 `sections`。
- section title 使用语义化 locale 文案。
- 不为了分组创建多 Tab，除非 Figma、PRD 或信息密度需要。

### 多 Tab 详情

如果详情需要展示多接口、多种类信息，使用 Tab：

- 基本信息：`detail` / `basicInfo`
- 操作记录：`operationRecords`
- 变更记录：`changeRecords`
- 登录记录：`loginRecords`
- 关联数据：按业务语义命名，如 `relatedUsers`、`boundDevices`

多 Tab 常见触发条件：

- 基本详情接口 + 操作记录接口
- 基本详情接口 + 多个记录类接口
- 同一对象下存在明显不同类型的信息，例如资料、权限、登录记录、审计记录
- Figma 或 PRD 明确要求 Tab

其中接口数量触发 Tab 的规则只适用于 Figma / PRD 没有提供完整详情结构时；设计稿或 PRD 已明确 Tab 集合时，不因存在额外接口自动增加 Tab。

### 详情内记录表格

详情内操作记录、变更记录等表格必须按现有详情表格样式：

- 使用 `BizDetailDrawer` 的 `operationRecords`。
- 或手写 Arco `Table` 时统一加 `className="use-biz-detail-table"`。
- 表格列仍按完整可读 Figma > PRD > 接口响应推导。
- 时间字段使用 `formatDateTime`。
- 操作内容、备注、原因等长文本使用省略 + Tooltip。
- 详情内记录默认不展示外层 `BizListPage`，避免 Drawer 内再套列表页卡片。

## 请求接线规则

- 直接使用 `@shared/api/admin/*` 生成函数。
- Form 字段、Table `dataIndex`、state 尽量直接使用 `AdminAPI` 字段名。
- 不新增业务字段映射层。
- 完整可读 Figma 明确展示且接口未提供的字段，按上述 Figma 专项例外使用局部 UI 状态或空值展示，不写入 `AdminAPI` 类型，不加入真实请求参数；PRD / API-only 页面不得创建此类未接线字段。
- 列表请求保留 `page` / `page_size`。
- 搜索时重置到第 1 页。
- 重置时清空 Form 并拉第 1 页。
- Drawer 打开时按需拉详情；关闭时清理当前 target。
- 多 Tab 中记录类接口可在 Drawer 打开后并行拉取，或按 tab 激活懒加载；按接口成本和页面体验决定。

## locale 规则

- 所有 UI 文案写入 `src/shared/locale/*.ts` 或派生项目对应业务 locale。
- 英文与中文都要补齐。
- 枚举值展示必须走 locale，不直接展示接口原始枚举，除非 Figma / PRD 明确要求。
- 代码标识用语义化英文；展示文案按 locale。

## 不做的事

- 不手改 OpenAPI 生成物。
- 不用 mock 替代缺失接口。
- 不把 Tailwind 当成 Form/Grid/Table 的替代品。
- 不跨出用户本次点名页面或组件范围批量修同类页面。

## 完成检查

- 提供完整可读 Figma 地址时，搜索字段、控件、表格列、详情、Tab、操作入口和顺序是否均以 Figma 为准。
- 没有完整可读 Figma 地址时，是否按 PRD > 生成接口补充页面信息。
- Figma / PRD 已明确的字段、列、Tab 和操作是否作为闭合集合处理，且低优先级来源没有追加未展示项。
- 一行四筛选、ID/名称合并、全字段列、操作列和分页等默认值是否只在高优先级来源未明确时作为 fallback。
- 是否逐列分析了中英文表头和实际内容宽度，保留了合适的弹性列，且操作列没有截断或显著空白。
- Figma 无接口字段的 UI 是否严格限定为完整可读设计稿明确展示的专项例外，且没有扩展到 PRD / API-only 页面。
- 低优先级来源是否只补缺失信息，且没有手改生成 API、虚构请求参数或伪造响应数据。
