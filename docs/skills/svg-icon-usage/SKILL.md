---
name: svg-icon-usage
description: Organize static image assets under src/assets, choose Arco or local SVG icons, and place icons, shared images, and page-owned images in the correct directories.
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

照片、复杂纹理等使用合适的位图格式；图标、Logo 和可缩放简单图形优先 SVG。不要为同一语义重复资产，不用近似图标替代 Figma 定制图标，不凭记忆手写 SVG path。

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

## 菜单图标

新增一级菜单图标：

1. 放入 `src/assets/icon/icon-<menu-key>.svg`。
2. 在 `src/widgets/admin-shell/PageLayout.tsx` 通过 `@assets/icon/...svg?react` 导入。
3. 在 `getIconFromKey` 按 route key 注册。
4. 复用现有侧栏图标尺寸和颜色样式。

## 迁移与验收

- 发现 `src/assets` 外的图片时，将资产和本次涉及的全部引用一起迁移；不保留旧副本或旧别名。
- 检查 `rg -n 'src/app/assets|@app/assets|pages/.*/assets' src docs` 无遗留结果。
- 检查图标全部位于 `src/assets/icon`，跨页面资源位于 `common`，其余目录能对应页面 route key。
- 检查文件名、`@assets` import、`currentColor` 和暗色可见性。
- 运行 typecheck、相关测试和 build，确认 Vite 与 SVGR 均能解析新路径。
