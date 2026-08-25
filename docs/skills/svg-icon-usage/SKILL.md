---
name: svg-icon-usage
description: Choose Arco icons or local SVG assets, keep all icon SVGs and common SVGs in src/app/assets, and use semantic names and imports.
---

# SVG Icon Usage

来自 Figma 的图标先读 `figma-rules`。

## 先发现再选择

搜索整个源码，避免漏掉历史散落资产：

```bash
rg --files src | rg '\.svg$'
```

决策顺序：

1. Figma 明确自定义 / 品牌视觉：复用视觉一致的本地 SVG；没有时落地 Figma 导出 SVG。
2. 没有定制要求的标准动作：使用 `@arco-design/web-react/icon` 或项目组件内置图标。
3. Arco 无法表达：复用语义和视觉都匹配的本地 SVG。
4. 照片、复杂纹理等不适合矢量的内容才使用位图。

不要为同一语义和视觉重复资产，不用近似图标替代 Figma 定制图标，不凭记忆手写 SVG path。

## 资产归属

- 所有 icon SVG：`src/app/assets/icon-*.svg`，无论只被一个页面还是多个切片使用。
- 通用 Logo、空态和通用插画：`src/app/assets/*.svg`。
- 页面 / feature / widget 私有的非 icon 背景、插画、Logo：可与消费者共置；形成稳定通用语义后迁入 `src/app/assets`。
- `src/shared/assets` 不保存通用 SVG。

`src/app/assets` 是静态资产的 FSD 例外：各层可引用 `@app/assets/*`，不得引用其它 app 代码。

发现历史散落 icon SVG 时，复用前迁入 `src/app/assets` 并更新本次范围内调用方；范围外调用方只报告。

## 命名与引用

文件名使用语义化英文并全局唯一：

- 动作：`icon-copy.svg`
- 菜单：`icon-risk-control.svg`
- 状态：`icon-warning-fill.svg`
- 业务：`icon-user-group.svg`

禁止拼音、接口路径碎片和 Figma 自动无意义名称。

React 图标：

```tsx
import IconRiskControl from '@app/assets/icon-risk-control.svg?react';
```

图片 / 背景：

```tsx
import emptyState from '@app/assets/empty-state.svg';
```

- 不把完整 SVG 内联 TSX，不提交远程 asset URL。
- 单色操作图标优先 `currentColor`，由 class / token 控制颜色和尺寸。
- 品牌、多色插画保留原色；暗色需要验证可见性。

## 菜单图标

新增一级菜单图标：

1. 放入 `src/app/assets/icon-<menu-key>.svg`。
2. 在 `src/widgets/admin-shell/PageLayout.tsx` 以 `?react` 导入。
3. 在 `getIconFromKey` 按 route key 注册。
4. 复用现有侧栏 icon 样式。

## 验收

- 是否先搜索整个 `src` 并避免重复资产。
- 来源是否符合 Figma 定制 > Arco 标准动作 > 本地 SVG。
- 所有 icon SVG 与通用 SVG 是否位于 `src/app/assets`。
- 命名、import、currentColor 和暗色是否正确。
- 是否没有内联 path、远程 URL 或第二套图标库。
