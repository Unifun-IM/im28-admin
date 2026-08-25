---
name: framework-support
description: Reference the current built-in capabilities of this admin framework, including architecture, shell, auth, system pages, widgets, AI page-generation skills, API, styling, testing, and deployment support.
---

# 后台框架现有支持清单

> 截至 2026-08-24，本清单按当前仓库代码梳理。本文描述的是后台框架已经内置的基础通用能力与 AI 标准页面生成支持，不包含派生项目中的具体业务域页面。

## 定位

`admin-scaffold` 是基于 Arco Design Pro Vite 精简模板演进的管理后台基础框架。仓库不只是空白脚手架，而是提供后台应用的基础壳层、登录鉴权、系统管理、通用列表/详情积木、主题/i18n、OpenAPI 接入、部署模板，以及供 Codex / Claude Code / Cursor 复用的 AI 标准页面生成规则；业务项目在此基础上追加业务菜单、页面、feature、locale 和接口调用。

框架默认承载基础通用后台能力：

- 登录、鉴权态启动、异常页与空工作台
- 顶栏、侧栏、多页签、面包屑、设置抽屉等后台壳层
- 后台账号、角色权限、系统参数、操作日志等系统管理页
- 通用列表页、筛选区、表格、批量操作、状态、空态等 UI 积木
- 通用详情 Drawer、详情内操作记录表格、设置页壳层等标准页面积木
- AI code tools 共用的项目规则、Figma 规则、组件使用、SVG 图标决策与后台页面生成 skill
- Admin OpenAPI 生成物与统一请求实例
- 主题色、浅/暗色、语言、时间格式、Logo、系统名称等基础设置
- Docker、Nginx、Kubernetes 部署样例与 Vitest 测试基础

## 工程基础

### 技术栈

- React 18 + TypeScript + Vite 5
- React Router v6
- Arco Design React + `@arco-themes/react-arco-pro`
- MobX / `mobx-react-lite`
- Less / Less Modules
- Tailwind CSS v3，`preflight: false`，用于 Arco 标准组件之外的布局与装饰
- `@umijs/openapi` 生成 Admin 网关接口
- Vitest + Testing Library + jsdom

### 目录分层

源码按 FSD 分层组织：

```text
src/app       # 应用入口、Providers、路由装配、全部 icon SVG 与通用 SVG
src/pages     # 页面：login / dashboard / system / system-params / exception
src/widgets   # 后台壳层、顶栏、多页签、通用列表、设置页壳等复合 UI
src/features  # 通用交互：账号创建、角色创建、GA、个人中心、未保存守卫
src/entities  # 全局 MobX store：global-state / page-tabs / system-settings
src/shared    # api / lib / locale / config / ui
```

现有测试会校验 `src/` 下保留 FSD 顶层目录，并禁止新增遗留根目录 `components`、`containers`、`services`、`utils`、`hooks`。

### 路径别名

Vite 已配置以下别名：

- `@app`
- `@pages`
- `@widgets`
- `@features`
- `@entities`
- `@shared`
- `@`

业务扩展时优先沿用这些别名，保持依赖方向为 `pages -> widgets/features -> entities -> shared`。`src/main.tsx` 作为 app 装配入口可以导入 `@app`；widget 组合 widget、feature 复用 feature 时只允许通过目标切片公开入口，禁止深层导入、循环依赖和 widget / feature 互相依赖。所有 icon SVG 及通用 SVG 统一从 `@app/assets/*.svg` 引用，这是静态资源例外；其它 `@app/*` 仍遵守 FSD 依赖限制。

## 路由与菜单

### 默认菜单

默认路由配置位于 `src/shared/config/routes.ts`：

模板 fallback 中“系统”固定为左侧导航最后一组，业务一级菜单默认插在它之前。用户提供导航树、完整可读 Figma 侧栏或 PRD 导航说明时，菜单分组、顺序与路由优先按 `docs/skills/admin-page/SKILL.md` 执行，不强制系统末位。

