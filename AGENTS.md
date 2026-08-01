# im-admin — Agent 准则

给 AI / 协作者的项目约定。改代码前先遵守下列规则；细节以 `README.md` 为准。

## 全局基本准则

**优先采用 Arco Design 标准组件；Figma 约束交互细节；非标准组件强制像素级布局。**

全仓库统一顺序：

1. **优先 Arco Design / Arco Design Pro 标准组件** — `Form`、`Grid`、`Space`、`Card`、`Table`、`Button`、`Select` 等；能 props 解决的不要手写布局或 Tailwind 重做
2. **Figma 约束交互与视觉细节** — 在标准组件之上，用稿约束状态、间距观感、色/圆角/字号等；以 `get_design_context` + 截图对照，差异用 `use-*` / props 补齐（**不**为贴稿拆掉 Grid 等标准结构）。**Figma 只读：禁止任何写入/编辑稿面**
3. **非标准组件（自建壳层 / 无 Arco 对应物）** — **强制像素级布局**：对照 Figma 图层数值与截图双验证，逐帧还原
4. **Tailwind** — 仅补 Arco 覆盖不到的自建装饰；`preflight: false`；禁止用 Tailwind 替代 Form/Grid/Table

同内容：`.cursor/rules/arco-first.mdc`、`.cursor/rules/figma-pixel-verify.mdc`（均 `alwaysApply`）。

## 参考基线：Arco Design Pro

