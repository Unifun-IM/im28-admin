---
name: project-rules
description: Shared admin-scaffold project rules for AI agents, covering project-component-first UI, Arco Design, FSD boundaries, theme tokens, OpenAPI generation, and strict task scope.
---

# Project Rules Skill

适用对象：Codex、Claude Code、Cursor，以及其它会读取仓库 Markdown 约定的 AI 编码助手。

本 skill 是本仓库通用工程规则的单一来源。工具私有入口只做薄引用，不复制正文：

- Codex：`AGENTS.md`
- Cursor：`.cursor/rules/ai-code.mdc`
- Claude Code：`.claude/CLAUDE.md`

## UI 实现优先级

组件决策固定遵守以下顺序，具体发现、抽取和 Arco 最佳用法见 `docs/skills/component-usage/SKILL.md`：

1. 组件发现：搜索 `shared/ui`、`widgets`、`features`、当前业务切片的公开组件和业务中散落的相似实现。
2. 已有组件：能够表达需求时直接复用；本次范围内的等价散落实现迁移到该组件。
3. 重复 UI 抽取：没有现成组件但已存在多个相似实现时，先按 FSD 抽取；范围外调用方只提示，不自行批量修改。
4. Arco Design / Arco Design Pro：没有合适组件或可抽取的重复实现时，使用标准组件及 Pro 惯用法。
   - `Form`、`Grid`、`Space`、`Card`、`Table`、`Button`、`Select` 等优先于自建实现。
   - 能用组件和 props 解决的，不用手写布局或 Tailwind 重做。
5. 自建：只有项目组件和 Arco 都无法表达的非标准 UI 才新增小范围自建实现。
   - 无 Arco 等价物的自建 UI，需要按 Figma 图层数值与截图双验证还原。

实现约束：

- 完整可读的 Figma 地址决定页面可见信息、交互和视觉；标准组件仍保留项目组件 / Arco 结构。
- 页面生成时的字段、控件类型、顺序、表格列、详情分组与 Tab 按 `admin-page` 的 Figma > PRD > 生成接口优先级执行。
- 左侧导航和路由按 `admin-page` 的导航专项优先级执行：显式导航结构 / 完整 Figma / PRD 优先于现有配置和接口推导；没有顺序说明时，新增业务菜单放在 `system` 前并保持系统菜单默认末位。
- Figma / PRD 已明确列出的字段、列、Tab 和操作是闭合集合，未出现项默认不展示；低优先级来源只补绑定、枚举、校验和格式，不追加可见项。
- 接口缺失字段仍实现 UI 只允许作为 `admin-page` 定义的完整可读 Figma 专项例外；不得扩展为普通 PRD / API 页面的通用规则。
- 标准组件的状态、反馈、间距观感、色、圆角、字号等用 `use-*` 或组件 props 补齐，不为贴稿拆掉 Arco `Grid` / `Form` / `Table` 等标准结构。
- 普通布局与装饰使用 Tailwind；`preflight: false`；禁止替代 Form / Grid / Table。颜色、公共样式抽取、Tailwind / Less 选型遵守 `docs/skills/css-usage/SKILL.md`。

## FSD 依赖边界

- 基本方向为 `pages -> widgets/features -> entities -> shared`；`app` 和 `src/main.tsx` 负责应用装配。
- widget 可以组合其它 widget，feature 可以复用其它 feature，但只能从目标切片的 `index.ts` 公开入口导入。
- 禁止同层切片深层导入和循环依赖；widget 与 feature 不互相依赖，需要共同能力时下沉到 `entities` / `shared`，需要组合时交给 `pages` / `app`。
- `shared` 保持产品无关，不依赖 `entities` 或更高层；全局状态通过上层参数、配置函数或 Provider 注入 shared 能力。
- `src/app/assets` 是静态 SVG 资产例外，各层可以从 `@app/assets/*` 引用 SVG，但不得引用其它 app 内部模块。

## Figma 与设计稿

Figma 只读、截图对照、非标准组件像素校验、Figma 自定义 SVG 资源等规则已收拢到 `docs/skills/figma-rules/SKILL.md`。

任意任务涉及 Figma 链接、设计稿还原、按稿对齐、像素级验证或 Figma 导出的 SVG 时，先读取 `figma-rules`。生成页面且提供完整可读 Figma 地址时，再按 `docs/skills/admin-page/SKILL.md` 执行信息优先级；页面使用图标时按 `docs/skills/svg-icon-usage/SKILL.md` 决策图标来源和资产归属。

## CSS、主题与样式

项目同时支持亮色与暗色。新增或修改样式时读取 `docs/skills/css-usage/SKILL.md`，按其中规则使用主题 CSS 自定义变量、抽取公共样式，并用 Tailwind CSS 完成普通布局与装饰。

硬性约束：禁止在新增业务样式中写死颜色；保持 Tailwind `preflight: false`；不要用 Tailwind 替代 Arco 标准组件。

## Admin OpenAPI 生成物

API 与 typings 的配置读取、输入源选择、生成命令、只读边界和增量检查统一遵守 `docs/skills/api-generation/SKILL.md`。

硬性约束：`src/shared/api/admin/**` 中的接口函数、索引和 `typings.d.ts` 只能由配置命令生成，禁止任何手改；需要改变接口或类型时修改 OpenAPI 源或生成配置后重新生成。

## 严格限定指令边界

普通任务只做用户明确点名的范围。OpenAPI 完整生成与受影响调用方同步按本节例外执行。

必须遵守：

1. 范围以当条指令为准，点名的页面 / 组件 / 文件 / 现象才改。
2. 禁止因“同类问题”“顺手优化”“一并修掉”自行扩面。
3. 发现相关债只在回复中简短列出，等待用户下一条指令。
4. 不借清理名义重构、批量格式化、升级无关依赖或文案。
5. 多文件改动仅限完成该指令所必需的 locale、样式、调用方等最小连带。

OpenAPI 工作流的范围例外：

- 生成目录、索引和 typings 保留 `npm run openapi` 产生的完整确定性差异，不按点名页面裁剪。
- 有具体 PRD、完整可读 Figma 或明确点名页面 / 路由 / 接口 / 文件时，业务代码只同步该目标及必要直接依赖。
- 没有这些明确目标时，遵循现有路由和 API 调用关系，同步接口变化直接影响的现有代码。
- 没有调用方的新增接口，只有在能够明确识别为可独立落页的新业务能力时才生成页面；辅助、动作、上传、详情或记录接口不单独创建路由页面。
- 该例外不授权修改无调用关系的页面、同类问题或无关工程债。