| 菜单 | 路由 | 当前支持 |
| --- | --- | --- |
| 首页看板 | `/dashboard` | 空工作台，占位给业务项目扩展 |
| 系统 / 后台账号 | `/system/accounts` | 账号列表、创建、启停、重置密码、重置 GA、IP 白名单 |
| 系统 / 角色 | `/system/roles` | 角色列表、创建、编辑、删除、权限配置 |
| 系统 / 系统参数 | `/system-params/settings` | 系统名称、Logo、默认语言、时间格式、IP 白名单开关 |
| 系统 / 操作日志 | `/system/op-logs` | 操作日志列表与筛选 |

### 路由发现

- `src/app/router/get-flatten-routes.ts` 使用 `import.meta.glob` 自动发现 `src/pages/**/index.tsx`。
- 叶子路由按 `route.key -> pages/{key}/index.tsx` 映射。
- 登录页和异常页在 app 路由层单独装配。
- 路由组件通过 `lazyload` 懒加载，菜单点击时会预加载目标页面并显示 `NProgress`。

### 权限过滤

- 路由支持 `requiredPermissions` 与 `oneOfPerm`。
- 菜单渲染时会根据 `userInfo.permissions` 过滤可见路由。
- 当前默认菜单未强配权限，便于框架默认全显；派生项目可在路由配置上补权限约束。

## 后台壳层

后台壳层入口为 `@widgets/admin-shell`，主要能力包括：

- 侧栏菜单：默认展开宽度 240px，折叠宽度 56px。
- 顶栏 Navbar：面包屑、搜索入口、语言切换、消息入口、主题切换、用户菜单。
- 多页签 PageTabs：自动记录打开页面、关闭、关闭左侧/右侧/其他/全部、最多固定 3 个标签。
- 全屏模式：
  - 壳层全屏：隐藏侧栏与 Navbar，保留 PageTabs。
  - 表格全屏：隐藏侧栏、Navbar、PageTabs，仅保留列表表格。
  - `Esc` 可退出全屏。
- 品牌展示：侧栏 Logo 和系统名会读取登录后系统参数。
- 面包屑：根据路由树自动生成并本地化。
- Footer：已保留开关，默认关闭。
- Settings 抽屉：可配置导航、菜单、页脚、主题色等全局 settings。

## 登录、鉴权与安全流程

### 登录页

登录页位于 `src/pages/login`，已支持：

- 用户名 / 密码登录
- 滑块校验
- 登录成功后写入 access token / refresh token
- 已登录访问 `/login` 自动跳转 `/dashboard`
- 登录流程按 `next_step` 分支：
  - `change_password`：首次或强制改密
  - `bind_two_factor`：绑定 Google Authenticator
  - `verify_two_factor`：二次验证码校验
- 登录错误 Toast 使用前端映射文案，不直接透出后端原始 message。
- IP 白名单拦截时跳转 `/ip-denied`。

### 请求鉴权

统一请求实例位于 `src/shared/api/request.ts`，已支持：

- `VITE_API_BASE_URL` 配置网关地址，默认 `/`
- 自动附加 `Authorization: Bearer <token>`
- 自动附加 `X-Request-ID`
- 自动附加 `X-Language`
- 业务成功码 `code === 0`
- 统一错误 Message
- HTTP 401、业务码 401、token 失效文案识别
- refresh token 自动续期
- 并发 401 共用同一个 refresh 请求
- refresh 失败时统一清会话并跳转登录
- `skipErrorHandler` 和 `skipAuthRefresh` 透传控制
- blob / arraybuffer 响应直返

### 启动鉴权

`AppProviders` 启动时会：

- 判断当前是否已有登录态。
- 已登录时并行拉取当前用户 `auth/me` 和系统参数。
- 未登录且非公共路由时跳转 `/login`。
- 注册全局 unauthorized handler，用于清理登录态和系统参数缓存。

### 个人中心

个人中心挂载在 app 组合层，顶栏用户菜单可打开，已支持：

- 展示用户名称和账号
- 修改展示名并同步全局用户信息
- 上传头像预览和上传结果提示
- 修改本人密码流程
- 重置本人 GA 流程
- 敏感操作后强制重新登录

## 系统管理能力

### 后台账号

