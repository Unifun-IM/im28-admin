---
name: component-usage
description: Discover, reuse, compose, and extract project components for admin UI; apply Arco correctly and size table columns from rendered content.
---

# Component Usage

本文件只定义“使用什么组件以及如何使用”。页面可见字段、来源优先级和路由由 `admin-page` 决定；视觉与响应式结果由 `design-system` 决定，颜色和样式实现由 `css-usage` 决定。

## 决策顺序

1. 搜索公开组件、现有调用方和业务中散落的相似 UI。
2. 已有组件能表达时直接复用。
3. 没有组件但已有多个稳定相似实现时，按 FSD 抽取。
4. 再使用 Arco Design / Arco Design Pro。
5. 项目组件和 Arco 都无法表达时才自建。

不能因为直接写 JSX 更快，就绕过项目组件已有的样式、空态、分页、主题和交互。

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

## 列宽

`BizListPage` 的 Arco Table 会使用 fixed layout；列 `width` 是基础分配权重，不是最终像素上限。内容区比基础宽度总和更宽时，浏览器会按比例分配剩余空间；其它列有宽度而某列无宽度时，该列可能被压到接近 0。

因此：

1. 每个可见数据列都设置非零基础宽度；选择 / 展开列除外。
2. 先确定最终 zh-CN / en-US 表头、枚举、时间格式和动态操作文案。
3. 按真实单元格计算头像、状态点、复制 / 排序图标、操作槽位、间距和 padding。
4. 主要内容列使用较大权重；状态、数量和操作列明显更小。
5. 公共列表负责在真实内容超宽时提供表格内部滚动；调用页不覆写默认 `scroll.x`，也不能用滚动掩盖错误列宽比例。

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

`ActionLinks variant="text"` 默认 1-3 项全部外露，超过 3 项时外露第 1 项和更多按钮；`variant="icon"` 默认最多 3 个 20px 槽位。隐藏在菜单中的操作不占列宽。

文字操作列宽度按“所有外露文案宽度 + 8px × 间隔数 + 更多按钮（存在时）+ 24px padding”计算，并与中英文表头宽度取较大值。动态启用 / 禁用、封禁 / 解封等按所有状态中最长文案计算，不额外添加经验性安全宽度。

浏览器必须验证：

- zh-CN / en-US、12 / 24 小时、最长状态和动态操作。
- 表头与首行单元格 `getBoundingClientRect()` 的宽度都大于 0，边界和顺序一致。
- 日期、表头、状态和操作不截断；操作列无显著空白。
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
