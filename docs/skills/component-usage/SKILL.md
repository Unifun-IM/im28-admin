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

详情组件必须额外做“同一实体”发现：

1. 先确定详情对象的实体类型和稳定 ID，例如用户 + `user_id`、群组 + `group_id`，不能把“用户查询页详情”“用户日志页详情”当成两个实体。
2. 搜索 `<Entity>DetailDrawer` / `<Entity>DetailModal`、相关详情接口调用方、其它列表的详情操作，以及 `widgets` / `features` 公开入口。
3. 同一实体从查询、日志、黑名单、白名单、关联列表等不同页面进入时，默认必须复用同一个实体详情组件；页面只保存目标 ID 并传入 `visible`、`entityId`、`onClose`。
4. 入口需要默认落在日志、权限等常驻 Tab 时，通过 `defaultTab` / `initialView` 等语义化 props 表达，不复制 Drawer、详情请求、字段数组、Tab 或样式；由数量 / 箭头触发的关系列表不属于常驻 Tab。
5. Figma / PRD 明确要求同一实体在某入口展示额外信息时，优先扩展公共组件的可选 props / slots；只有对象契约、权限或交互流程本质不同，且无法共享详情主体时，才建立独立组件。

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
- 业务 Drawer 在 Figma / PRD 未明确宽度时，桌面端统一默认使用视口宽度的 `50%`。优先复用默认 `width="50%"` 的项目 Drawer，不在页面重复传参，也不无依据写死 `640px`、`880px` 等固定宽度。
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

生成或调整列表时必须逐列分析宽度，不能把 `width` 当作字段类型的固定模板或最终像素上限。`BizListPage` 会为普通列开启 `ellipsis`，固定操作列又会触发横向滚动；Arco 因而使用 `table-layout: fixed` 和 `colgroup`。表格宽于各列 `width` 总和时，浏览器会继续分配剩余宽度，所以这里的 `width` 是基础分配值，也会影响最终列宽比例。

特别注意：在当前 Arco 布局中，不能通过“不写 `width`”制造弹性列。其它列都有 `width` 时，无宽度列可能被压缩到接近 `0px`，造成表头或内容看似与相邻列重叠。除选择 / 展开等框架列外，每个可见数据列都必须提供大于 `0` 的基础宽度；希望主要内容列吸收更多空间时，应给它更大的基础宽度权重。

Figma / PRD 明确宽度时按高优先级来源；否则按以下顺序推导：

1. 先确定最终 zh-CN / en-US 表头、枚举和操作文案，再找出最长表头、格式化后的典型值及所有动态状态文案；不能用字段原始值或临时文案计算。
2. 按真实渲染形态计算内容宽度，例如头像、复制图标、状态点、排序图标、操作按钮与间距；不要只按字符数估算。日期时间按 `formatDateTime` 的最终输出计算。
3. 加上当前表格样式的横向空间：普通单元格约 `33px`，固定操作列 `24px`；可排序表头还要计入图标及 `4px` 间距。
4. 取表头与单元格最小宽度的较大值，向上取便于维护的 `4px` / `8px` 整数；截图验证后再微调。
5. 为每个可见数据列写入非零基础宽度，累计数据列、选择 / 展开列的基础宽度，与侧栏展开后的常用内容区比较；只有真实放不下时才接受横向滚动。
6. 同时检查比例：常用内容区宽于基础宽度总和后，最终列宽近似按各列基础宽度占比分配。主要内容列应获得较高占比，状态、数量和操作等短列应明显低于主要内容列。

没有设计宽度时可从下列区间起算，但最终仍以实际文案和内容为准：

| 内容形态 | 常用起算宽度 |
| --- | --- |
| `AvatarNameCell` / ID + 名称双行 | `200-240px` |
| 普通名称、账号 | `120-184px` |
| 仅日期 | `112-128px` |
| 日期时间（精确到秒） | 24 小时制从 `176-192` 起算；12 小时制从 `200-216` 起算，并分别验证最终输出 |
| 状态点 + 单个短文案 | `64-80` 起算；中英文最长状态放不下时继续增加 |
| 复合状态、较长枚举 / 类型 | `88-120` 起算 |
| IPv4 / IPv6 | `144-168px`，按接口实际支持范围取值 |
| 数量、短数字 | `72-96px` |
| 联系方式、原因、备注、消息正文等内容列 | `160-320` 起算，按内容形态提高其分配占比并保留省略 |

