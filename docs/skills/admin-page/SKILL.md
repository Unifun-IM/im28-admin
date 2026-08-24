---
name: admin-page
description: Generate or adjust admin scaffold list/detail pages from PRD and generated Admin OpenAPI, including filters, table columns, detail drawers, tabs, and operation records. Use for Codex, Claude Code, and Cursor when building backend admin pages in this repo.
---

# AI 通用后台页面生成 Skill

适用对象：Codex、Claude Code、Cursor，以及其它会读取仓库 Markdown 约定的 AI 编码助手。

本 skill 用于在本脚手架或派生项目中，根据产品 PRD 与脚本生成的 Admin OpenAPI 接口，生成或调整后台列表页、详情 Drawer、操作记录等通用管理页面。

## 触发场景

当用户要求新增或调整后台管理页面，且页面包含以下任一内容时使用本 skill：

- 列表页
- 搜索 / 筛选条件
- 表格展示列
- 详情 Drawer / Modal
- 操作记录、变更记录、登录记录、审计记录等详情内表格
- 根据 OpenAPI 生成接口接入真实请求

## 信息优先级

按以下顺序确定页面信息，前者优先级高于后者：

1. 产品 PRD：优先查找当前任务范围内的 `prd.md`、`PRD.md`、需求说明、产品文档。PRD 有明确字段、交互、展示顺序、文案时，以 PRD 为准。
2. 接口文件：如果没有 PRD，或 PRD 未覆盖某块信息，从脚本生成的接口文件推导。接口来源包括 `src/shared/api/admin/**` 与全局 `AdminAPI` 类型。
3. 现有页面模式：同类页面仅作为交互和组件模式参考，不自动扩面修改。

如果 PRD 与接口冲突：

- UI 交互、字段展示、筛选入口优先按 PRD 保留。
- 请求体只能传接口支持的字段；接口暂不支持的 PRD 字段先保留在 UI，不强行塞入请求体。
- 在回复里简短说明暂未接线的字段，等待接口补齐。

## 增量生成与接口变更同步

每次生成或调整页面都按增量任务处理，不能假设工作区干净。

开始实现前必须查看当前未提交 git 状态：

- 识别用户已有改动、上次 AI 已生成但未提交的改动、当前任务相关改动。
- 不回滚、不覆盖、不格式化无关未提交文件。
- 如果未提交改动与本次页面相关，先读懂现状，在现有实现上增量修改。
- 如果未提交改动与本次任务无关，保持不动。

接口文件由脚本生成。发现接口有变更时，按以下规则处理：

1. 已有页面对应的接口发生变更：同步更新已有页面、请求体、响应读取、表格列、详情字段、筛选接线、类型引用和 locale 文案。
2. 新增接口对应新业务能力：新增对应路由、页面、feature / widget、locale、菜单配置等必要文件。
3. 接口删除或字段缺失：不要直接删除 PRD 或既有 UI 交互；能不传的先不传，并在代码注释或回复中说明接口未支持。
4. 只处理本次任务点名范围内的页面或接口；发现其它接口变更只在回复中提示，等待下一条指令。

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

接口字段已经是英文时，优先沿用 `AdminAPI` 字段名，不额外做字段映射。PRD 是中文时，把页面概念翻译为清晰英文，例如：

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

列表页优先复用 `@widgets/biz-list`：

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

搜索条件优先来自 PRD；没有 PRD 时，从列表接口请求类型推导。

字段到组件的默认映射：

| 字段类型 / 语义 | 推荐组件 | 说明 |
| --- | --- | --- |
| `keyword` / `q` / `search` | `FilterInput` 或 `FilterKeywordInput` | PRD 有多字段搜索时用 `FilterKeywordInput` |
| `id` / `*_id` | `FilterInput` | ID 通常保持文本输入，避免超长数字精度问题 |
| `name` / `title` / `username` / `account` | `FilterInput` | 普通文本搜索 |
| 字符串枚举 union | `FilterSelect` | 选项文案走 locale |
| boolean | `FilterSelect` | 列表筛选用「全部 / 是 / 否」或业务文案，不用 Switch |
| enum array / `*_list` / `*_ids` | `FilterMultiSelect` | 多选筛选 |
| `start_at` + `end_at` / `*_start_at` + `*_end_at` | `FilterDateRange showTime` | 提交时转接口需要的时间格式 |
| `date` / `*_date` | `FilterDateRange` | 不带时间 |
| number min/max | Arco `InputNumber` | 放在 `FilterField` 内，保留 Arco Form/Grid |
| status/state/type/category | `FilterSelect` | 优先使用接口枚举 |
| ip / phone / email | `FilterInput` | 不自行格式化，除非 PRD 要求校验 |

