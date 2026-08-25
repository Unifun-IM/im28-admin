---
name: framework-support
description: Look up the capabilities currently built into this admin framework, including architecture, shell, auth, system pages, reusable UI, API, theming, testing, and deployment.
---

# Framework Support

本文件只回答“框架已经提供什么”。如何生成页面或使用组件，分别见 `admin-page` 与 `component-usage`。

## 定位

`admin-scaffold` 是基于 React、TypeScript、Vite 和 Arco Design Pro 的管理后台框架，内置基础后台能力与 AI 标准页面生成规范，不是空白脚手架。

技术栈：

- React 18、TypeScript、Vite 5、React Router v6
- Arco Design React / Arco Design Pro
- MobX、Less、Tailwind CSS 3（`preflight: false`）
- `@umijs/openapi`
- Vitest、Testing Library、jsdom

## 目录与装配

| 层 | 职责 |
| --- | --- |
| `src/app` | Providers、路由装配、全局样式、全部 icon SVG 与通用 SVG |
| `src/pages` | 路由页面 |
| `src/widgets` | 后台壳层和跨页面复合 UI |
| `src/features` | 用户动作与业务流程 |
| `src/entities` | 全局实体状态 |
| `src/shared` | API、配置、locale、lib、通用 UI |

Vite 已配置 `@app`、`@pages`、`@widgets`、`@features`、`@entities`、`@shared` 和 `@` 别名。

## 路由与后台壳层

- 路由配置：`src/shared/config/routes.ts`
- 页面发现：`src/app/router/get-flatten-routes.ts` 通过 `import.meta.glob` 加载 `src/pages/**/index.tsx`
- 支持 `requiredPermissions`、`oneOfPerm` 菜单权限
- `@widgets/admin-shell` 提供侧栏、Navbar、面包屑、多页签、页面预加载、NProgress、壳层全屏、表格全屏和 Settings Drawer
- 模板 fallback 菜单：看板 + 系统管理；没有外部导航说明时，业务一级菜单插在末位 `system` 前

## 登录与系统管理

登录与鉴权已支持：

- 用户名密码、滑块校验、access / refresh token
- 首次改密、绑定 / 校验双因素认证
- token 自动续期、并发 401 合并、失效后统一清会话
- IP 白名单拒绝页
- 启动时加载当前用户与系统参数
- 个人中心：展示名、头像、密码和 GA

内置系统页面：

| 页面 | 路由 | 主要能力 |
| --- | --- | --- |
| 看板 | `/dashboard` | 业务工作台占位 |
| 后台账号 | `/system/accounts` | 查询、创建、启停、重置密码 / GA、IP 白名单 |
| 角色 | `/system/roles` | 查询、创建、编辑、删除、权限树 |
| 系统参数 | `/system-params/settings` | 系统名、Logo、语言、时间格式、IP 白名单开关 |
| 操作日志 | `/system/op-logs` | 多条件查询与分页 |
| 异常页 | `/ip-denied`、`/403`、`/404` | 访问异常 |

## 页面组件

| 能力 | 公开入口 |
| --- | --- |
| 标准列表、筛选、汇总、批量操作 | `@widgets/biz-list` |
| 纯详情、多分组、多 Tab、操作记录 | `@widgets/biz-detail-drawer` |
| 关系子 Drawer | `@widgets/biz-relation-list-drawer` |
| 操作日志 Timeline | `@widgets/biz-operation-timeline` |
| 设置页与未保存守卫 | `@widgets/session-settings`、`@features/unsaved-changes` |
| 标准表单 Modal 样式 | `@shared/ui/biz-form-modal.less` |
| 详情表格样式 | `@shared/ui/biz-detail-table.less` |
| 头像、状态、空态、复制、详情链接 | `@shared/ui` |

`biz-list` 内置 `BizListPage`、`SearchFilterBar`、`Filter*`、`DataSummary`、`TableBatchBar`、`ActionLinks`、`AvatarNameCell` 和 `DoubleLineCell`。默认分页为 15，支持 15 / 30 / 50，普通列默认省略，操作列可固定在右侧。

`BizDetailDrawer` 支持 `fields`、`sections`、`summary`、`tabs`、`operationRecords` 和 loading；详情与关系 Drawer 默认宽度为视口 50%，默认无 footer。

组件选择和精确契约以 `component-usage` 为准。

## API、状态与基础能力

- 请求实例：`src/shared/api/request.ts`，支持鉴权、语言、Request ID、统一错误和 token refresh
- 生成 API：`src/shared/api/admin/**`，统一执行 `npm run openapi`
- 图片上传：`src/shared/lib/uploadAdminImage.ts`，支持 JPG / PNG / WEBP、1MB 校验和 OSS 直传
- MobX store：`globalStore`、`pageTabsStore`、`systemSettingsStore`
- i18n：`src/shared/locale`，内置 `zh-CN` / `en-US`
- 时间格式：`formatDateTime` 跟随系统 12 / 24 小时配置

## 主题与样式

- 运行时 token：`src/app/styles/theme-tokens.less`
- 设计 token：`docs/theme/Light.tokens.json`、`docs/theme/Dark.tokens.json`
- 支持浅色 / 暗色、品牌色板和 View Transition 主题动画
- 样式入口顺序：`arco.css -> tailwind.css -> global.less`

具体写法见 `css-usage`；SVG 决策见 `svg-icon-usage`。

## 质量与部署

常用命令：

```bash
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
npm run openapi
```

部署样例：

- `Dockerfile`：Node 构建 + Nginx 静态服务
- `deploy/nginx.conf`：SPA fallback、健康检查、网关代理与静态缓存
- `deploy/k8s`：Deployment、Service、Ingress、Kustomize

## 业务扩展入口

新增业务通常涉及：

1. 在 `src/shared/config/routes.ts` 增加路由。
2. 新增 `src/pages/<route.key>/index.tsx`。
3. 交互流程放 `features`，复合 UI 放 `widgets`，跨页面状态放 `entities`。
4. locale 放 `src/shared/locale` 并合并入口。
5. API 变化执行 `npm run openapi`。
6. 一级菜单图标放 `src/app/assets` 并在 `PageLayout.getIconFromKey` 注册。

页面生成流程见 `admin-page`。
