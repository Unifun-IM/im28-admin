---
name: svg-icon-usage
description: Decide whether an admin page should use Arco icon components, existing local SVG assets, or newly exported Figma SVG files, and keep every icon SVG plus common SVG assets in src/app/assets.
---

# SVG Icon Usage Skill

本 skill 用于页面生成或调整时选择图标来源。目标是让 AI 在使用图标前先判断“标准组件图标够不够、仓库是否已有 SVG、是否需要从 Figma 落一个新 SVG”，避免近似替代、重复资产和内联大段 SVG。

如果图标来源是 Figma 设计稿，先读取 `docs/skills/figma-rules/SKILL.md`，遵守 Figma 只读和按稿还原边界。

资产发现与最终归属是两个阶段。查找已有资产时统一搜索整个 `src`：

```bash
rg --files src | rg '\\.svg$'
```

不要只搜索 `src/app/assets`，否则会漏掉与页面、feature 或 widget 共置的私有背景、插画和 Logo。完成复用判断后，再按下文规则决定资产是否应迁入 `src/app/assets`。

## 决策顺序

先判断 Figma 是否明确指定了定制视觉：标准通用动作默认使用 Arco icon；一旦 Figma 明确给出自定义造型、品牌视觉或指定 SVG，该视觉要求覆盖 Arco 的默认优先级，必须使用对应的本地 SVG。Arco 标准组件自带且设计稿未要求替换的图标仍保留组件默认实现。

1. Figma 明确给出自定义图标、品牌图标、菜单图标、插画或特殊视觉时，优先查找并使用视觉一致的已有本地 SVG；仓库没有时使用 Figma 导出的 SVG。
   - 先搜索整个 `src/**/*.svg`，确认集中资产和业务切片私有资产中都没有视觉一致的实现。
   - 同语义、同视觉场景的图标不要新增重复文件；只有语义相同但视觉不一致时才新增。
   - 不用近似 Arco / 第三方图标替代稿面定制图标。
   - 不凭记忆手写 SVG path。
2. 没有 Figma 定制视觉要求时，标准操作图标使用 `@arco-design/web-react/icon`。
   - 搜索、刷新、展开、收起、编辑、删除、查看、复制、设置、关闭、加载、语言、主题等通用动作，默认使用 Arco icon。
   - Arco `Button` 的 `icon`、`Input` 的 `prefix/suffix`、`Tooltip` 内图标按钮都优先走 Arco icon。
3. 没有 Figma 定制要求且 Arco 无法表达时，复用语义和视觉都匹配的已有本地 SVG。
   - 先搜索整个 `src/**/*.svg`；如果匹配项是散落的 icon SVG，复用前先迁入 `src/app/assets` 并更新原调用方。
   - 不为同一语义和视觉场景新增重复文件。
4. 只有 SVG 不适合表达时才使用位图。
   - 照片、复杂纹理、不可矢量化图片用 PNG/JPG/WebP。

## 常见场景

| 场景 | 推荐来源 | 说明 |
| --- | --- | --- |
| 表格操作列的查看、编辑、删除、设置、更多 | `ActionLinks` 内置 Arco icon / 已有更多 SVG | 不在每个页面手写操作按钮图标 |
| 筛选框搜索、展开/收起、刷新、全屏 | `@arco-design/web-react/icon` | `biz-list` 已内置的不要重复传 |
| 顶栏语言、通知、主题、设置、关闭 | Arco icon + `IconButton` | 保持现有导航按钮样式 |
| 侧栏一级菜单图标 | 本地 SVG `?react` | 在 `PageLayout.getIconFromKey` 注册 |
| 品牌 Logo、登录页 Logo | 本地 SVG | 保留品牌视觉，不用 Arco icon |
| 空态插画、告警插画 | 已有 `app/assets` 或 Figma SVG | 插画类不要用操作 icon 替代 |
| PRD / Figma 指定的业务专属图标 | Figma SVG | 统一放到 `src/app/assets/` |

## 现有 SVG 资产

优先复用这些已存在资产：

| 资产 | 用途 |
| --- | --- |
| `src/app/assets/logo.svg` | 壳层品牌 Logo |
| `src/app/assets/icon-dashboard.svg` | 侧栏 dashboard 一级菜单 |
| `src/app/assets/icon-system.svg` | 侧栏 system 一级菜单 |
| `src/app/assets/empty-state.svg` | 通用空态 |
| `src/app/assets/icon-check-circle-fill.svg` | 通用成功填充图标，已有页面也会用 Arco 同名 icon |
| `src/app/assets/icon-exclamation-circle-fill.svg` | 通用警告 / 提醒填充图标 |
| `src/app/assets/icon-more-dots.svg` | 业务表格更多操作 |
| `src/app/assets/icon-logout.svg` | 顶栏退出登录 |
| `src/app/assets/icon-arrow.svg`、`icon-check.svg`、`icon-copy.svg`、`icon-unlock.svg`、`icon-user.svg` | 登录流程图标 |
| `src/pages/login/assets/login-logo.svg`、`login-banner-bg.svg` | 登录页私有 Logo 和背景，不属于 icon |

