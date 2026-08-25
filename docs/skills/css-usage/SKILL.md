---
name: css-usage
description: "Apply styling when generating or changing admin UI in this repo: use theme CSS custom properties for colors, reuse or extract common styles, use Tailwind CSS for remaining layout and decoration, and reserve Less for cases utilities cannot express cleanly."
---

# CSS Usage Skill

本 skill 用于新增或调整页面、组件和壳层样式。目标是让生成代码自动适配浅色 / 暗色主题，优先复用公共能力，并保持 Arco Design 与 Tailwind CSS 的职责清晰。

只约束本次新增或修改到的样式；除非用户明确要求，不批量清理历史硬编码颜色或旧 Less。

## 样式决策顺序

1. 先搜索并复用项目内已有组件、Tailwind 类、`use-*` 修饰类和局部样式。
2. 项目没有合适组件时，标准表单、筛选、表格、按钮、弹层等使用 Arco Design 组件和 props。
3. 所有颜色使用 `src/app/styles/theme-tokens.less` 中的 CSS 自定义变量。
4. 稳定且跨页面重复的视觉模式先抽成公共组件或公共样式。
5. 剩余的布局、尺寸、间距、排版和简单装饰使用 Tailwind CSS。
6. 只有 Tailwind 难以清晰表达的深层 Arco 选择器、portal、伪元素、关键帧或复杂造型才使用 Less。

不要用 Tailwind 重做 Arco `Form`、`Grid`、`Table`、`Button`、`Select` 等标准组件。

## 颜色与主题变量

权威来源：

- 运行时语义变量：`src/app/styles/theme-tokens.less`
- 设计 token：`docs/theme/Light.tokens.json`、`docs/theme/Dark.tokens.json`
- Tailwind 颜色映射：`tailwind.config.js`
- 主题切换：`changeTheme`、`body[arco-theme='dark']`
- 品牌色阶：`applyThemeColor`

新增样式禁止写死 `#fff`、`#000`、业务色 hex、`rgba(0, 0, 0, *)` 或仅适用于亮色的 Tailwind 内置色。优先使用 Tailwind 中已映射到 CSS 变量的语义类：

| 语义 | Tailwind | 原始 CSS |
| --- | --- | --- |
| 页面 / 卡片 / 弹层背景 | `bg-arco-bg-1` / `bg-arco-bg-2` / `bg-arco-bg-popup` | `var(--color-bg-*)` |
| 常规填充 / Hover | `bg-arco-fill-1` / `bg-arco-fill-2` | `var(--color-fill-*)` |
| 主 / 次 / 弱文案 | `text-arco-text-1` / `-2` / `-3` | `var(--color-text-*)` |
| 边框 | `border-arco-border-1` / `-2` | `var(--color-border-*)` |
| 品牌色 | `text-primary` / `bg-primary` | `rgb(var(--primary-6))` |
| 成功 / 警告 / 危险 | `text-arco-success` / `text-arco-warning` / `text-arco-danger` | `rgb(var(--*-6))` |

规则：

- Tailwind 已有语义别名时使用别名，不重复写 `text-[var(--...)]`。
- 没有别名的一次性颜色可使用任意值语法，例如 `bg-[var(--color-primary-light)]`。
- RGB 三元组变量必须包在 `rgb()` / `rgba()` 中，例如 `rgb(var(--primary-6))`。
- 新增代码不在 `var()` 内附加硬编码 fallback；主题变量由全局入口保证加载。
- 缺少语义变量时，在 `theme-tokens.less` 同时定义亮色和暗色值；多处使用时再映射到 `tailwind.config.js`。
- 不为暗色模式复制整套组件样式；优先让同一个语义变量自动切换。

## 公共样式抽取

写样式前先用 `rg` 搜索现有组件名、`use-*` 类和相同视觉模式。

| 情况 | 放置位置 |
| --- | --- |
| 无业务语义的可复用基础展示或交互 | `src/shared/ui` |
| 某个用户动作或业务流程 | `src/features` |
| 跨页面复用的复合业务 UI | `src/widgets` |
| 跨页面的 Arco 视觉修饰 | `src/app/styles/global.less` 中语义化 `use-*` 类 |
| portal、基础设施、Arco 兼容补丁 | `src/app/styles/global.less` |
| 单个 widget / feature 的复杂样式 | 对应切片内的局部 `.less` |
| 普通页面布局与一次性装饰 | 组件 JSX 中的 Tailwind 类 |

