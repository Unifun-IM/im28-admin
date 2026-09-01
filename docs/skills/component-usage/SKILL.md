---
name: component-usage
description: Discover, reuse, compose, and extract project components for admin UI; apply Arco correctly and size table columns from rendered content.
---

# Component Usage

本文件只定义“使用什么组件以及如何使用”。页面可见字段、来源优先级和路由由 `admin-page` 决定；视觉与响应式结果由 `design-system` 决定，颜色和样式实现由 `css-usage` 决定。

组件决策以 `design-system` 已形成的交互契约为验收条件。现有组件只有在完整覆盖必要任务流、状态反馈、权限内操作和响应式行为时才算“能表达”；不得为了复用组件而改变已确认交互。

## 决策顺序

1. 搜索公开组件、现有调用方和业务中散落的相似 UI。
2. 已有组件能表达时直接复用。
3. 没有组件但已有多个稳定相似实现时，按 FSD 抽取。
4. 再使用 Arco Design / Arco Design Pro。
5. 项目组件和 Arco 都无法表达时才自建。

不能因为直接写 JSX 更快，就绕过项目组件已有的样式、空态、分页、主题和交互。

现有组件不能满足交互契约时，先判断缺口是否属于该公共组件的稳定职责：属于则扩展组件并验证现有调用方；多个页面出现同一稳定模式时按 FSD 抽取；仅当前业务需要时使用 Arco 组合；项目组件和 Arco 都无法表达时再自建。

公共组件已经提供响应式契约时，调用页只传业务数据和状态，不根据 `window.innerWidth` 分叉两套 JSX。确需把并排桌面流程转换为移动单面板时，在对应公共 widget 内集中维护活动面板与返回契约，视觉行为仍以 `design-system` 为准。

## 组件发现与抽取

- 检查 `src/shared/ui/index.ts`、相关 `widgets/*/index.ts`、`features/*/index.ts`。
- 用 `rg` 搜索组件名、文案、className、Arco 组合和接口调用方。
- 阅读候选组件 props 与真实调用，确认 loading、empty、locale、主题和响应式行为。
- 同一实体按稳定 ID 搜索唯一详情组件；不要把“用户查询详情”和“用户日志详情”当成不同实体。
- 复合跨页面 UI 放 `widgets`，用户动作放 `features`，业务无关基础 UI 放 `shared/ui`。
- 公共切片必须从 `index.ts` 导出；迁移本次范围内等价调用方，范围外只报告。

## 常用组件

| 场景 | 使用 |
| --- | --- |
| 标准列表 | `@widgets/biz-list` 的 `BizListPage` |
| 筛选 | `SearchFilterBar`、`FilterField`、`Filter*` |
| 汇总 / 批量 | `DataSummary`、`TableBatchBar` |
| 主次信息 | `AvatarNameCell`、`DoubleLineCell` |
| 状态 / 操作 | `StatusBadge`、`ActionLinks` |
| 详情 | `@widgets/biz-detail-drawer` 的 `BizDetailDrawer` |
| 关系子 Drawer | `@widgets/biz-relation-list-drawer` 的 `BizRelationListDrawer` |
| Timeline 日志 | `@widgets/biz-operation-timeline` 的 `BizOperationTimeline` |
| 设置页 | `@widgets/session-settings` 的 `SettingsPageShell` / `SettingsSectionCard` |
| 表单 Modal | `use-biz-form-modal` |
| 详情表格 | `use-biz-detail-table` |
| 基础展示 | `EmptyState`、`UserAvatar`、`CopyValue`、`DetailLinkRow`、`IconButton` |

找到组件后必须核对最终 import 和 JSX；分析中提到但代码未接入，视为未完成。

## Arco 使用

