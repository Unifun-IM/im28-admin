---
name: component-usage
description: Choose, compose, and extract components when generating or adjusting admin pages. Prefer existing project components, then use Arco Design correctly, and extract repeated business UI into the proper FSD layer.
---

# Component Usage Skill

本 skill 用于生成或调整页面时选择、组合和抽取组件。目标是优先复用项目已有积木，在缺少项目封装时正确使用 Arco Design；发现业务中散落的相似通用 UI 时，抽成明确归属的组件，避免继续复制。

## 基本顺序

1. 先搜索项目公开组件和业务中散落的相似实现，完成组件发现与重复 UI 判断。
2. 已有项目组件能够表达时直接复用；本次范围内的等价散落实现迁移到该组件。
3. 没有现成组件，但已经存在多个语义、结构和交互相似的实现时，先按 FSD 抽成组件，再由页面复用。
4. 没有项目组件或可抽取的重复实现时，使用 Arco Design / Arco Design Pro 标准组件及其 props、组合模式。
5. 只有项目组件和 Arco 都无法表达的非标准 UI，才新增小范围自建实现。

禁止因为直接写 Arco 或复制 JSX 更快，就绕过项目已经封装的交互、样式、空态、主题和分页约定。

新增或修改页面样式时读取 `docs/skills/css-usage/SKILL.md`；页面涉及 Figma 设计稿时，先读取 `docs/skills/figma-rules/SKILL.md`；需要选择图标来源时，再读取 `docs/skills/svg-icon-usage/SKILL.md`。

不要在 `src/` 下新增通用 `components` 目录；按 FSD 放入 `pages`、`features`、`widgets`、`entities`、`shared`。

## 组件发现

实现 UI 前先搜索，而不是凭目录印象判断组件不存在。组件发现是选择 Arco 或新增实现之前的前置阶段：

- 查看 `src/shared/ui/index.ts`、相关 `src/widgets/*/index.ts` 与 `src/features/*/index.ts` 的公开导出。
- 用 `rg` 搜索组件名、页面文案、`className`、Arco 组件组合和相似交互。
- 检查当前页面同域的 feature / widget，确认是否已有未统一导出的可复用实现。
- 阅读候选组件 props 和现有调用方，确认其加载、空态、权限、主题和响应式行为。

当前常用项目组件：

| 需求 | 项目组件 |
| --- | --- |
| 标准业务列表 | `@widgets/biz-list` 的 `BizListPage` |
| 筛选区 | `SearchFilterBar`、`FilterField`、`Filter*` |
| 汇总与批量操作 | `DataSummary`、`TableBatchBar` |
| 表格单元格与操作列 | `AvatarNameCell`、`DoubleLineCell`、`StatusBadge`、`ActionLinks` |
| 纯详情、多 Tab、操作记录 | `@widgets/biz-detail-drawer` 的 `BizDetailDrawer` |
| 详情关联列表 Drawer | `@widgets/biz-relation-list-drawer` 的 `BizRelationListDrawer` |
| 详情操作日志 Timeline | `@widgets/biz-operation-timeline` 的 `BizOperationTimeline` |
| 设置页 | `@widgets/session-settings` 的 `SettingsPageShell` |
| 空态 | `EmptyState` |
| 头像、状态、图标按钮 | `UserAvatar`、`StatusBadge`、`IconButton` |
| 详情字段复制 / 可点链接行 | `CopyValue`、`DetailLinkRow` |
| 详情 / Modal 内圆角表格 | `className="use-biz-detail-table"` + `@shared/ui/biz-detail-table.less` |
| 标准表单 Modal 壳 | `className="use-biz-form-modal"` + `@shared/ui/biz-form-modal.less` |
| 未保存离开保护 | `@features/unsaved-changes` |

## 相似 UI 抽取

发现业务中存在语义、结构和交互都相近的重复 UI 时，不新增第三份实现。先确认共同职责和必要变体，再抽取组件：

| 组件性质 | FSD 归属 |
| --- | --- |
| 无业务语义的基础展示或交互 | `src/shared/ui/<component>` |
| 跨页面复用的复合业务 UI | `src/widgets/<component>` |
| 某个用户动作或业务流程 | `src/features/<feature>` |
| 仅当前页面使用且没有稳定复用语义 | 保留在当前 `pages/<page>` 内 |

