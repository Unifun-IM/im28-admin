# admin-scaffold

管理后台通用脚手架。基于 **Arco Design Pro（Vite 精简版）**，按 **Feature-Sliced Design (FSD)** 组织代码，状态管理使用 **MobX**。

本仓库 **不含具体业务页面**，只提供：

- 登录 / 异常页 / 空工作台
- 布局壳层（侧栏、顶栏、多页签、主题与设置抽屉）
- 后台账号 / 角色 / 系统参数 / 操作日志（通用系统管理）
- 通用样式、组件与列表积木（`shared/ui`、`widgets/biz-list` 等）

业务模块请在本脚手架上新增 `pages/*`、`features/*` 与对应 locale / 路由。

**全局基本准则：** 优先采用 Arco Design 标准组件；Figma 约束交互细节；非标准组件强制像素级布局（详见 `AGENTS.md`）。

## 技术栈

- React 18 + TypeScript + Vite 5
- Arco Design + `@arco-themes/react-arco-pro`
- React Router v6
- MobX / mobx-react-lite
- `@umijs/openapi` 生成 Admin 网关接口至 `src/shared/api/admin`
- Less Modules、i18n（内置 zh-CN / en-US）
- Tailwind CSS v3（`preflight: false`，仅补自建装饰）

## 快速开始

```bash
npm install
cp .env.example .env   # 本机环境，勿提交
npm run openapi        # OpenAPI → Admin API（按需）
npm run dev
npm run build
npm test
```

登录后默认进入 **首页看板** `/dashboard`。

**环境变量：** 本地开发复制 `.env.example` → `.env`，通过 `VITE_API_BASE_URL` 指定网关。

## 脚手架菜单

| 模块 | 路由前缀 | 说明 |
| --- | --- | --- |
| 首页看板 | `/dashboard` | 空壳工作台，业务可自行填充 |
| 系统 | `/system/*` | 后台账号、角色、操作日志 |
| 系统参数 | `/system-params/settings` | 系统名称 / Logo / 默认语言 / 时间格式 / IP 白名单开关 |

## 目录结构（FSD）

```text
src/
  app/           # 应用入口、Providers、路由
  pages/         # 页面：dashboard / system / system-params / login / exception
  widgets/       # 布局与复合 UI：admin-shell、navbar、biz-list…
  features/      # 通用交互：账号/角色/GA/个人中心/未保存守卫
  entities/      # MobX：global-state、page-tabs、system-settings
  shared/        # api、lib、locale、config、ui、assets
```

## 扩展业务

1. 在 `src/shared/config/routes.ts` 追加菜单路由
2. 新增 `src/pages/<route.key>/index.tsx`
3. 业务文案放 `src/shared/locale/<biz>.ts`，并在 `locale/index.ts` merge
4. 侧栏图标在 `widgets/admin-shell/PageLayout.tsx` 的 `getIconFromKey` 注册
5. 业务 API：更新 OpenAPI 后执行 `npm run openapi`（**禁止手改** `src/shared/api/admin/**`）

## API 约定

- 只引用 `@shared/api/admin/*` 生成函数与全局 `AdminAPI` 类型
- 页面 Form `field` / Table `dataIndex` / state **不做字段映射**
- 无整页契约时用 `ApiNotReady`，不要为「接口不够」删减交互

## 脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 本地开发 |
| `npm run build` | 生产构建 |
| `npm test` | 单元测试 |
| `npm run openapi` | 重新生成 Admin API |
| `npm run lint` / `typecheck` | 质量检查 |
