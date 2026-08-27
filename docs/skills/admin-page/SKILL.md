---
name: admin-page
description: Generate or update admin navigation, routes, lists, filters, detail drawers, relation drawers, and records from explicit navigation, readable Figma, PRD, and generated Admin OpenAPI.
---

# Admin Page Generation

开始前读取 `project-rules`、`component-usage` 和 `css-usage`；涉及 API 生成时读 `api-generation`，提供完整 Figma 地址时读 `figma-rules`。

## 信息来源

页面可见信息按以下优先级确定：

1. 完整且可只读访问的 Figma 地址
2. 当前任务 PRD / 产品说明
3. 脚本生成的 Admin OpenAPI 与 `AdminAPI` 类型
4. 现有同类页面模式

规则：

- 高优先级来源明确列出的筛选项、列、详情字段、分组、Tab 和操作是闭合集合；低优先级来源只补字段绑定、枚举、格式、校验、权限和请求契约，不追加可见项。
- 只有整个区域未提供或明确标注待补时，才由下一优先级来源定义该区域。
- Figma / PRD 决定展示内容；生成接口决定真实可请求和可提交的数据。
- 完整 Figma 明确展示但接口缺失的字段，可以保留空值或局部 UI 壳，并在交付中列出契约缺口；不得虚构请求参数、响应或修改生成类型。该例外不适用于只有 PRD / API 的页面。
- Figma 地址不可读时必须说明，不能假装已读取。

## 增量生成

1. 先检查未提交 git、现有路由、页面、公开组件和 API 调用方。
2. 接口变化先按 `api-generation` 执行 `npm run openapi`，保留完整生成 diff。
3. 已有接口签名变化时，更新点名目标；没有明确目标时沿现有 import 和类型引用同步直接调用方。
4. 没有调用方的新接口，只有能识别为独立管理对象、列表能力或明确菜单目标时才生成路由和页面。
5. 详情、创建、更新、状态动作、上传、鉴权和记录接口不单独落页。
6. 接口契约不足时报告缺口，不创建 `ApiNotReady`、mock 页面或“接口未就绪”占位组件。
7. 不覆盖用户已有改动，不格式化或重构无关文件。

## 导航与路由

导航结构优先级：

1. 用户显式提供的导航树
2. 完整可读 Figma 侧栏
3. PRD 导航说明
4. 现有 `src/shared/config/routes.ts`
5. 接口语义推导

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

### 1. 建立组件清单

写 JSX 前列出目标页面需要的公共组件，并搜索公开入口和现有调用方。标准页面通常包含：

- 列表：`BizListPage`、`Filter*`、`ActionLinks`
- 实体详情：已有 `<Entity>DetailDrawer`，否则 `BizDetailDrawer`
- 关系钻取：`BizRelationListDrawer`
- 记录：`BizDetailDrawer.operationRecords` 或 `BizOperationTimeline`

最终代码必须出现对应 import 和 JSX；仅在分析中找到组件不算完成。

### 2. 读取接口

- 只使用 `src/shared/api/admin/**` 的生成函数与 `AdminAPI` 类型。
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

默认一行四项；控件放在 Arco `Form.Item` 和 `FilterField` 内，不用 Tailwind 重做 Form / Grid。

### 4. 生成表格

Figma / PRD 未定义列集合时：

- ID 与名称 / 标题 / 账号优先合并，复用 `AvatarNameCell` 或 `DoubleLineCell`。
- 其余响应字段默认一个字段一列。
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
- Figma / PRD 未明确宽度时使用组件默认的视口 50%，不在调用页重复传 `width`。

关系数量、右箭头和“查看列表”打开新的 `BizRelationListDrawer`，保留父详情的 Tab、滚动位置和数据。关系列表不是默认常驻 Tab；“基本信息 / 通讯录 / 群组 / 操作记录”中，通讯录和群组由数量钻取时，父详情只保留“基本信息 / 操作记录”。

打开后承载独立、较长或可继续操作内容的列表 / 详情操作，使用新的 Drawer，不把临时内容插入当前详情或临时增加 Tab。

关系 Drawer 默认视口 50%，不写固定 `640px` / `880px`，不默认添加 `scroll.x`。只有高优先级来源明确且公共组件无法合理扩展时才允许自建。

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
- Drawer 是否保持默认 50%，没有无依据固定像素宽度。
- 列宽是否基于最终中英文文案和真实内容验证，操作列没有截断或显著空白。
- API 和 typings 是否仍完全由生成命令维护。
- 浏览器是否验证目标流程、空态、最长内容、滚动、主题和关键视口。

关系 Drawer 可定向检查：

```bash
rg -n "BizRelationListDrawer|<Drawer|<Table|width=|scroll=" path/to/detail.tsx path/to/relation-list.tsx
```

无设计例外时，裸 `Drawer + Table`、固定像素宽度或默认 `scroll.x` 命中表示生成未完成。