抽取要求：

- 组件底层继续优先组合项目组件和 Arco，不复制其内部实现。
- props 表达稳定差异，不传整页 store、请求实例或大量仅供单页面使用的配置。
- 保留 loading、disabled、empty、error、权限、暗色和 locale 等已有行为。
- 在切片 `index.ts` 暴露公共组件和必要类型，调用方通过公开入口引用。
- widget 组合其它 widget、feature 复用其它 feature 时同样只走目标切片公开入口；不要形成循环依赖或 widget / feature 互相依赖。
- 迁移本次任务范围内已确认等价的调用方；范围外的相似实现只提示，不自行批量修改。
- 不因两段 class 偶然相同就抽象；没有稳定语义时保持局部实现。

## Arco Design 最佳使用

当项目内没有合适封装时，直接使用 `@arco-design/web-react`。优先通过组件 props 和组合能力解决，不复制 Arco DOM，不引入第二套 UI 库。

API 与行为以 `package.json` 中当前安装版本、包内 TypeScript 类型和仓库现有调用为准；不确定时查阅 [Arco Design React](https://arco.design/react/docs/start) 与 [Arco Design Pro](https://pro.arco.design)，不要照搬其它版本或其它 UI 库的 props。

### 表单与筛选

- 使用 `Form.useForm()`、`Form.Item field`、`rules`、`initialValues` 和 `validate()` 管理字段，不用多份 `useState` 镜像同一表单值。
- 标准表单布局使用 Arco `Grid.Row` / `Grid.Col`；横向操作使用 `Space`。不要用 Tailwind 重做 Form/Grid 的结构职责。
- 根据字段语义选择控件：文本用 `Input`，数字用 `InputNumber`，枚举用 `Select`，boolean 用 `Switch` / `Checkbox`，日期时间用 `DatePicker`，上传用 `Upload`。
- 可清空字段配置 `allowClear`；可搜索枚举按数据量配置 `showSearch` / `filterOption`；选项文案走 locale。
- 提交时先校验再调用接口；重置使用 `form.resetFields()`，同时恢复依赖的分页和查询状态。

### 表格与数据展示

- 使用 Arco `Table` 和 `TableColumnProps<T>[]`，提供稳定且唯一的 `rowKey`。
- loading、pagination、rowSelection、scroll 等通过 Table props 控制，不在表格外复制一套状态 UI。
- 列标题、状态文案和操作文案走 locale；时间使用项目 `formatDateTime`。
- 长文本用单行省略与 `Tooltip`；图片用 `Avatar` / `Image`；状态优先项目 `StatusBadge`。
- 固定列只在横向滚动确有需要时使用，并为表格提供合理 `scroll.x`；操作列优先项目 `ActionLinks`。
- 空态优先项目 `EmptyState` 或列表封装的默认空态，不在每个页面重复 `Result` / 占位 JSX。

### Modal、Drawer 与反馈

- `Modal` 用于确认、创建、编辑和短流程；`Drawer` 用于保持列表上下文的详情或较长辅助流程。
- `visible`、关闭回调、提交 loading 和目标对象由调用方控制；异步提交期间防止重复操作。
- 简单危险操作优先 `Popconfirm` / `Modal.confirm`；多字段或多步骤操作使用业务 feature Modal。
- 操作成功或失败使用 Arco `Message`；需要持续展示的系统级信息再使用 `Notification` / `Alert`。
- 纯详情、多 Tab、详情操作记录不直接拼 Arco Drawer，优先项目 `BizDetailDrawer`。

### 布局、导航与状态

- 页面级结构优先已有 shell、list、settings 组件；局部间距和排列可用 Arco `Space`、`Grid` 或按 `css-usage` 使用 Tailwind。
- 加载使用 `Spin` / 组件 `loading` props；无结果用项目空态；完整结果页使用 Arco `Result`。
- Tabs、Menu、Dropdown、Trigger 等保持受控 key / visible 状态，使用稳定语义化 key。
- 标准动作图标使用 `@arco-design/web-react/icon`，陌生图标按钮加 `Tooltip`；具体来源遵守 `svg-icon-usage`。
- 主题和语言沿用项目 Provider 与 locale，不在组件内写死颜色和中英文文案。

### Arco 扩展边界

- 优先使用 `size`、`status`、`type`、`layout`、`gutter`、`span`、`loading`、`disabled` 等 props。
- 视觉差先加语义化 `use-*` class 和主题变量；深层覆盖、portal、伪元素等按 `css-usage` 决定是否使用 Less。
- 包装 Arco 组件时尽量透传合理的原始 props，并明确冲突 props；不要建立只改名字、不增加项目行为的空壳封装。
- 不依赖 Arco 未公开 DOM 结构实现业务逻辑。

## 列表页

常规后台列表页使用：

- 页面容器：`BizListPage`
- 筛选区：`SearchFilterBar` + `FilterField`
- 汇总区：`DataSummary`
- 表格：通过 `BizListPage.tableProps` 传 Arco `Table` props
- 批量操作：`BizListPage.batchActions` 或 `TableBatchBar`
- 操作列：`ActionLinks`

推荐形态：

```tsx
<BizListPage
  form={form}
  title={t['xxx.title']}
  filter={<>{/* FilterField + Form.Item */}</>}
  onSearch={handleSearch}
  onReset={handleReset}
  onRefresh={() => fetchData(page, pageSize)}
  toolbar={<Button type="primary">{t['common.create']}</Button>}
  tableProps={{
    loading,
    data,
    rowKey: (row) => String(row.id),
    columns,
    pagination: { current: page, pageSize, total, onChange }
  }}
/>
```

使用要点：

- 不手写外层 `Card + Table` 重做列表页框架。
- `BizListPage` 已处理表格卡片、斑马纹、空态、固定操作列、分页默认值、刷新与表格全屏。
- 有筛选时把 Arco `Form.Item` 放进 `FilterField`，不要用 Tailwind 重做 Grid。
- 搜索重置页码到第 1 页；重置时 `form.resetFields()` 后重新拉取。
- `toolbar` 放随批量状态隐藏的业务操作；`toolbarAlways` 放始终展示的操作。
- 配置 `batchActions` 后，选择列由“批量操作”入口进入；退出批量要清空选中。

## 筛选组件

筛选区默认一行四项。所有筛选控件都放在 `Form.Item` 内，外层用 `FilterField` 控制宽度。

| 场景 | 组件 | 说明 |
| --- | --- | --- |
| 普通文本、ID、IP、邮箱、手机号 | `FilterInput` | 默认 `allowClear`；需要回车搜索时传 `showSearchIcon` |
| 一个输入框切换多个搜索类型 | `FilterKeywordInput` | 用 `typeField` 写入同级 Form 字段 |
| 单选枚举、状态、类型、boolean 筛选 | `FilterSelect` | 选项文案走 locale；boolean 在请求前转回 boolean |
| 多选枚举、分组、标签、批量 ID | `FilterMultiSelect` | 下拉内已有搜索、全选、清除 |
| 日期 / 时间范围 | `FilterDateRange` | 默认宽度 100%；时间范围按接口格式转换后提交 |
| 数字上下限 | Arco `InputNumber` | 仍放在 `FilterField` 和 Arco `Form.Item` 内 |

## 表格列

表格列在 `tableProps.columns` 中定义，优先复用下列单元格：

- `AvatarNameCell`：头像 + 主文案 + 副文案；适合用户、账号、对象名称 + ID。
- `DoubleLineCell`：双行文本；适合 ID/名称、标题/编号、主次信息。
- `StatusBadge`：状态、启停、成功失败、风险级别。
- `ActionLinks`：操作列。列表页常用 `variant="text"`；图标列用默认 `icon`。

列生成约定：

- PRD 有列顺序时按 PRD。
- 无说明时，ID 与名称/标题/账号优先合并为一列；其余响应字段一个字段一列。
- 时间字段用 `formatDateTime`。
- 图片、头像字段用 `UserAvatar`、Arco `Avatar` 或 `Image`，不要直接展示 URL。
- 长文本保持单行省略，必要时加 Arco `Tooltip`。
- 操作列标题用 `common.action`，渲染 `ActionLinks`；不要手写一排裸 `Button`。
- 删除、禁用等危险动作必须有确认，不在 `ActionLinks` 内直接发危险请求。

### 列宽分析

生成或调整列表时必须逐列分析宽度，不能把 `width` 当作字段类型的固定模板。Figma / PRD 明确宽度时按高优先级来源；否则按以下顺序推导：

1. 找出 zh-CN / en-US 最长表头、单元格典型值、枚举文案和所有动态状态文案。
2. 按真实渲染形态计算内容宽度，例如头像、复制图标、状态点、排序图标、操作按钮与间距；不要只按字符数估算。
3. 加上当前表格样式的横向空间：普通单元格约 `33px`，固定操作列 `24px`；可排序表头还要计入图标及 `4px` 间距。
4. 取表头与单元格最小宽度的较大值，向上取便于维护的 `4px` / `8px` 整数；截图验证后再微调。

没有设计宽度时可从下列区间起算，但最终仍以实际文案和内容为准：

| 内容形态 | 常用起算宽度 |
| --- | --- |
| `AvatarNameCell` / ID + 名称双行 | `200-240px` |
| 普通名称、账号 | `136-200px` |
| 日期时间 | `168px` |
| 状态、类型、boolean | `96-120px` |
| IP | `152-168px` |
| 数量、短数字 | `80-96px` |
| 原因、备注、消息正文等长文本 | 不设 `width` 作为弹性列，或按设计使用 `200-320px` + 省略 |

`ActionLinks` 操作列按实际外露槽位计算，不为下拉菜单里的操作预留宽度：

- `variant="text"` 且操作数为 1-3 时，外露全部文字；当前单操作还会保留 `14px` 的更多占位。超过 3 项时，默认只外露第 1 项和 `14px` 更多按钮，除非显式传入 `maxVisible`。
- `variant="icon"` 默认最多 3 个 `20px` 槽位；溢出时更多按钮占其中一个槽位。
- 外露槽位之间间距为 `8px`。文字操作列最小宽度为“最长状态下所有外露文案的实际宽度 + 外露间距 + 更多 / 占位 + `24px` padding”，并与中英文表头最小宽度取较大值。
- 动态的启用 / 禁用、封禁 / 解禁等操作按所有状态中最长文案计算；超过 3 项且已经折叠时，不把隐藏操作文案累计到列宽。

整表至少保留一个有意义的内容列作为弹性列，避免每列都固定后产生无效横向滚动。完成后同时检查常用桌面内容区和窄屏：表头、状态与操作不得截断，操作列也不得留出显著空白。

## 详情 Drawer

详情优先使用 `BizDetailDrawer`：

- 纯详情：传 `fields`，或传一个 `sections`。
- 多分组详情：传多个 `sections`，不用为了普通分组强行开 Tab。
- 多类信息或多接口：传 `tabs`，或同时传 `operationRecords` 自动追加操作记录 Tab。
- 需要在 Tab 上方展示头像、名称、状态等对象摘要时传 `summary`，不要把摘要重复塞进 Descriptions。
- 默认宽度 720，默认无 footer；需要编辑/确认流程时再传 footer。

推荐形态：

```tsx
<BizDetailDrawer
  title={t['xxx.detailTitle']}
  visible={detailVisible}
  onCancel={closeDetail}
  fields={[
    { label: t['common.id'], value: detail?.id },
    { label: t['common.name'], value: detail?.name }
  ]}
  operationRecords={{
    data: records,
    loading: recordsLoading,
    rowKey: 'id',
    columns: recordColumns
  }}
/>
```

使用要点：

- 只有一类详情时不要展示 Tab；`BizDetailDrawer` 会自动渲染纯详情。
- 基本信息 + 操作记录时直接用 `operationRecords`，让组件按现有样式生成记录 Tab。
- 多种记录或关联信息时用语义化英文 tab key，如 `operationRecords`、`changeRecords`、`loginRecords`、`relatedUsers`。
- 字段空值交给 `BizDetailDrawer` 默认展示 `--`，不要在每个字段重复写兜底，除非该字段有特殊展示。
- Drawer 打开时拉详情；关闭时清理当前对象和临时状态。

## 详情内表格

Drawer / Modal 内的关联列表、操作记录、变更记录、登录记录、审计记录等表格统一使用详情表样式，**不要**用裸 Arco Table（否则只有表头顶角圆角，底角会被裁切成直角）：

- 首选 `BizDetailDrawer.operationRecords`（内部已带样式）。
- 关联列表（好友 / 群聊 / 成员等）优先 `BizRelationListDrawer`。
- 稿面为 Timeline 的操作日志优先 `BizOperationTimeline`。
- 手写 Arco `Table` 时：
  1. `import '@shared/ui/biz-detail-table.less'`
  2. `className="use-biz-detail-table"`
- 样式文件：`src/shared/ui/biz-detail-table.less`
- 视觉约定：`.arco-table-container` 外框 `8px` 圆角 + 边框，**上下圆角一致**；分页在圆角框外。
- 不在 Drawer 内嵌套 `BizListPage`，避免卡片套卡片和分页/筛选语义混乱。

```tsx
import '@shared/ui/biz-detail-table.less';

<Table
  className="use-biz-detail-table"
  rowKey="id"
  columns={columns}
  data={list}
  pagination={{ current, pageSize, total, showTotal: true }}
/>
```

详情内表格列规则与列表列一致：时间用 `formatDateTime`，长文本用省略 + `Tooltip`，状态用 `StatusBadge`，文案走 locale。

## 标准表单 Modal

账号创建、重置密码、改白名单、建角色等标准表单弹窗：

- `import '@shared/ui/biz-form-modal.less'`
- `Modal className="use-biz-form-modal"`；成功态再加 `is-success`（隐藏 header/footer）
- 业务差异用额外 class 覆盖，不复制整份壳层 Less
- 详情字段内联复制用 `CopyValue`；Descriptions 内跳转用 `DetailLinkRow`

## 通用页面状态

- 普通空态：用 `EmptyState`；`BizListPage` 默认已经注入表格空态。
- 头像：用 `UserAvatar`；需要稳定默认头像时传 `userId` 或名称。
- 通用状态：用 `StatusBadge`，不要为每个页面复制一套状态样式。
- 图标按钮：用 `IconButton` 或 Arco `Button` + Arco icon；如果 Figma 指定自定义 SVG，先读 `figma-rules`，再按 `svg-icon-usage` 决策归属和引用方式。

## 设置页和表单页

系统参数、偏好设置、配置类页面优先参考 `src/pages/system-params/settings/index.tsx`：

- 页面壳层用 `SettingsPageShell`。
- 每个独立配置分组使用 `SettingsSectionCard`；直接放在 Arco `Form` 下时，`SettingsPageShell` 会统一提供 `12px` 纵向间距，不要在生成页面重复补 margin 或依赖额外 `className`。
- 同一个锚点下包含多个 `SettingsSectionCard` 时，用一个语义分组容器包住，并保持容器内 `12px` 纵向间距；不要让卡片边框直接相贴。
- 表单仍使用 Arco `Form`、`Grid`、`Input`、`Select`、`Switch`、`Upload` 等。
- 有未保存内容离开风险时用 `useUnsavedChangesGuard` 和 `UnsavedChangesModal`。
- 后台图片上传使用 `uploadAdminImage`，不要绕过凭证流程自写业务 request 上传。

新增业务创建 / 编辑流程优先放在 `features/<business-action>/ui/*Modal.tsx`，页面只负责打开、传 target、刷新列表。

## 不要做

- 不绕过项目已有组件直接复制其 Arco 组合和样式。
- 不用 Tailwind 替代 Arco `Form`、`Grid`、`Table`、`Button`。
- 不为单页复制 `biz-list`、`biz-detail-drawer` 已有能力。
- 不让相似通用 UI 继续散落在多个业务页面；确认稳定语义后按 FSD 抽取。
- 不把操作记录表格做成普通列表页嵌进 Drawer。
- 不手改 `src/shared/api/admin/**` 生成物。
