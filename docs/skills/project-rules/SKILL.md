---
name: project-rules
description: Shared admin-scaffold project rules for AI agents, covering Arco-first UI, Figma read-only verification, SVG assets, theme tokens, OpenAPI generated files, API/UI behavior, and strict task scope.
---

# Project Rules Skill

适用对象：Codex、Claude Code、Cursor，以及其它会读取仓库 Markdown 约定的 AI 编码助手。

本 skill 是本仓库通用工程规则的单一来源。工具私有入口只做薄引用，不复制正文：

- Codex：`AGENTS.md`
- Cursor：`.cursor/rules/*.mdc`
- Claude Code：`.claude/CLAUDE.md`

## UI 实现优先级

1. 优先采用 Arco Design 标准组件及 Pro 惯用法。
   - `Form`、`Grid`、`Space`、`Card`、`Table`、`Button`、`Select` 等优先。
   - 能用组件和 props 解决的，不用手写布局或 Tailwind 重做。
2. Figma 只约束标准组件上的交互与视觉细节。
   - 状态、反馈、间距观感、色、圆角、字号等用 `use-*` 或组件 props 补齐。
   - 不为贴稿拆掉 Arco `Grid` / `Form` / `Table` 等标准结构。
3. 非标准组件强制像素级布局。
   - 无 Arco 等价物的自建 UI，需要按 Figma 图层数值与截图双验证还原。
4. Tailwind 最后使用。
   - 仅补自建装饰；`preflight: false`；禁止替代 Form / Grid / Table。

## Figma 用法边界

Figma 在本项目中只读：

- 禁止对 Figma 做任何写入或编辑。
- 禁止调用 `use_figma`、`generate_figma_design`、`create_new_file`、`upload_assets`、Code Connect 写入类工具，以及任何会改动稿面、变量、组件库的操作。
- 仅允许只读：`get_design_context`、`get_screenshot`、`get_metadata`、`get_variable_defs` 等。
- 实现方向一律是代码对齐设计稿，不是把代码推回 Figma。

还原边界：

| 场景 | 做法 |
| --- | --- |
| Arco 标准组件 | 结构用 Arco；Figma 只约束交互与视觉细节 |
| 非标准 / 自建组件 | 强制像素级布局，图层数值 + 截图双验证 |

## Figma SVG 资源

从设计稿还原 UI 时，稿面自定义图标优先导入 Figma 导出的 SVG，不手写 path，不用近似第三方图标替代。Arco 标准组件自带图标除外。

规则：

1. 来源：使用 Figma 只读上下文或等价导出的矢量资源，禁止凭记忆手绘 SVG。
2. 落盘：每个图标保存为独立文件，例如 `src/**/assets/icon-*.svg`，再 import 引用；禁止把大段 SVG 内联进 TSX。
3. FSD 归属：
   - 单个 `feature` / `page` / `widget` 使用，放对应切片 `assets/`。
   - 两个及以上切片复用，或壳层 / 全局通用，抽到 `src/shared/assets/`。
   - `shared` 不得依赖 `features` / `pages` 下的资源。
4. 命名：`icon-{场景}-{名称}.svg`；进入 `shared/assets` 的用通用名。
5. 过期 URL：提交仓库的必须是本地文件字节，不是远程 asset 链接。

## 主题色与暗亮色

项目同时支持亮色与暗色。颜色必须对齐 token，禁止在业务样式里写死浅色 hex 或 `rgba(0,0,0,*)`。

权威来源：

- 运行时：`src/app/styles/theme-tokens.less`
- 设计源：`docs/Light.tokens.json`、`docs/Dark.tokens.json`
- 切换：`changeTheme` 和 `body[arco-theme='dark']`
- 品牌阶：`applyThemeColor`

常用映射：

| Figma / 稿面常见值 | Token |
| --- | --- |
| 页面底 `#F7F8FA` | `var(--color-bg-1)` |
| 卡片 / 表格 / 弹层底 `#FFF` | `var(--color-bg-2)` / `var(--color-bg-popup)` |
| 主 / 次 / 弱文案 | `--color-text-1` / `-2` / `-3` |
| 分割线 `rgba(0,0,0,0.08)` | `var(--color-border-2)` |
| 遮罩 `rgba(0,0,0,0.4)` | `var(--color-mask-1)` |
| 填充灰 `#F2F3F5` / `#E5E6EB` | `--color-fill-2` / `-3` |
| 品牌紫 `#635CFF` | `rgb(var(--primary-6))` |
| 品牌浅底 12% | `var(--color-primary-light)` |
| 成功 / 警告 / 危险 | `rgb(var(--success-6))` 等；浅底用 `--color-*-light` |

写法：

- 属性值本体必须是 `var(--...)` 或 `rgb(var(--...))`。
- 优先语义 token，少写暗色分支。
- 新增 Modal / Drawer 遮罩一律使用 `var(--color-mask-1)`。

## Admin OpenAPI 生成物

`src/shared/api/admin/**` 由 `npm run openapi` 从 OpenAPI 生成。

必须遵守：

1. 禁止对 `src/shared/api/admin/**` 做任何手改、格式化、重命名、删注释或改签名。
2. 需要新接口或改契约时，更新 OpenAPI 后运行 `npm run openapi`。
3. 业务直接使用生成函数与 `AdminAPI` 字段名，页面 Form / Table / state 不做字段映射层。
4. 组合调用写在 `features` / `pages`，不要改生成文件。
5. 无 OpenAPI 的整页用 `ApiNotReady`。
6. 手写请求基础设施仅限 `src/shared/api/request.ts` 及其测试。

## 对接接口不改交互

接 OpenAPI / 真实接口时，以 PRD、Figma 与既有页面交互为准，不为迁就后端能力简化 UI。

必须遵守：

1. 禁止因接口缺字段或暂不支持而删除或隐藏筛选条件、工具栏按钮、Tab、批量操作、弹窗步骤等既有交互。
2. 请求体里契约有的字段正常传；契约没有的条件先留在 Form / 控件上，可暂不进 body，待 OpenAPI 补齐再接线。
3. 整页无契约时，用 `ApiNotReady` 占位，仍保留路由与菜单。
4. 字段名跟 `AdminAPI`，Form / Table 不做映射层。

## 严格限定指令边界

每次用户指令只做其明确点名的范围。

必须遵守：

1. 范围以当条指令为准，点名的页面 / 组件 / 文件 / 现象才改。
2. 禁止因“同类问题”“顺手优化”“一并修掉”自行扩面。
3. 发现相关债只在回复中简短列出，等待用户下一条指令。
4. 不借清理名义重构、批量格式化、升级无关依赖或文案。
5. 多文件改动仅限完成该指令所必需的 locale、样式、调用方等最小连带。