`ActionLinks` 操作列按实际外露槽位计算，不为下拉菜单里的操作预留宽度：

- `variant="text"` 且操作数为 1-3 时，外露全部文字；单操作不保留更多占位。超过 3 项时，默认只外露第 1 项和 `14px` 更多按钮，除非显式传入 `maxVisible`。
- `variant="icon"` 默认最多 3 个 `20px` 槽位；溢出时更多按钮占其中一个槽位。
- 外露槽位之间间距为 `8px`。文字操作列最小宽度为“最长状态下所有外露文案的实际宽度 + 外露间距 + 实际存在的更多按钮 + `24px` padding”，并与中英文表头最小宽度取较大值。
- 动态的启用 / 禁用、封禁 / 解禁等操作按所有状态中最长文案计算；超过 3 项且已经折叠时，不把隐藏操作文案累计到列宽。

操作列按以下实际分支计算，不额外添加经验性安全宽度：

- 单个文字操作：`文案宽度 + 24px padding`。
- 2-3 个文字操作：`所有外露文案宽度之和 + 8px × 间隔数 + 24px padding`。
- 超过 3 个且使用默认折叠：`首个外露文案宽度 + 8px + 14px 更多按钮 + 24px padding`。
- 图标操作：按实际可见的 `20px` 槽位、`8px` 间距和列 padding 计算。

完成后必须在浏览器中用有代表性的最长数据验证，不能只看 `columns` 配置或空表：

- 在侧栏展开状态覆盖常用桌面内容区和窄屏；分别检查 zh-CN / en-US、12 / 24 小时时间格式和动态操作状态。
- 读取表头及首行单元格的 `getBoundingClientRect()`；每个可见列宽度必须大于 `0`，表头顺序、左右边界和对应单元格应一致，禁止出现某列消失后相邻表头贴合或内容重叠。
- 对比最终宽度比例：主要内容列负责吸收较多空间；状态、数量、操作等短列不得与主要内容列接近等宽，也不得因宽屏按错误权重显著膨胀。
- 日期时间、表头、状态与操作不得截断，操作列也不得留出显著空白；若实际宽度与预期不符，先调整整表基础宽度比例，再决定是否设置或调整 `scroll.x`。

## 详情 Drawer

详情优先使用 `BizDetailDrawer`：

- 纯详情：传 `fields`，或传一个 `sections`。
- 多分组详情：传多个 `sections`，不用为了普通分组强行开 Tab。
- 多类信息或多接口：传 `tabs`，或同时传 `operationRecords` 自动追加操作记录 Tab。
- 需要在 Tab 上方展示头像、名称、状态等对象摘要时传 `summary`，不要把摘要重复塞进 Descriptions。
- 默认宽度为视口的 `50%`，默认无 footer；`BizDetailDrawer` 已提供该默认值，页面无需重复传 `width`。只有 Figma / PRD 明确宽度时才覆盖，需要编辑/确认流程时再传 footer。

`BizDetailDrawer` 是通用详情积木，不代表每个页面都应直接各拼一套 Drawer。同一业务实体已经存在跨页面详情组件时，页面必须优先使用该实体组件；实体组件内部再复用 `BizDetailDrawer`。例如用户查询、用户日志、黑名单和白名单应共用一个 `UserDetailDrawer`，入口差异只通过目标 ID 和默认 Tab 表达。

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
- 多种常驻记录信息使用语义化英文 tab key，如 `operationRecords`、`changeRecords`、`loginRecords`；关系数量钻取按下节使用子 Drawer。
- 字段空值交给 `BizDetailDrawer` 默认展示 `--`，不要在每个字段重复写兜底，除非该字段有特殊展示。
- Drawer 打开时拉详情；关闭时清理当前对象和临时状态。
- 同一实体的详情 API、字段、Tab、空值、状态和样式只维护在实体详情组件中；接口变化时修改该组件，不在每个调用页面重复同步一套实现。

### 详情内关系钻取

详情基础信息中的可点击数量、带右箭头的关联值或“查看列表”操作，例如好友数量、群组数量、成员数量、绑定设备数量，点击后默认打开一个新的子 Drawer 承载关联列表：