页面：`src/pages/system/accounts/index.tsx`

已支持：

- 账号列表分页
- 关键词与状态筛选
- 创建账号
- 服务端生成临时密码后一次性展示
- 临时账号密码复制
- 账号启用 / 禁用
- 重置密码
- 重置 GA
- 更新账号 IP 白名单
- 角色选择从角色列表接口加载

### 角色权限

页面：`src/pages/system/roles/index.tsx`

已支持：

- 角色列表分页
- 关键词与启用状态筛选
- 创建角色
- 编辑角色
- 删除角色
- 内置超级管理员角色保护：不展示编辑 / 删除入口
- 角色启用状态展示
- 权限配置面板从 `permissions` 接口拉取并组装模块树
- 权限搜索、全选、模块选择、资源选择、动作选择、展开 / 收起全部

### 系统参数

页面：`src/pages/system-params/settings/index.tsx`

已支持：

- 系统名称
- 系统 Logo
- 默认语言：`zh-CN` / `en-US`
- 时间格式：12 小时 / 24 小时
- IP 白名单开关
- 进入页面时优先复用全局缓存，并重新拉取最新参数
- 保存后刷新全局系统参数缓存
- 修改后取消或离开时触发未保存变更确认
- Logo 上传使用后台图片直传能力

### 操作日志

页面：`src/pages/system/op-logs/index.tsx`

已支持：

- 操作日志分页列表
- 操作账号筛选
- 操作类型筛选
- IP 筛选
- 操作时间范围筛选
- 操作路径筛选
- 内容关键词筛选
- 操作时间按系统时间格式展示

## 通用列表积木

通用列表能力集中在 `src/widgets/biz-list`。

### BizListPage

标准业务列表页面结构：

```text
筛选区 -> 数据汇总 -> 表格卡片
```

已支持：

- 表格标题
- 右侧工具栏
- 始终展示工具栏
- 刷新按钮
- 表格全屏按钮
- 筛选区透传
- 数据汇总区
- 批量选择模式
- 已选数据仅显示开关
- 批量归档 / 编辑 / 删除 / 自定义操作
- 表格空态
- 表格列规范化

### 筛选区

`SearchFilterBar` 对齐 Arco Design Pro search-table 惯例：

- `Card + Form + Grid`
- 默认一行 4 个筛选项
- `Grid` gutter 为 `[24, 16]`
- 操作区占满当前行剩余栅格并右对齐
- 支持展开 / 收起
- 支持额外操作
- 筛选控件封装：
  - `FilterKeywordInput`
  - `FilterInput`
  - `FilterSelect`
  - `FilterMultiSelect`
  - `FilterDateRange`

### 表格约定

`tableDefaults` 已内置：

- 默认分页 15 条
- 可选分页条数 15 / 30 / 50
- `total <= 15` 时隐藏分页
- 普通列默认 `ellipsis`
- 操作列自动识别并默认 `fixed: right`
- 操作列默认居中；省略 `width` 时组件兜底为 108，页面生成仍须按 `component-usage` 的列宽分析显式计算，不能把 108 当作统一标准

### 操作与状态组件

`@widgets/biz-list` 和 `@shared/ui` 已提供：

- `ActionLinks`：操作列按钮 / 下拉收纳
- `StatusBadge`：语义状态展示
- `TableBatchBar`：批量操作条
- `DataSummary`：数据摘要
- `TruncateText` 等表格单元格辅助
- `EmptyState`：通用空态
- `IconButton`：图标按钮与 tooltip
- `UserAvatar`：用户头像展示

## 通用详情 Drawer

通用详情抽屉位于 `src/widgets/biz-detail-drawer`。

已支持：