筛选区布局：

- 默认一行四个筛选项。
- 不因为后端暂不支持某筛选字段就删除 UI。
- 暂不进请求体的字段在代码中保留清晰注释，说明接口未支持。
- 不使用 Tailwind 重做 Form/Grid。

### 表格列推导

表格列优先来自 PRD；没有 PRD 时，从列表响应类型推导。

默认规则：

- ID 与名称/标题/账号优先合并为一列展示，例如主行展示名称，副行展示 ID，可复用 `AvatarNameCell` / `DoubleLineCell`。
- 如 PRD 无特殊说明，除 ID/名称合并外，一个响应字段一列展示。
- 状态字段使用 `StatusBadge` 或业务已有状态组件。
- 时间字段使用 `formatDateTime`。
- 图片 / 头像字段使用 `UserAvatar` 或 Arco Image/Avatar，不直接裸露 URL。
- 长文本默认单行省略；需要全文时用 Tooltip 或详情 Drawer。
- 操作列使用 `ActionLinks`，并交给 `BizListPage` 自动 fixed right。
- 分页默认 15 条，选项 15 / 30 / 50，沿用 `BizListPage` 默认约定。

不要为了“列很多”自行删字段。确实过宽时使用横向滚动、合理宽度和省略。

## 详情 Drawer 生成规则

详情优先使用 `@widgets/biz-detail-drawer` 的 `BizDetailDrawer`。

### 纯详情

如果详情只有一类基本信息：

- 使用 `fields` 或单个 `sections`。
- 默认 tab 不显示，只展示详情内容。
- 字段为空展示 `--`。
- ID 与名称可以在详情中分开展示，除非 PRD 要求合并。

### 多分组详情

如果详情存在多个信息分组，但仍属于同一类详情：

- 使用多个 `sections`。
- section title 使用语义化 locale 文案。
- 不为了分组创建多 Tab，除非 PRD 或信息密度需要。

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
- PRD 明确要求 Tab

### 详情内记录表格

详情内操作记录、变更记录等表格必须按现有详情表格样式：

- 使用 `BizDetailDrawer` 的 `operationRecords`。
- 或手写 Arco `Table` 时统一加 `className="use-biz-detail-table"`。
- 表格列仍按 PRD > 接口响应推导。
- 时间字段使用 `formatDateTime`。
- 操作内容、备注、原因等长文本使用省略 + Tooltip。
- 详情内记录默认不展示外层 `BizListPage`，避免 Drawer 内再套列表页卡片。

## 请求接线规则

- 直接使用 `@shared/api/admin/*` 生成函数。
- Form 字段、Table `dataIndex`、state 尽量直接使用 `AdminAPI` 字段名。
- 不新增业务字段映射层。
- 列表请求保留 `page` / `page_size`。
- 搜索时重置到第 1 页。
- 重置时清空 Form 并拉第 1 页。
- Drawer 打开时按需拉详情；关闭时清理当前 target。
- 多 Tab 中记录类接口可在 Drawer 打开后并行拉取，或按 tab 激活懒加载；按接口成本和页面体验决定。

## locale 规则

- 所有 UI 文案写入 `src/shared/locale/*.ts` 或派生项目对应业务 locale。
- 英文与中文都要补齐。
- 枚举值展示必须走 locale，不直接展示接口原始枚举，除非 PRD 明确要求。
- 代码标识用语义化英文；展示文案按 locale。

## 不做的事

- 不手改 OpenAPI 生成物。
- 不用 mock 替代缺失接口。
- 不因为接口暂不支持就删 PRD 中的筛选、按钮、Tab、Drawer 步骤。
- 不把 Tailwind 当成 Form/Grid/Table 的替代品。
- 不跨出用户本次点名页面或组件范围批量修同类页面。