- 保留父详情 Drawer，不替换父 Drawer 内容，也不把这类点击临时切换成父详情的新 Tab；关闭子 Drawer 后应回到父详情原来的 Tab 和滚动位置。
- 子 Drawer 默认必须通过 `@widgets/biz-relation-list-drawer` 的公开入口使用 `BizRelationListDrawer`，标题使用明确的列表语义，例如“好友列表”“群组列表”；同结构的多种关系可以由一个实体关系 Drawer 通过 `mode` 区分。只有完整可读 Figma / PRD 明确要求公共组件无法表达的结构，并且扩展公共组件仍不合理时，才允许局部自建。
- 关系子 Drawer 同样默认使用视口宽度的 `50%`，不是父 Drawer 宽度的 50%；`BizRelationListDrawer` 已提供该默认值，无明确设计要求时不要覆盖。
- 父详情只维护当前关系类型 / 目标 ID 和子 Drawer 开关；关联列表请求、loading、分页、空态和表格列由子 Drawer 自己管理，默认在打开时加载，不随父详情提前拉取完整列表。
- 同一时刻只打开一个关系子 Drawer。关闭子 Drawer 只清理关系列表状态，不关闭或重置父详情。
- 子 Drawer 内不嵌套 `BizListPage`；列表复用详情表格样式并提供稳定 `rowKey`，需要继续查看关联对象详情时复用对应实体详情组件。
- 只有完整可读 Figma / PRD 明确把关联列表设计为父详情的常驻 Tab 时，才放入父详情 Tabs；不能因为存在关系接口就自动增加 Tab。
- 因此在“基本信息 / 通讯录 / 群组 / 操作记录”这类结构中，如果通讯录和群组已经由基本信息里的好友数量、群组数量触发，则父详情只保留“基本信息”和“操作记录”，中间两个关系 Tab 不生成。

关系子 Drawer 的组件复用必须落实到最终调用代码，不能只在分析中找到组件：

- 关系列表实现文件应存在 `BizRelationListDrawer` 的公开入口 import 和 JSX 调用；页面或实体详情只传 `visible`、标题、关闭回调、数据、列、稳定 `rowKey` 与分页等必要参数。
- 无明确设计依据时，关系列表实现不得为了该子 Drawer 直接组合 Arco `<Drawer>` 与 `<Table>`，不得写页面级固定像素 `width`，也不得为了凑列宽默认添加 `scroll.x`。
- 修改已有页面时同时检查旧实现是否仍残留；完成前对本次变更文件搜索 `BizRelationListDrawer`、`<Drawer`、`<Table`、`width` 和 `scroll`，逐个确认命中符合上述边界。

## 详情内表格

Drawer / Modal 内的关联列表、操作记录、变更记录、登录记录、审计记录等表格统一使用详情表样式，**不要**用裸 Arco Table（否则只有表头顶角圆角，底角会被裁切成直角）：

- 首选 `BizDetailDrawer.operationRecords`（内部已带样式）。
- 关联列表（好友 / 群聊 / 成员等）默认使用 `BizRelationListDrawer`（默认不设 `scroll.x`，与列表一致）。
- 稿面为 Timeline 的操作日志优先 `BizOperationTimeline`。
- 非关系列表的特殊记录表格，或高优先级来源明确要求公共组件无法表达的结构，确需手写 Arco `Table` 时：
  1. `import '@shared/ui/biz-detail-table.less'`
  2. `className="use-biz-detail-table"`
  3. `border={false}`（关掉 Arco `::before` 底边）
- 样式文件：`src/shared/ui/biz-detail-table.less`
- 视觉约定：对齐 `use-biz-table`——`border={false}` + 清 Arco 默认圆角/边框；外框 8px；表体只保留列分隔；分页在框外。
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
- 不为同一实体的不同来源页面创建平行详情 Drawer；先复用实体详情组件，再用 props 表达入口差异。
- 不用切换父详情 Tab 或替换父 Drawer 内容来承载由数量 / 箭头触发的关系列表；此类钻取使用独立子 Drawer。
- 不让相似通用 UI 继续散落在多个业务页面；确认稳定语义后按 FSD 抽取。
- 不把操作记录表格做成普通列表页嵌进 Drawer。
- 不手改 `src/shared/api/admin/**` 生成物。
