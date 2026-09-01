---
name: svg-icon-usage
description: Organize static image assets under src/assets, choose or generate SVG icons, and complete semantic navigation icon wiring when a required icon is missing.
---

# Static Image And SVG Icon Usage

处理图片静态资源、图标或 SVG 时使用本 skill；资源来自 Figma 时同时读取 `figma-rules`。

## 先发现再选择

先搜索源码中的全部图片，避免重复资产和历史散落目录：

```bash
rg --files src | rg '\.(svg|png|jpe?g|gif|webp|avif|ico)$'
```

图标来源按以下顺序决定：

1. Figma 明确的自定义或品牌视觉：复用视觉一致的本地图标；没有时落地 Figma 导出 SVG。
2. 没有定制要求的标准动作：使用 `@arco-design/web-react/icon` 或项目组件内置图标。
3. Arco 无法表达：复用语义和视觉都匹配的本地图标。

照片、复杂纹理等使用合适的位图格式；图标、Logo 和可缩放简单图形优先 SVG。不要为同一语义重复资产，不用近似图标替代 Figma 定制图标，也不要凭记忆临摹 Figma、品牌或第三方图标 path。需求允许自行设计且现有来源均无法表达时，可以根据业务语义生成原创 SVG；优先使用清晰的几何结构，保持与项目现有图标一致的视觉重量。

## 统一目录

所有由源码导入的图片静态资源统一放在 `src/assets`，禁止散落到 `app`、`pages`、`widgets`、`features`、`entities` 或 `shared`：

```text
src/assets/
  icon/           # 全局所有图标，不区分调用层和使用次数
  common/         # 应用壳或多个页面复用的 Logo、空态、插画、背景
  <route-key>/    # 单页面资源；嵌套路由按 key 继续分目录
```

归属判断：

- 视觉职责是图标：放 `src/assets/icon`，包括 SVG 和必要的位图图标。
- 应用壳使用或被多个页面复用：放 `src/assets/common`。
- 只属于一个页面：放 `src/assets/<route-key>`，例如登录页放 `src/assets/login`，`users/query` 页面放 `src/assets/users/query`。
- 页面资源形成稳定跨页面复用后迁入 `common`；不要复制到多个页面目录。

`src/assets` 是静态资源根目录，不是 FSD 业务层。各层可以导入图片文件，但不能借此引用其它层的代码。`public` 只用于必须保持固定公开 URL、不能经过 Vite 构建导入的文件，不作为普通页面资源目录。

## 命名与引用

文件名使用语义化英文和 kebab-case，禁止拼音、接口路径碎片、Figma 自动编号和无意义缩写：

- `icon-copy.svg`
- `icon-risk-control.svg`
- `empty-state.svg`
- `login-banner-bg.svg`

统一通过 `@assets/*` 引用，不使用跨层相对路径：

```tsx
import IconRiskControl from '@assets/icon/icon-risk-control.svg?react';
import emptyState from '@assets/common/empty-state.svg';
import loginBanner from '@assets/login/login-banner-bg.svg';
```

- 需要 React 组件能力的 SVG 使用 `?react`；作为 `img`、背景或 URL 时使用普通导入。
- 不把完整 SVG path 内联到 TSX，不提交远程 asset URL 或大段 base64。
- 单色操作图标优先 `currentColor`，由 class 和主题 token 控制颜色与尺寸。
- 品牌、多色插画保留原色，并验证浅色、暗色背景下的可见性。
- `<img>` 或 CSS 背景加载的 SVG 不会继承宿主页面变量。多色插画明确需要跟随主题时，使用 `?react` 内联，并让 SVG 的语义色读取由宿主 class 提供的局部 CSS 变量；SVG 内保留原始颜色作为回退，不把纹理、遮罩和明暗结构机械主题化。

## 菜单图标

一级菜单必须有可识别图标，不能以 `icon-empty`、文字首字母或无业务含义的通用占位结束。二级及更深菜单沿用当前侧栏层级样式，不重复添加图标，除非 Figma 或当前需求明确要求。

按以下顺序确定一级菜单 SVG：

1. Figma 明确提供时，使用对应导出资源。
2. 搜索 `src/assets/icon` 和 `getIconFromKey`；已有图标同时匹配业务语义和侧栏视觉时复用。
3. 缺少匹配资源时，结合用户导航树、PRD / `PROJECT.md` 中的模块职责、route key 和页面核心对象，提炼一个稳定业务概念并生成原创 SVG。不要从接口路径碎片、临时页面动作或中文首字形状推导图标。

生成图形应表达一级模块而非某个叶子动作，例如用户模块表达“用户 / 身份”，群组模块表达“多人 / 群组”，会话模块表达“消息 / 对话”，风控模块表达“防护 / 风险”。相邻一级菜单必须轮廓可区分；不要仅通过细小附加符号制造差异。

生成与接入闭环：

1. 放入 `src/assets/icon/icon-<menu-key>.svg`。
2. 默认使用 `width="16" height="16" viewBox="0 0 16 16"`，图形在 viewBox 内视觉居中并保留合理安全边距；线宽、圆角、填充比例和复杂度对齐 `icon-dashboard.svg`、`icon-system.svg` 等现有侧栏图标。
3. 单色图形使用 `currentColor`，不写死选中、悬停或暗色主题颜色；需要描边时同时设置合适的 `stroke-linecap` / `stroke-linejoin`，避免缩放后毛刺和断裂。
4. 在 `src/widgets/admin-shell/PageLayout.tsx` 通过 `@assets/icon/...svg?react` 导入，并在 `getIconFromKey` 按一级 route key 注册。
5. 保持侧栏现有 `.icon` 尺寸和状态样式，不在业务路由或页面里再包一套颜色、宽高逻辑。

生成 SVG 后必须查看实际渲染，不以 XML 合法或 build 通过代替视觉验收。至少检查展开侧栏、折叠侧栏的 40px 入口、默认 / hover / selected、浅色 / 暗色，以及与相邻图标的尺寸、基线、密度和辨识度；图形不得裁切、偏心、糊成色块或在 `currentColor` 切换时消失。

## 迁移与验收

- 发现 `src/assets` 外的图片时，将资产和本次涉及的全部引用一起迁移；不保留旧副本或旧别名。
- 检查 `rg -n 'src/app/assets|@app/assets|pages/.*/assets' src docs -g '!docs/skills/svg-icon-usage/SKILL.md'` 无遗留结果。
- 检查图标全部位于 `src/assets/icon`，跨页面资源位于 `common`，其余目录能对应页面 route key。
- 检查文件名、`@assets` import、`currentColor` 和暗色可见性。
- 检查每个可见一级 route key 都能在 `getIconFromKey` 得到真实 SVG，没有落入空占位；新增图标已完成展开 / 折叠和主题状态视觉验证。
- 运行 typecheck、相关测试和 build，确认 Vite 与 SVGR 均能解析新路径。
