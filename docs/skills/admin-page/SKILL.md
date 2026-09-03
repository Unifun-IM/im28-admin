---
name: admin-page
description: Generate or update admin navigation, routes, lists, filters, detail drawers, relation drawers, and records from explicit navigation, readable Figma, PRD, PROJECT.md, and generated Admin OpenAPI.
---

# Admin Page Generation

本 skill 属于技术负责人组织的工程执行阶段，负责页面信息架构、字段推导、路由和落页流程，不反向改写产品或设计决策。开始前沿用 `ai-code` 已加载的 `PROJECT.md`；可见 UI 读取 `DESIGN.md` 和 `design-system`，写 JSX 前读取 `component-usage`，新增或修改样式时读取 `css-usage`。新增自定义状态反馈、视图切换或空间变化时读取 `animation-usage`；普通路由与 Arco 弹层沿用公共动效。接口生成和 Figma 读取分别交给对应专项 skill。

## 信息来源

页面可见信息按以下优先级确定：

1. 完整且可只读访问、明确对应目标页面的 Figma
2. 当前用户文字要求和当前任务 PRD / 产品说明
3. `PROJECT.md` 中已确认的项目级信息架构、术语与跨页面约束
4. 脚本生成的 Admin OpenAPI 与 `AdminAPI` 类型
5. 现有同类页面模式

规则：

- 高优先级来源明确列出的筛选项、列、详情字段、分组、Tab 和操作是闭合集合；低优先级来源只补字段绑定、枚举、格式、校验、权限和请求契约，不追加可见项。
- 只有整个区域未提供或明确标注待补时，才由下一优先级来源定义该区域。
- Figma / 当前需求决定展示内容；生成接口决定真实可请求和可提交的数据。
- `PROJECT.md` 补充跨任务稳定的项目默认值，不能覆盖当前任务中更具体的 Figma / PRD，也不能定义接口中不存在的请求契约。
- 完整 Figma 明确展示但接口缺失的字段，可以保留空值或局部 UI 壳，并在交付中列出契约缺口；不得虚构请求参数、响应或修改生成类型。该例外不适用于只有 PRD / API 的页面。
- Figma 地址不可读时必须说明，不能假装已读取。

## 增量生成

1. 检查现有路由、页面、公开组件和 API 调用方。
2. 接口变化先完整执行 `api-generation`，生成 diff 和调用方同步范围不在本 skill 重复定义。
3. 只有独立管理对象、列表能力或明确菜单目标生成路由和页面；详情、动作、上传、鉴权和记录能力进入所属页面。
4. 接口契约不足时报告缺口，不创建 `ApiNotReady`、mock 页面或“接口未就绪”占位组件。
5. 现有页面组织不能承载已确认需求时，先按 `design-system` 形成交互契约，再按 `component-usage` 处理能力缺口；不复制不合适的旧页面，也不为迁就组件删减需求。
6. 不覆盖用户已有改动，不格式化或重构无关文件。

## 导航与路由

导航结构优先级：

1. 用户显式提供的导航树
2. 完整可读 Figma 侧栏
3. PRD 导航说明
4. `PROJECT.md` 中已确认的项目导航与模块顺序
5. 现有 `src/shared/config/routes.ts`
6. 接口语义推导

没有顺序说明时保持现有业务菜单顺序，新增业务一级菜单放在 `system` 前，使“系统”保持最后一组。

- 路由 key、path、组件名和代码标识使用语义化英文。
- 菜单展示名走 locale。
- 叶子路由 key 对应 `src/pages/<route.key>/index.tsx`。
- 只有可独立访问的业务能力创建菜单；详情、动作和记录接口不创建独立菜单。
- 一级菜单图标按 `svg-icon-usage` 放入 `src/assets/icon` 并注册。

## 语义化命名

- 沿用生成的 `AdminAPI` 英文字段名，不新增业务字段映射层。
- 中文概念翻译为清晰英文，例如 `groupSettings`、`riskControl`、`operationRecords`。
- 禁止拼音、无意义缩写、接口路径碎片和 `data1` / `list2`。
- 展示文案进入 zh-CN / en-US locale；代码标识不使用中文。

## 生成流程

开始落页时先建立两份同源清单：PC 能力清单记录页面结构、必要字段、权限和全部操作；移动任务流清单按用户完成任务的顺序记录入口、单面板层级、返回路径和主要操作位置。移动端只能转换承载方式，不能从 PC 清单删减业务能力。具体场景转换和断点只引用 `design-system`，不在页面内另写一套规则。

### 1. 建立组件清单

按 `component-usage` 搜索公开组件和现有调用方，列出本页需要的列表、筛选、详情、关系和记录组件。最终 import 与 JSX 必须真实使用选定组件；只在分析中提到不算完成。

### 2. 读取接口

- 使用 `api-generation` 产出的请求函数与 `AdminAPI` 类型。
- 先区分列表、详情、创建、更新、动作和记录接口，再按页面职责接线。
- 列表保留 `page` / `page_size`；搜索和重置回到第 1 页。
- 详情在 Drawer 打开后按目标 ID 拉取；关闭时清理临时 target。

### 3. 生成筛选

Figma / PRD 未定义整个筛选区域时，按请求字段语义选择：

