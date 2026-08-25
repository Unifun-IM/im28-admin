---
name: figma-rules
description: Read Figma designs without modifying them, extract implementation evidence, and verify design-to-code fidelity for admin UI.
---

# Figma Rules

## 只读边界

Figma 在本项目中只读。允许读取设计上下文、截图、metadata 和变量；禁止创建、编辑、上传、Code Connect 写入或任何改变稿面、变量、组件库的操作。实现方向始终是代码对齐 Figma。

完整地址不可读时必须说明，不得假装读取，也不得把截图或 PRD 描述成同等可读的 Figma Frame。

## 页面定义

完整可读 Figma 是页面可见信息的最高优先级；具体 Figma > PRD > 生成接口顺序和闭合集合规则见 `admin-page`。

- 提取字段、顺序、状态、交互、组件层级和响应式行为。
- 提取尺寸、间距、圆角、字号、字重和颜色 token。
- Figma 明确的筛选、列、详情、Tab 和操作是闭合集合。
- 标准结构仍使用项目组件和 Arco，不为贴稿拆掉 Form / Grid / Table。
- 设计字段缺少接口时，只能使用 `admin-page` 定义的 Figma 专项例外。

## 视觉验证

无 Arco 对应物的自建 UI、特殊造型、品牌视觉或用户明确要求像素级时：

1. 按图层数值实现尺寸、间距、层级和状态。
2. 使用截图对照目标桌面和移动视口。
3. 检查文字截断、重叠、滚动、弹层、Hover / Active 和暗色。
4. 标准组件只补视觉差，不破坏语义与交互。

## Token 与资源

- 代码 token：`src/app/styles/theme-tokens.less`
- 设计 token：`docs/theme/Light.tokens.json`、`docs/theme/Dark.tokens.json`
- CSS 落地：`css-usage`
- 图标与 SVG：`svg-icon-usage`

Figma 明确的自定义图标、品牌图标或特殊视觉必须使用对应本地 SVG，不用近似 Arco / 第三方图标，不手写 path，不保留远程 asset URL。

## 验收

- 全程是否只读 Figma。
- 实现是否基于真实读取结果，而非记忆或猜测。
- 可见集合、顺序、状态和布局是否与目标 Frame 一致。
- 非标准 UI 是否完成图层数值和截图双验证。
- token、SVG 与暗色是否按专项 skill 落地。