- 纯详情展示：传 `fields` 或 `sections` 即可渲染基础信息。
- 多分组详情：多个 `sections` 会按标题分组展示。
- 多 Tab 详情：传 `tabs` 可追加自定义 Tab 内容。
- 对象摘要：传 `summary` 在 Tab 上方展示头像、名称与状态等摘要信息。
- 详情 + 操作记录：传 `operationRecords` 会自动追加「操作记录」Tab。
- 详情异步请求：传 `loading` 使用 Arco `Spin` 保持 Drawer 内容结构稳定。
- 操作记录 / 关联列表表格复用 `.use-biz-detail-table`（`src/shared/ui/biz-detail-table.less`）：外框 8px 上下圆角一致，分页在框外；手写 Table 须 import 该 less 并加 className。
- 默认 Drawer 宽度 720px，默认无 footer，适合只读详情场景；需要底部操作时可透传 Arco `Drawer` 的 `footer`。

## API 与 OpenAPI

### 生成物

Admin 网关 OpenAPI 生成物位于 `src/shared/api/admin/**`。当前包含：

- `auth`
- `health`
- `systemUsers`
- `rbac`
- `platform`
- `admintongyong`
- `adminxitongcaozuorizhi`
- 全局 `AdminAPI` 类型声明

生成命令：

```bash
npm run openapi
```

该命令是统一生成入口，会读取当前项目的 OpenAPI 输入、`.openapi2tsrc.ts` 和环境变量，生成当前配置对应的 API 与 typings；固定执行该命令与派生项目使用自身配置不冲突。

生成流程：

```text
scripts/convert-yaml-to-json.mjs -> openapi2ts
```

约束：

- API 与 typings 的生成流程和只读边界见 `docs/skills/api-generation/SKILL.md`。
- 禁止手改 `src/shared/api/admin/**`，包括 `typings.d.ts`。
- 页面、feature 直接使用生成函数和 `AdminAPI` 字段名。
- 列表信封使用 `res.data?.list` 和 `res.data?.total`。

### 图片上传

后台图片上传封装位于 `src/shared/lib/uploadAdminImage.ts`，已支持：

- JPG / JPEG / PNG / WEBP
- 单文件最大 1MB
- 调用 `upload-credential` 获取 OSS PostObject 凭证
- 浏览器 `FormData` 直传 OSS
- 不走业务 request，避免给 OSS 请求附带 Bearer token
- 返回凭证中的可访问 `url`
- 上传进度回调

## 状态管理

仓库内置 3 个 MobX 单例：

| Store | 位置 | 用途 |
| --- | --- | --- |
| `globalStore` | `src/entities/global-state` | settings、当前用户、用户 loading |
| `pageTabsStore` | `src/entities/page-tabs` | 多页签、固定标签、壳层全屏、表格全屏 |
| `systemSettingsStore` | `src/entities/system-settings` | 系统名称、Logo、默认语言、时间格式、IP 白名单开关 |

## 主题与样式

### 主题能力

- 默认品牌色：`#635CFF`
- `settings.json` 提供 navbar、menu、footer、themeColor、menuWidth 等配置
- `applyThemeColor` 会同步 Arco primary 色板
- 支持浅色 / 暗色主题
- 顶栏主题切换使用 View Transition 圆形扩散动画
- Figma Light / Dark token JSON 存放在 `docs/theme/Light.tokens.json` 与 `docs/theme/Dark.tokens.json`
- 语义色集中在 `src/app/styles/theme-tokens.less`

### 样式入口

样式入口顺序：

```text
arco.css -> tailwind.css -> global.less
```

使用约束：

- 页面组件决策统一遵守：组件发现 → 已有组件 → 重复 UI 抽取 → Arco Design / Arco Design Pro → 自建。
- 颜色、公共样式抽取与 Tailwind / Less 选型以 `docs/skills/css-usage/SKILL.md` 为准。
- Tailwind 用于 Arco 标准组件之外的布局和装饰。
- 全局样式仅放跨页面共享样式、portal、基础设施、Arco 兼容补丁；公共组件的语义化 `use-*` 修饰类属于跨页面共享样式，不属于具体业务页面样式。
- 非标准自建 UI 独立在对应 widget / feature 下引入样式。

### 全局样式补丁

`global.less` 已包含：

- NProgress 样式
- Arco Select / TreeSelect / Cascader 单选布局兼容补丁
- html/body 基础样式
- 主题切换动画
- 侧栏折叠菜单浮层
- 折叠态菜单 Tooltip
- 全局 Message 样式
- success Switch
- Modal、Checkbox 等通用视觉补位
- 通用详情表格 `.use-biz-detail-table`

