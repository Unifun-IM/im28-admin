---
name: animation-usage
description: Design and implement purposeful UI motion, route transitions, state feedback, and reduced-motion behavior using project tokens and existing component animation.
---

# Animation Usage

只负责判断“何时需要动效、如何实现和验证”。视觉方向由 `DESIGN.md` 与 `design-system` 决定，CSS 写法与 token 归 `css-usage`。

## 决策顺序

1. 明确的 Figma 动效或当前需求。
2. Arco 或项目组件已有的进入、退出和状态动效。
3. 使用项目 `--motion-duration-*`、`--motion-ease-*` 的 CSS transition / keyframes。
4. 只有连续编排、手势跟随或需要取消控制时才使用 Web Animations / JavaScript。
5. 只有复杂动效形成稳定、重复需求且现有能力不足时才评估新增依赖。

动效必须表达状态变化、操作反馈、层级关系或空间连续性；纯装饰不能干扰读取和连续操作。

## 场景规则

- 路由页面的进入动效由公共 shell 统一承载，业务页面不重复实现。高信息密度后台使用 `--motion-duration-page-enter` 的分段纯 opacity 淡入，前段明确表达页面已切换、后段快速收敛；不移动或缩放整个页面，也不叠加退出动画。效果不足时优先调整 opacity 节奏和专用时长，禁止重新引入整页 translate / scale；刷新数据使用 Loading / Skeleton，不重播页面入场。
- Drawer、Modal、Dropdown、Tooltip 等优先使用 Arco 自带动效。弹层内部内容不得再整体播放一次进入动画。
- Hover、选中、展开和布局变化优先使用 transition；复杂关键帧留在所属组件，不为一次效果新增全局 token。
- 普通状态反馈优先动画 opacity；只有方向、层级或空间关系对理解交互确有帮助时才动画局部元素的 transform。仅当真实布局变化需要空间连续性时才动画尺寸或位置属性，并检查重排成本。
- 不对每张卡片、每行表格或每个表单项做级联入场；后台高频操作以稳定、快速、可扫描为先。
- 动效不得延迟可点击、焦点、错误提示或加载状态，不得改变键盘与触控流程。移动端保持同一信息反馈，可适当缩短位移和时长。

## 减少动态效果

- 新增动效必须在 `prefers-reduced-motion: reduce` 下停止或降为近乎即时的状态切换。
- 公共 reduced-motion 规则放在全局样式，组件仍需确保关闭动画后最终状态、焦点和可见性正确。
- 主题 View Transition、滚动行为和第三方组件动效也必须响应该偏好。

## 验收

- 检查桌面与移动端、明暗主题、快速连续操作、浏览器前进后退和全屏状态。
- 页面切换只在路由变化时触发，不因列表刷新、筛选或局部请求重复播放。
- Drawer / Modal 的打开关闭没有嵌套动画、闪烁或内容延迟。
- 在系统减少动态效果设置下验证无明显位移、缩放或长时过渡。
- 动画期间不出现横向滚动、布局跳动、焦点丢失或操作阻塞。