抽取边界：

- 复用应有稳定语义，不因为两段 class 偶然相似就建立抽象。
- 公共样式命名表达用途，例如 `use-biz-detail-table`，不要创建 `common-box-1` 一类无语义名称。
- 可通过组件 props 或公共组件解决时，不追加新的全局选择器。
- `global.less` 不承载只服务于某个具体业务页面的样式。跨页面公共组件使用的语义化 `use-*` 修饰类属于共享组件样式，例如 `use-biz-detail-table`，可以放入 `global.less`。
- 不使用 `@apply` 复制一套平行于 Tailwind 的工具类；重复布局优先抽组件或 class 常量。

### 详情 / Modal 内表格圆角（`use-biz-detail-table`）

Drawer、Modal 内的关联列表或记录表格不要依赖 Arco 默认「仅表头顶角圆角」。统一使用：

- 样式：`src/shared/ui/biz-detail-table.less`
- 用法：先 `import '@shared/ui/biz-detail-table.less'`，再给 `Table` 加 `className="use-biz-detail-table"`
- 效果：`.arco-table-container` 外框 `border + border-radius: 8px + overflow: hidden`，**上下圆角一致**；分页在圆角框外

禁止在业务页再复制一份局部圆角 / 网格线样式。

### 标准表单 Modal 壳（`use-biz-form-modal`）

账号 / 角色 / 白名单等标准表单弹窗：

- 样式：`src/shared/ui/biz-form-modal.less`
- 用法：`import '@shared/ui/biz-form-modal.less'` + `className="use-biz-form-modal"`；成功态加 `is-success`
- 业务差异用额外 class 做小范围覆盖，不复制整份 header/footer/圆角壳

## Tailwind CSS 使用

- 保持 `tailwind.config.js` 的 `preflight: false`，避免覆盖 Arco 基础样式。
- 普通 `flex` / `grid`、间距、尺寸、定位、文字排版、响应式和简单状态优先 Tailwind。
- 条件类使用现有 `classnames` / `cs` 组合。
- 类名必须是静态可扫描字符串；不要用 `` `text-${tone}` `` 等动态拼接。使用显式映射表。
- 精确 Figma 数值可用任意值语法，如 `w-[240px]`、`gap-[12px]`；常规值优先现成尺度。
- 任意颜色值仍必须引用主题变量，不写 `bg-[#...]`、`text-white` 等固定颜色。
- 样式入口顺序保持 `arco.css -> tailwind.css -> global.less`。

推荐：

```tsx
<section className="flex min-w-0 flex-col gap-4 rounded-lg bg-arco-bg-2 p-4 text-arco-text-1">
  <span className="text-sm text-arco-text-3">...</span>
</section>
```

条件色使用显式映射：

```ts
const toneClass = {
  success: 'text-arco-success',
  warning: 'text-arco-warning',
  danger: 'text-arco-danger'
};
```

## Less 使用边界

下列情况可以使用 Less：

- 覆盖 Arco 内部 DOM，需要嵌套选择器或 `!important`。
- portal 挂载到组件树外，Tailwind 类无法直接落到目标节点。
- `::before` / `::after`、复杂状态组合、关键帧、View Transition。
- 非标准组件存在 Tailwind 难以维护的复杂图层关系。

新增 Less 仍必须使用主题 CSS 变量，并限制在语义化根类下，避免无边界覆盖全局 DOM。

## 生成页面检查

- 标准结构是否先复用项目组件，再使用 Arco 标准组件。
- 新增颜色是否全部来自 CSS 主题变量，并能自动适配暗色。
- 是否搜索并复用了现有公共组件、Tailwind 别名和 `use-*` 类。
- 可复用模式是否放在正确 FSD 层级，而不是复制进页面。
- 普通布局是否使用 Tailwind，新增 Less 是否确有必要。
- 是否保持 `preflight: false`，且没有动态拼接 Tailwind 类名。