如果新增图标语义与上表一致，复用现有资产；如果视觉稿要求不同，再新增并说明差异。

## 资产归属

所有 icon SVG 与通用 SVG 统一收拢到 `src/app/assets`：

- 所有 icon SVG，无论单页面、单 feature、单 widget 或跨切片使用：`src/app/assets/icon-*.svg`
- 通用 Logo、插画、空态等非 icon SVG：`src/app/assets/*.svg`
- 页面私有背景、插画、Logo 等非 icon SVG：与对应页面、feature 或 widget 共置

### `app/assets` 的 FSD 例外

`src/app/assets` 是本项目集中管理全部 icon SVG 和通用 SVG 的显式 FSD 例外。`pages`、`widgets`、`features`、`entities`、`shared` 可以通过 `@app/assets/*` 引用其中的静态 SVG，但不得引用 `app` 下的组件、状态、路由或其它代码模块。

- icon SVG 即使只由一个页面、feature 或 widget 使用，也放到 `src/app/assets`。
- 页面、feature、widget 私有的背景、插画、Logo 等非 icon SVG 可以与使用者共置。
- 私有非 icon SVG 被多个独立切片复用，或形成稳定通用语义后，迁到 `src/app/assets`。
- `src/shared/assets` 不再存放通用 SVG。
- 判断非 icon SVG 是否通用时，看复用范围和稳定语义，不只看文件名是否含 `global`、`common` 或 `logo`。

约束：

- `shared` 不得依赖 `pages`、`features`、`widgets` 下的资产。
- `widgets` 不得依赖 `pages`、`features` 下的资产。
- 各层只允许从 `@app/assets` 引用静态 SVG，不得通过该别名引用 `app` 代码。
- 新增 icon SVG 直接放进 `app/assets`，不要散落在业务切片。
- 菜单图标同样遵守这条统一规则；放入 `src/app/assets` 不是按消费者归属的另一套例外。

## 命名

使用语义化英文文件名：

- 通用动作：`icon-copy.svg`、`icon-logout.svg`
- 菜单：`icon-dashboard.svg`、`icon-risk-control.svg`
- 状态：`icon-warning-fill.svg`、`icon-success-fill.svg`
- 业务专属：`icon-user-group.svg`、`icon-audit-record.svg`

不要使用中文拼音、接口路径碎片或 Figma 自动导出的无意义名称。进入 `app/assets` 的文件名必须语义明确且全局唯一；业务专属图标可以保留清晰的业务语义。

## 引用方式

作为 React 图标参与样式控制时使用 `?react`：

```tsx
import IconRiskControl from '@app/assets/icon-risk-control.svg?react';

<IconRiskControl className={styles.icon} />
```

作为图片、背景、Logo、插画或 img src 时使用普通导入：

```tsx
import emptyStateSvg from '@app/assets/empty-state.svg';

<img src={emptyStateSvg} alt="" />
```

不要把完整 SVG 内联到 TSX。提交到仓库的必须是本地 SVG 文件内容，不是 Figma 或远程 asset URL。

## 颜色和尺寸

- 单色操作图标优先让 SVG 支持 `currentColor`，通过 className / token 控色。
- 多色品牌 Logo、插画、稿面专属图标保留原始颜色，除非设计稿要求随主题变化。
- 页面中用 Arco / Tailwind token 控制尺寸和颜色，不在业务代码里写死浅色 hex。
- 暗色模式下新增图标要检查可见性；必要时使用主题 token 或准备设计稿指定的暗色版本。

## 侧栏菜单图标

新增一级菜单图标时：

1. 菜单图标按全局 icon SVG 规则统一放到 `src/app/assets/icon-<menu-key>.svg`，不因当前只由 `admin-shell` 消费而与 widget 共置。
2. 在 `src/widgets/admin-shell/PageLayout.tsx` 中 import `?react`。
3. 在 `getIconFromKey` 按 route key 注册。
4. 使用现有 `styles.icon`，不要单独重写侧栏图标尺寸。

## 不要做

- 不用近似图标替代 Figma 明确指定的自定义 SVG。
- 不把大段 SVG path 内联到 TSX。
- 不把远程 Figma asset URL 当作最终代码资源。
- 不为同一语义重复新增多个 SVG。
- 不把 icon SVG 放在页面、feature、widget 或 `shared` 的私有资产目录。
- 不把通用 SVG 分散到 `shared/assets` 或多个业务切片。
- 页面私有背景、插画、Logo 等非 icon SVG 不必集中到 `app/assets`。
- 不通过 `@app` 从下层切片引用 SVG 之外的应用层代码。
- 不引入第二套图标库；本项目标准动作图标使用 Arco icon。