- 表单使用 `Form.useForm`、`Form.Item`、rules、validate 和 resetFields，不用多份 state 镜像同一值。
- 表单结构使用 Arco Grid，横向动作使用 Space；Tailwind 只补普通布局。
- 文本 / 数字 / 枚举 / boolean / 日期 / 上传分别使用 Input、InputNumber、Select、Switch / Checkbox、DatePicker、Upload。
- Table 提供稳定唯一 `rowKey`；loading、pagination、selection 和 scroll 使用组件 props。
- Modal 用于确认和短表单；Drawer 用于保持上下文的详情和较长流程。
- 危险操作使用 Popconfirm / Modal.confirm；多字段流程使用 feature Modal。
- 反馈使用 Message；持续系统信息再用 Notification / Alert。
- 优先通过 Arco props 和语义化 `use-*` class 补视觉，不依赖未公开 DOM 实现业务逻辑。

## 列表契约

`BizListPage` 已负责筛选区、表格卡片、空态、分页、刷新、全屏、批量模式和操作列固定。页面通过 `filter`、`toolbar`、`batchActions` 和 `tableProps` 配置，不再手写外层 Card + Table。

- 筛选控件放在 `FilterField + Form.Item` 内。
- `toolbar` 随批量模式隐藏；`toolbarAlways` 始终展示。
- 时间使用 `formatDateTime`，图片使用 Avatar / Image，长文本使用省略 + Tooltip。
- 操作列使用 `ActionLinks`，不要手写一排 Button。
- 页面壳层不承载横向滚动；字段确实超宽时只允许 Table 内容区横向滚动。表格全屏外层只处理纵向滚动，避免嵌套横向滚动条。
- 空数据、短数据和无分页状态只改变分页与底部边界，不得把 Table 内容区设为 `overflow: hidden`；超宽列在这些状态下仍必须支持鼠标、触控板和触摸横向滚动。
- `md` 及以下分页由公共列表切换为 `simple` H5 形态；业务页不得用横向滚动保存桌面分页器。

## 列宽

`BizListPage` 的列 `width` 表示该列的目标基础宽度。公共列表测量 Table 可用宽度后，以纯数字像素把宽屏余量按基础比例分给名称、主体信息、时间等内容列；操作、状态、数量等紧凑列保持目标宽度。视口小于基础宽度总和时，只在 Table 内容区横向滚动。不要向 Arco 固定列传入 `calc(...)` 混合宽度，其内部固定偏移无法可靠解析。

因此：

1. 每个可见数据列都设置非零基础宽度；选择 / 展开列除外。
2. 先确定最终 zh-CN / en-US 表头、枚举、时间格式和动态操作文案。
3. 按真实单元格计算头像、状态点、复制 / 排序图标、操作槽位、间距和 padding；声明宽度不得小于当前语言表头的单行最小宽度，公共列表会做最后兜底。
4. 主要内容列使用较大的基础宽度；状态、数量和操作列明显更小。不要为了铺满表格主动放大紧凑列，宽屏余量由公共列表分配给内容列。
5. 优先通过准确列宽、操作折叠和紧凑分页让内容适配；仍然超宽时才由表格内容区提供唯一横向滚动。调用页不覆写默认 `scroll.x`，也不能用页面滚动掩盖错误列宽比例。

无设计宽度时可从以下范围开始，再以浏览器实测修正：

| 内容 | 基础宽度 |
| --- | --- |
| 头像 + 名称 / ID 双行 | 200-240 |
| 普通名称 / 账号 | 120-184 |
| 日期 | 112-128 |
| 日期时间到秒 | 24 小时 176-192；12 小时 200-216 |
| 短状态 | 64-80 |
| 复合状态 / 枚举 | 88-120 |
| IP | 144-168 |
| 数量 | 72-96 |
| 联系方式 / 原因 / 备注 / 正文 | 160-320 |

### 操作列

`ActionLinks variant="text"` 在桌面有 1-3 项时全部外露；超过 3 项时只外露第 1 项，其余放入更多菜单。桌面操作列表头、文字和图标统一左对齐。`variant="icon"` 桌面默认最多 3 个 20px 槽位。`md` 及以下由公共组件压缩为一个 32px 居中入口：单操作直接使用语义图标，多操作全部进入更多菜单；公共表格同时把操作列归一为 72px。调用页不得通过 `window.innerWidth` 重复实现，也不要给移动操作列写局部宽度补丁。