| 字段 | 默认组件 |
| --- | --- |
| keyword / ID / account / phone / email / IP | `FilterInput`；多搜索类型用 `FilterKeywordInput` |
| status / type / enum / boolean | `FilterSelect` |
| 多值 ID / tag / group | `FilterMultiSelect` |
| 日期时间范围 | `FilterDateRange` |
| 数字范围 | Arco `InputNumber` |

筛选布局与响应式列数遵循 `design-system`，筛选组件和 Arco Form 契约遵循 `component-usage`。

### 4. 生成表格

Figma / PRD 未定义列集合时：

- 先识别同一实体的“可读主值 + 稳定 ID”字段对，例如名称 + 用户 ID、标题 + 记录 ID、地址 + 地址 ID；合并为一列双行展示，主值在上、ID 在下，表头使用主值的业务名称。副行必须保留字段标签，例如“用户 ID：xxx”或“地址 ID：xxx”，不能只展示无法辨认语义的裸值。
- 有头像的实体字段对使用 `AvatarNameCell`，无头像使用 `DoubleLineCell`；通过 `secondaryLabel` 保留副行语义，两行机器值都需复制时使用 `copyPrimary` 和 `copySecondary`。具体截断与复制契约见 `component-usage`。
- 用户 ID 与钱包 ID 等语义不同的标识不合并；Figma / PRD 明确分列，或字段需要独立比较、排序时也保持分列。
- 完成同实体字段配对后，其余响应字段默认一个字段一列。
- 状态用 `StatusBadge`，时间用 `formatDateTime`，图片用 `UserAvatar` / Arco Avatar / Image。
- 长文本单行省略，需要全文时用 Tooltip 或详情 Drawer。
- 操作列使用 `ActionLinks`；危险操作必须确认。

操作文案先精简再计算列宽：列表上下文已经明确对象时，使用最短无歧义动作，例如“封禁群聊”改为“封禁”、“开启全员禁言”改为“全员禁言”、“查看消息”改为“消息”。确认文案仍需说明完整后果。

每个可见数据列都必须有非零基础宽度；具体算法与浏览器验证见 `component-usage` 的“列宽”章节。

### 5. 生成详情

先按稳定实体 ID 搜索已有详情组件。同一实体从查询、日志、黑名单、白名单等入口进入时共用一个 `<Entity>DetailDrawer`；调用页只维护目标 ID、visible 和可选默认 Tab。

没有实体组件时使用 `BizDetailDrawer`：

- 单一详情：`fields` 或单个 `sections`，不显示 Tab。
- 同类信息分组：多个 `sections`，不为普通分组创建 Tab。
- 多接口或明显不同类型的信息：`tabs`；操作记录可用 `operationRecords`。
- 摘要信息放 `summary`，不重复塞入 Descriptions。
- Figma / 当前需求未明确宽度时沿用公共组件默认值；调用页不重复传 `width`。

关系数量、右箭头和“查看列表”打开新的 `BizRelationListDrawer`，保留父详情的 Tab、滚动位置和数据。关系列表不是默认常驻 Tab；“基本信息 / 通讯录 / 群组 / 操作记录”中，通讯录和群组由数量钻取时，父详情只保留“基本信息 / 操作记录”。

打开后承载独立、较长或可继续操作内容的列表 / 详情操作，使用新的 Drawer，不把临时内容插入当前详情或临时增加 Tab。

关系 Drawer 的宽度、表格滚动和自建边界遵循 `component-usage`。

### 6. 记录与 locale

- 表格记录优先 `operationRecords` 或 `BizRelationListDrawer`；Timeline 稿面使用 `BizOperationTimeline`。
- 特殊记录表格确需手写时使用 `use-biz-detail-table`，禁止裸 Arco Table。
- 所有可见文案、枚举和操作补齐 zh-CN / en-US。
- 空值使用项目默认 `--`，不要在每个字段重复实现。

## 完成验收

- 信息来源和闭合集合是否正确，接口缺口是否显式说明。
- 路由、页面、locale、API 调用和权限是否完整接线。
- 预期组件是否真实出现在 import / JSX；没有裸组件残留。
- 实体详情是否唯一复用；关系入口是否使用子 Drawer 而非临时 Tab。
- Drawer 是否沿用 `component-usage` 的公共契约，没有无依据固定像素宽度。
- 列宽是否基于最终中英文文案和真实内容验证，操作列没有截断或显著空白。
- 页面是否按 `design-system` 验证窄屏、桌面、浅色、暗色与最长文案，且响应式修复位于公共层级。
- 自定义交互动效是否有明确反馈目的并遵循 `animation-usage`，没有覆盖公共页面切换或叠加 Arco 弹层动效。
- PC 能力清单与移动任务流是否一一对应，移动端是否没有桌面侧栏、多页签或并排面板的压缩残留，并具备连续的进入与返回路径。
- 页面是否符合 `PROJECT.md` 的产品边界、术语、导航和跨页面产品约束，且没有把单页推断反写成项目事实。
- 页面是否符合 `DESIGN.md` 的项目设计方向与适用范围，且没有跳过设计归一直接从 PRD 推断全局风格。
- 涉及接口时是否完成 `api-generation` 的验收。
- 浏览器是否验证目标流程、空态、最长内容、滚动、主题和关键视口。
