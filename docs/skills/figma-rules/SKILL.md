---
name: figma-rules
description: Apply this repo's Figma-only-read workflow for design-to-code alignment, pixel verification of non-standard components, and Figma-sourced SVG asset handling.
---

# Figma Rules Skill

本 skill 收拢本仓库所有 Figma 相关规则。涉及 Figma 设计稿、截图对照、图层数值、设计 token、Figma 自定义 SVG、像素级还原时先读本文件。

## 使用边界

Figma 在本项目中只读：

- 禁止对 Figma 做任何写入或编辑。
- 禁止调用 `use_figma`、`generate_figma_design`、`create_new_file`、`upload_assets`、Code Connect 写入类工具，以及任何会改动稿面、变量、组件库的操作。
- 仅允许只读：`get_design_context`、`get_screenshot`、`get_metadata`、`get_variable_defs` 等。
- 实现方向一律是代码对齐设计稿，不是把代码推回 Figma。

## 还原优先级

| 场景 | 做法 |
| --- | --- |
| 组件发现 | 先搜索公开组件和业务中散落的相似实现 |
| 项目已有组件 | 优先复用实现；字段、内容、顺序和允许的 props / 状态按 Figma |
| 重复 UI | 没有现成组件但已有多个相似实现时，先按 FSD 抽取 |
| Arco 标准组件 | 结构用 Arco；页面字段与交互按 Figma，视觉差通过 props / token 补齐 |
| Arco 标准组件的视觉差 | 用组件 props、`use-*` class、theme token 补齐 |
| 非标准 / 自建组件 | 强制像素级布局，图层数值 + 截图双验证 |
| Tailwind | 按 `css-usage` 实现布局与装饰，不替代 Arco `Form` / `Grid` / `Table` |

组件选择继续遵守“组件发现 → 已有组件 → 重复 UI 抽取 → Arco → 自建”。不要为了贴稿绕过项目已有组件或重复 UI 抽取，也不要拆掉 Arco `Form`、`Grid`、`Table`、`Select` 等标准结构。

## 设计读取

读取 Figma 时重点提取：

- 组件层级、状态、交互入口。
- 间距、尺寸、圆角、字号、字重、颜色 token。
- 非标准组件的绝对尺寸、对齐方式、图层关系。
- 自定义图标、插画、品牌资产是否为 Figma 专属 SVG。

生成后台页面时，如果用户提供能够定位目标文件和页面 / Frame / 节点的完整可读 Figma 地址，Figma 是页面信息的最高优先级，搜索字段、控件类型、表格列、详情字段、分组、Tab、操作入口和展示顺序均以设计稿为准。具体 Figma > PRD > 生成接口的补充顺序和数据契约边界按 `docs/skills/admin-page/SKILL.md` 执行。

完整目标 Frame 已展示的筛选、列、详情字段、Tab 和操作入口是闭合集合，未出现项视为明确不展示。只有整个视图 / 区域未提供或设计稿明确标注待补时，才允许 PRD / 接口定义该区域；低优先级来源不得向已有集合追加可见项。

设计稿明确字段缺少接口契约时，只能使用 `admin-page` 中定义的完整 Figma 专项例外；该例外不得用于普通 PRD / API 页面，不恢复“接口不支持仍保留 UI”的全局规则。

如果任务只是普通页面生成且没有完整可读的 Figma 地址，以 PRD 和生成接口规则为准，不臆造设计稿细节。完整地址无法读取时必须明确说明，不得假装已读取设计内容。

## 像素校验

需要像素级验证的场景：

- 无 Arco 对应物的自建 UI。
- Figma 有明确特殊造型、异形边、品牌视觉或复杂层级。
- 用户明确要求“按稿”“像素级”“还原 Figma”。

验证方式：

- 对照 Figma 图层数值实现尺寸、间距、圆角、层级。
- 使用截图对照检查桌面和移动端关键视口。
- 标准组件只校验视觉差和交互状态，不为像素级还原破坏组件语义。

## Figma SVG 资源

从设计稿还原 UI 时，稿面明确指定的自定义图标、品牌视觉或特殊造型覆盖 Arco icon 的默认优先级，必须使用 Figma 导出的 SVG，不手写 path，不用近似第三方图标替代。Arco 标准组件自带且设计稿未要求替换的图标保留组件默认实现。

图标来源、资产归属、命名、引用方式按 `docs/skills/svg-icon-usage/SKILL.md` 执行。

核心约束：

- 每个图标保存为 `src/app/assets/icon-*.svg` 下的独立本地文件。
- 禁止把大段 SVG 内联进 TSX。
- 所有 icon SVG 无论由几个切片使用，都统一放到 `src/app/assets/`。
- 页面私有的背景、插画、Logo 等非 icon SVG 可以与消费者共置；形成通用语义后迁入 `src/app/assets/`。
- `src/app/assets` 只存静态 SVG 资产；各层可以引用这些资产，但不得借此依赖 `app` 下的代码模块。
- 提交仓库的必须是本地文件字节，不是远程 asset 链接。

## 主题与 Token

Figma token 对应代码时，以 `docs/theme/Light.tokens.json`、`docs/theme/Dark.tokens.json` 和 `src/app/styles/theme-tokens.less` 为准。

CSS 变量、公共样式抽取及 Tailwind / Less 选型按 `docs/skills/css-usage/SKILL.md` 执行。

落地规则：

- 颜色优先使用 Arco / 项目语义 token，如 `var(--color-bg-1)`、`var(--color-text-1)`、`rgb(var(--primary-6))`。
- 不在业务样式里写死浅色 hex 或 `rgba(0,0,0,*)`。
- 新增 Modal / Drawer 遮罩使用 `var(--color-mask-1)`。
- 暗色模式下检查 Figma 视觉差；优先通过 token 自动适配。

## 不要做

- 不写入 Figma。
- 不把代码同步回 Figma。
- 不用 Figma 视觉要求替代 Arco 标准组件结构。
- 不凭记忆重画 SVG。
- 不把 Figma 远程 asset URL 当作最终资源。
- 不跨出用户本次点名范围批量修同类 Figma 差异。