动作数组按业务优先级排列：最高频、低风险动作在前，危险或低频动作靠后；公共组件保持该顺序，不擅自重排。隐藏在菜单中的操作不占桌面列宽。

桌面文字操作列使用 `getTextActionColumnWidth(slots, title)` 计算当前语言的目标渲染宽度，不手写经验值。每个 slot 对应一个操作；动态启用 / 禁用、封禁 / 解封等文案用字符串数组放在同一个 slot，函数取当前语言候选中的最长值。函数统一计入 12px 字体、8px 间隔、14px 更多按钮和固定列左右各 12px padding，并与当前语言表头宽度取较大值；1-3 项计算全部 slot，超过 3 项只计算第 1 项和更多按钮。调用页不得再按容器宽度放大结果。

浏览器必须验证：

- zh-CN / en-US、12 / 24 小时、最长状态和动态操作。
- 表头与首行单元格 `getBoundingClientRect()` 的宽度都大于 0，边界和顺序一致。
- 日期、表头、状态和操作不截断；操作列无显著空白。
- 表头保持单行，不因刚好卡在字符宽度与 padding 的理论值而换行。
- 宽屏下主要内容列吸收空间，短列不会膨胀到接近等宽。

## 详情与关系 Drawer

`BizDetailDrawer`：

- `fields` / 单个 `sections`：纯详情，无 Tab。
- 多个 `sections`：同类信息分组。
- `tabs`：不同类型信息。
- `operationRecords`：追加操作记录 Tab。
- `summary`：Tab 上方对象摘要。
- 桌面默认宽度 50%，`md` 以下由公共组件适配为全宽；默认无 footer。
- 多 Tab 时由公共组件保持 Tab 头固定、内容区独立滚动，并统一 Drawer / Tab 的主题背景；业务详情不得复制或覆盖这套滚动和背景样式。

同一实体有多个入口时，抽成唯一 `<Entity>DetailDrawer`，内部复用 `BizDetailDrawer`；入口只传 ID、visible、onClose 和可选 defaultTab。

`BizRelationListDrawer`：

- 用于详情数量、右箭头和“查看列表”触发的好友、群组、成员、设备等关系列表。
- 保留父 Drawer，不替换父内容、不增加临时 Tab。
- 桌面默认视口 50%，`md` 以下由公共组件适配为全宽；调用方不写固定像素宽度，不默认传 `scroll.x`。
- 同结构关系列表用一个组件加语义化 `mode`。
- 实现文件必须存在公开入口 import 和 JSX 调用；无明确设计例外时禁止直接组合 Arco Drawer + Table。

打开独立、较长或可继续操作内容的动作，同样使用新的 Drawer 承载。

## 详情表格与设置页

- 记录表格首选 `BizDetailDrawer.operationRecords`；关系列表使用 `BizRelationListDrawer`。
- 特殊表格确需手写时 import `@shared/ui/biz-detail-table.less`，使用 `className="use-biz-detail-table"`、`border={false}` 和 stripe；分页在圆角框外。
- 标准表单 Modal 使用 `use-biz-form-modal`，成功态追加 `is-success`。
- `SettingsPageShell` 下独立 `SettingsSectionCard` 保持 12px 纵向间距；同一锚点的多个 card 放入语义分组容器，不能边框相贴。

## 完成检查

- 预期项目组件是否真实接入，是否仍有等价裸 Arco 组合。
- 抽取组件是否归属正确、从公开入口导入且没有循环依赖。
- 每列是否有非零宽度并通过真实内容验证。
- Drawer、关系钻取、记录表格和设置卡片是否使用对应公共契约。
- loading、empty、error、locale、主题和关键交互状态是否完整。
- 响应式缺口是否在公共组件集中修复，而不是由调用页重复覆盖。