## i18n

i18n 入口为 `src/shared/locale/index.ts`，当前内置：

- `common`
- `login`
- `exception`
- `system`

支持语言：

- `zh-CN`
- `en-US`

使用方式：

- UI 文案通过 `useLocale()` 获取。
- Arco `ConfigProvider` 会跟随语言切换 Arco 内置 locale。
- 顶栏语言切换写入本地存储 `arco-lang`。
- 登录后如无本地语言偏好，会读取系统参数默认语言。
- 业务项目新增 locale 包后在 `locale/index.ts` merge。

## 通用辅助能力

`src/shared/lib` 已提供：

- `lazyload`：懒加载页面
- `checkLogin`：登录态判断
- `authentication`：权限判断
- `formatTime`：跟随系统参数的时间格式化
- `useStorage`：localStorage 状态封装
- `useLocale`：文案读取
- `getUrlParams`：URL 参数读取
- `changeTheme`：主题切换
- `startThemeTransition`：主题动画
- `applyThemeColor`：主题色应用
- `global-context`：语言 / 主题上下文
- `ipAccessDenied`：IP 白名单拒绝识别与跳转
- `uploadAdminImage`：后台图片上传

## 异常与占位

内置页面：

- `/login`
- `/ip-denied`
- `/403`
- `/404`

通用占位：

- `EmptyState`：列表或页面空态。

## 测试与质量

已配置脚本：

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run typecheck
npm test
npm run openapi
```

当前测试覆盖：

- FSD 顶层目录存在性
- 禁止 legacy root dumping grounds
- app 路由基础行为
- admin shell 基础行为
- request 基础行为

构建命令为：

```bash
npm run build
```

内部执行：

```text
tsc -b && vite build
```

## 部署支持

### Docker

`Dockerfile` 已提供多阶段构建：

- `node:22-alpine` 构建前端产物
- `nginx:1.27-alpine` 承载静态资源
- 默认 `BACKEND_URL=http://im28-api-gateway:8080`
- 暴露 80 端口

### Nginx

`deploy/nginx.conf` 已支持：

- `/healthz` 健康检查
- SPA history fallback
- `/v1/admin/` 代理到后端网关
- `/v1/` 非 admin 路径返回 404
- 静态资源长期缓存
- `/cdn-cgi/trace` 透传 Cloudflare trace

### Kubernetes

`deploy/k8s` 提供基础资源样例：

- `deployment.yaml`
- `service.yaml`
- `ingress.yaml`
- `kustomization.yaml`

## 业务扩展入口

新增业务模块通常按以下步骤：

1. 按 `admin-page` 的导航优先级在 `src/shared/config/routes.ts` 增加菜单路由；无明确导航说明时，把业务一级菜单插在末位 `system` 之前。
2. 新增 `src/pages/<route.key>/index.tsx`。
3. 如有用户交互流程，拆到 `src/features/<feature-name>`。
4. 如有复合可复用 UI，拆到 `src/widgets/<widget-name>`。
5. 如需跨页面状态，放到 `src/entities/<entity-name>`。
6. 业务文案新增到 `src/shared/locale/<biz>.ts` 并在 `locale/index.ts` merge。
7. 业务 API 更新 OpenAPI 后执行统一入口 `npm run openapi`，由命令读取当前项目配置。
8. 侧栏新一级菜单图标在 `PageLayout.getIconFromKey` 注册。

## 当前不内置的内容

框架刻意不内置：

- 具体业务域页面
- 业务 mock 数据
- Redux 或第二套状态管理
- 第二套 UI 组件库
- 业务字段映射层
- 未在 OpenAPI 中出现的整页接口实现
- 自动提交 git / 自动推送远程

派生项目可以扩展这些业务能力，但应继续遵守“组件发现 → 已有组件 → 重复 UI 抽取 → Arco Design / Arco Design Pro → 自建”、FSD 分层、OpenAPI 生成物禁止手改，以及 AI 标准页面生成 skill 等项目约定。
