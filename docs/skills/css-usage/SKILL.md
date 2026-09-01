---
name: css-usage
description: Style admin UI with project theme variables, Tailwind for ordinary layout, scoped Less for complex selectors, and shared semantic styles for repeated Arco patterns.
---

# CSS Usage

只定义“样式如何实现”；视觉层级、尺度与响应式结果由 `design-system` 定义。只约束本次新增或修改的样式；除非用户点名，不批量清理历史样式。

## 决策顺序

1. 复用项目组件、Tailwind 类、`use-*` 样式和局部样式。
2. 标准 UI 使用 Arco 组件和 props。
3. 所有颜色使用主题 CSS 变量。
4. 稳定重复视觉先抽公共组件或语义化公共样式。
5. 普通布局与装饰使用 Tailwind。
6. 深层 Arco 选择器、portal、伪元素、关键帧和复杂图层才使用 Less。

Tailwind 不替代 Arco Form、Grid、Table、Button、Select。

## 设计 Token

权威来源：

- 运行时：`src/app/styles/theme-tokens.less`
- 设计 token：`docs/theme/Light.tokens.json`、`docs/theme/Dark.tokens.json`
- Tailwind 映射：`tailwind.config.js`

`theme-tokens.less` 同时维护两类变量：

- `:root` 中主题无关的排版、形状、层级和动效 token。
- `body` / `body[arco-theme='dark']` 中随主题变化的颜色 token。

新增或修改样式时先使用已有语义：

| 类别 | 语义变量 |
| --- | --- |
| 字体 | `--font-family-body` |
| 字号 | `--font-size-caption`、`--font-size-body`、`--font-size-title`、`--font-size-page-title` |
| 行高 | 与字号角色对应的 `--line-height-*`；紧凑正文 / 辅助文案使用对应 `-compact` |
| 圆角 | `--radius-compact`、`--radius-control`、`--radius-surface`、`--radius-overlay`、`--radius-full` |
| 阴影 | `--shadow-popup`、`--shadow-overlay`、`--shadow-sticky` |
| 动效 | `--motion-duration-*` 与 `--motion-ease-*` |

Arco 的 `--border-radius-*` 是上述圆角 token 的兼容别名；Tailwind 的字体、圆角、阴影和动效扩展必须映射同一来源，不能再维护平行数值。

### 抽取边界

- 字号与行高按语义角色成对使用。正文、辅助文案和标题使用 token；图标尺寸、控件高度对齐行高和特殊数字展示可以保留局部值。
- 4 / 8 / 12px 的通用紧凑元素、控件 / 业务面和浮层圆角使用 token；`0`、`50%`、复合方向圆角及明确的特殊造型保持局部。
- 只有跨组件稳定复用的浮层、弹层和 sticky 层级抽阴影 token；品牌按钮、插画和单页特效阴影留在所属组件。
- 颜色透明度属于颜色语义，写入对应 `--color-*`；`opacity: 0/1`、拖拽态、显隐态和只出现一次的状态透明度不抽成全局变量。
- 多处共享的 Hover、状态切换、布局和主题切换时长 / easing 使用动效 token；关键帧、弹簧参数和业务编排动画保持局部，并支持 `prefers-reduced-motion`。
- 只有能表达稳定设计决策的值才新增 token。不得为消除一次硬编码创建 `--value-*`、`--size-12` 或组件名伪语义变量。

## 主题颜色

常用语义：

| 语义 | Tailwind / CSS |
| --- | --- |
| 页面、卡片、弹层 | `bg-arco-bg-1` / `bg-arco-bg-2` / `var(--color-bg-*)` |
| 填充、Hover | `bg-arco-fill-1` / `bg-arco-fill-2` |
| 文案 | `text-arco-text-1` / `-2` / `-3` |
| 边框 | `border-arco-border-1` / `-2` |
| 品牌色 | `text-primary` / `bg-primary` / `rgb(var(--primary-6))` |
| 状态 | `text-arco-success` / `warning` / `danger` |

- 禁止新增固定 hex、`rgba(0, 0, 0, *)`、`text-white` 或仅适用于浅色的颜色。
- RGB 三元组变量必须包在 `rgb()` / `rgba()` 中。
- 缺少语义变量时同时定义浅色和暗色值；多处使用再映射 Tailwind。
- 不复制一套暗色组件样式，让同一语义变量自动切换。

## 样式归属

| 场景 | 位置 |
| --- | --- |
| 普通页面布局 / 装饰 | JSX 中 Tailwind |
| widget / feature 复杂样式 | 切片局部 Less |
| 跨页面 Arco 修饰、portal、基础设施 | `src/app/styles/global.less` 的语义化 `use-*` |
| 业务无关基础 UI | `src/shared/ui` |
| 跨页面复合 UI | `src/widgets` |
| 用户动作流程 | `src/features` |

不要因 class 偶然相同抽象；不要在 global.less 放单业务页面样式；不要用 `@apply` 建立平行工具类体系。

## Tailwind 与 Less

Tailwind：

- 保持 `preflight: false`。
- 用于 flex / grid、间距、尺寸、定位、排版、响应式和简单状态。
- 响应式断点和目标行为遵循 `design-system`，不新增语义近似的任意断点。
- 类名必须静态可扫描；条件样式使用显式映射和 `classnames`。
- Figma 精确尺寸可用任意值，颜色仍必须引用主题变量。
- 样式入口顺序保持 `arco.css -> tailwind.css -> global.less`。

Less：

- 仅用于 Tailwind 难表达的 Arco 内部结构、portal、伪元素、复杂状态和动画。
- 必须挂在语义化根类下并使用主题变量，避免无边界全局覆盖。

## 已有语义样式

- 详情表格：`@shared/ui/biz-detail-table.less` + `use-biz-detail-table`
- 标准表单 Modal：`@shared/ui/biz-form-modal.less` + `use-biz-form-modal`

具体组件契约见 `component-usage`，业务页不要复制这些壳层样式。

## 响应式弹层

- Arco Modal 的桌面宽度可以由组件 `style.width` 表达；`md` 及以下统一由 `global.less` 通过 `max-width` 限制在视口安全边距内，不能用 `width: 100%` 把原本较窄的确认弹层反向拉宽。业务样式不得再次写平行的移动端宽度补丁。
- 自定义复合 Modal 若使用桌面固定高度，移动端必须根据流程选择内容自适应或近全屏，不能直接继承桌面高度。可滚动内容放在唯一内容区，Header / Footer 保持可达。
- Modal 内 `width: 100%` 的 flex / grid 子项同时设置 `box-sizing: border-box`、`min-width: 0` 和 `max-width: 100%`；padding 必须包含在父内容宽度内，禁止依靠外层 `overflow: hidden` 掩盖越界。

## 验收

- 颜色是否全部来自主题变量并适配暗色。
- 是否先复用组件和语义样式，再新增 CSS。
- Tailwind / Less 职责是否正确，类名是否可静态扫描。
- 公共样式是否有稳定语义和正确 FSD 归属。
- 浏览器是否检查关键视口、主题、Hover / Active、弹层和滚动状态。
- 响应式结果是否满足 `design-system`，公共组件问题是否在公共层修复。