本仓库能力源自 [Arco Design Pro](https://github.com/arco-design/arco-design-pro) 的 **Vite 精简模板**（`arco-design-pro-vite`），官方站点 [pro.arco.design](https://pro.arco.design)。

实现 / 对照问题时优先参考上游：

- 布局壳层（Navbar / Menu / Settings 抽屉）、主题切换、i18n、权限包装等 Pro 惯例
- 组件用法与主题变量以 [Arco Design React](https://arco.design/react/docs/start) + Pro 主题包为准

本仓库相对上游的刻意差异（不要「还原成官方脚手架」）：

- 目录按 **FSD** 重组，不是 Pro 默认的 `src/pages` + 扁平结构
- 状态用 **MobX**，不是 Pro 常见的 Redux / context-only 方案
- 样式为 **Arco 优先 + Tailwind 补位（关 Preflight）**，Less 仅作 Arco 重置 / 不得已补充
- 业务菜单与视觉以 **Figma 业务1.0** 为准，演示页（workplace 等）可不挂菜单

不确定交互或布局惯例时：先查 Pro Vite 模板对应实现，再按上表差异落到本仓库分层。

## 技术栈

- React 18 + TypeScript + Vite 5 + React Router v6
- UI：**Arco Design**（`@arco-design/web-react` + `@arco-themes/react-arco-pro`）
- 状态：**MobX** / `mobx-react-lite`（不要引入 Redux）
- 样式：**Arco Design 优先**；Tailwind CSS v3 仅补 Arco 覆盖不到的自建布局（`preflight: false`）；Less 用于必要的 Arco 重置
- 路径别名：`@app` / `@pages` / `@widgets` / `@features` / `@entities` / `@shared`

## FSD 目录

```text
src/app | pages | widgets | features | entities | shared
```

- 禁止在 `src/` 下新建 `components`、`containers`、`services`、`utils`、`hooks` 等遗留根目录
- 页面放 `pages/`；用户交互特性放 `features/`（如拉黑/白名单弹窗、用户详情 Drawer）；可复用复合 UI 放 `widgets/`；跨页实体与全局 store 放 `entities/`；通用能力放 `shared/`
- 依赖方向：`pages → widgets/features → entities → shared`，禁止反向依赖；`features` 与 `widgets` 同层，优先不要互相依赖

## 样式优先级（强制）

与「全局基本准则」一致，落地时：

1. **Arco 标准组件** — 结构 / 布局走组件 + props
2. **Figma 细节** — 标准组件上的交互与 token，用 `use-*` / props 补
3. **非标准组件** — 像素级布局（图层 + 截图双验证）
4. **Tailwind** — 仅自建装饰；勿重做 Form/Grid/Table
5. **少建** `style/index.module.less`（伪元素 / 深度 DOM 等除外）

| 场景 | 用什么 |
| --- | --- |
| 表单 / 筛选 / 表格 / 按钮 | **Arco**（Pro：`Card` + `Form` + `Grid` + `Space`） |
| 标准组件上的 Figma 交互/视觉差 | **`global.less`（`use-*`）** |
| 非标准自建 UI（page-tabs 凹角等） | **像素级**（Figma 图层 + 截图） |
| 自建壳层装饰间距 | **Tailwind**（`preflight: false`） |
| 单处打穿 Arco 内部 DOM | **本地 Less Modules** |

硬性约束：

1. **`preflight: false`**（`tailwind.config.js`），禁止打开，避免冲掉 Arco 基础样式。边框重置见 `src/app/styles/tailwind.css`（`@layer base` 仅补 `border-width:0`，修复 `border-b`+`border-solid` 其它边变 3px）
2. **不要用 Tailwind 全面替换** Arco 主题 / 组件内部样式；当前无 prefix，勿另起一套工具类前缀
3. 主题色走 `applyThemeColor` + `settings.json` 的 `themeColor`（默认 `#635CFF`）；**浅/暗色 primary/6 均钉品牌色**
4. 语义色以 `src/app/styles/theme-tokens.less` 为准；壳层用 `--color-bg-1` / `--color-bg-2` 等变量，勿写死浅色 hex
5. 样式入口：`arco.css` → `tailwind.css` → `global.less`（含 theme-tokens）
6. **新增**自定义 UI 默认不建 `style/index.module.less`
7. 筛选区参考 Arco Design Pro search-table：`SearchFilterBar`（`Card` + `Form` + `Grid` gutter=`[24, 16]`，默认 Col span=6 **一行四个**；操作区占满行末剩余栅格右对齐）；`.use-biz-filter-bar` 只补视觉；控件用 `FilterKeywordInput` / `FilterInput` / `FilterSelect` / `FilterMultiSelect` / `FilterDateRange`
8. 壳层菜单仍用 `admin-shell/style/layout.module.less`（复杂侧栏覆盖）


## UI / 业务

- 视觉与交互以 Figma「IM管理后台 / 业务1.0」为准；侧栏常规 **240px** / 最小 **56px**（贴边全高、仅右边框，Figma `862:20168`；折叠见 `602:35590`）
- 通用列表积木复用 `@widgets/biz-list`（`SearchFilterBar` / `DataSummary` / `BizListPage` / `TableBatchBar`）
- 业务表格约定（`BizListPage`）：单元格默认单行省略 + 溢出 Tooltip；默认斑马纹（Hover/选中优先）；`操作` 列自动 `fixed: 'right'`，左侧投影走 Arco 横向滚动标准（仅 fixed + 未滚到最右时出现）；分页默认 15 条、选项 15/30/50，**total ≤ 15 不展示分页**；多选时标题旁展示已选数量
- 详情 Drawer / Modal 内表格统一 `className="use-biz-detail-table"`（外框 + 单元格网格，见 `global.less`）
- 操作列用 `ActionLinks`：最多 3 个 icon，Hover Tooltip；超出收进「…」下拉（Figma `602:34917`）
- 批量操作条 `TableBatchBar`：选中后顶栏居中浮出深色条（Figma `602:34650`），含「只显示已选」开关 + 归档/编辑/删除
- 页面打开记录快捷导航复用 `@widgets/page-tabs`（Figma `609:47633`），由 Layout 自动收录路由并支持关闭 / 溢出 / 全屏
- 文案默认中文；需要 i18n 时走现有 `locale` 模式

## API

- Admin 网关生成物：`src/shared/api/admin/**`（`npm run openapi`），**禁止任何手改**
- 业务页 / feature **直接**使用生成函数与 `AdminAPI` 字段名（Form/Table/state 不做映射）；列表信封用 `res.data?.list` / `res.data?.total`
- 无 OpenAPI 的菜单页：保留路由，统一 `ApiNotReady`（文案「接口未就绪」），不要再引入 mock / `/api/biz`
- 手写 axios 单例 `shared/api/request.ts` 勿删；鉴权 token 走 `setAccessToken` / `getAccessToken`

## 改动边界

- 只改任务相关文件；不顺手大重构、不批量「格式化无关文件」
- 不擅自提交 git / 推远程；用户明确要求再提交
- 新增依赖前先说明理由；UI 库以 Arco 为准，不要再引入第二套组件库
