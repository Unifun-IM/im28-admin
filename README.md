# im-admin

IM 管理后台。基于 **Arco Design Pro（Vite 精简版）** 能力，按 **Feature-Sliced Design (FSD)** 组织代码，状态管理使用 **MobX**（不使用 Redux）。UI/交互以 Figma「业务1.0」为准。

**全局基本准则：** 优先采用 Arco Design 标准组件；Figma 约束交互细节；非标准组件强制像素级布局（详见 `AGENTS.md`）。

## 技术栈

- React 18 + TypeScript + Vite 5
- Arco Design + `@arco-themes/react-arco-pro`
- React Router v6
- MobX / mobx-react-lite
- `@umijs/openapi` 生成 Admin 网关接口至 `src/shared/api/admin`；业务页直接引用生成函数与 `AdminAPI` 类型（无字段映射）
- 无 OpenAPI 覆盖的菜单页保留路由，统一展示「接口未就绪」
- Less Modules、i18n（内置 zh-CN / en-US）

## 快速开始

```bash
npm install
cp .env.example .env   # 本机环境，勿提交
npm run openapi          # 从远程 OpenAPI 生成 Admin API
npm run dev
npm run build
npm test
```

联调账号以网关环境为准。登录后默认进入 **用户查询** `/user/query`。

**环境变量：** 本地开发复制 `.env.example` → `.env`（已 gitignore，勿提交），通过 `VITE_API_BASE_URL` 指定网关。生产容器通过运行时环境变量 `BACKEND_URL` 指定上游，默认值为 `http://im28-api-gateway:8080`。Nginx 只将 `/v1/admin/*` 原路径转发到该地址，其他 `/v1/*` 路径返回 404。

## 业务菜单（Figma 业务1.0）

| 模块 | 路由前缀 | 说明 |
| --- | --- | --- |
| 用户 | `/user/*` | 查询、黑/白名单、邀请码、日志、详情 |
| 系统 | `/system/*` | 后台账号、角色、操作日志 |
| 系统参数 | `/system-params/settings` | 系统名称 / Logo / 默认语言 / 时间格式 / IP 白名单开关 |
| 财务 | `/finance/*` | 充值/提现订单与渠道 |
| 交易 | `/trade/*` | 红包记录、配置、详情 |
| 会话 | `/session/*` | 用户会话、群聊、群详情、聊天记录（只读） |

演示页 `dashboard/workplace`、`example` 仍保留源码，**未挂入菜单与默认入口**。

## 目录结构（FSD）

```text
src/
  app/           # 应用入口、Providers、路由
  pages/         # 业务页面：user / system / system-params / finance / trade / session / login
  widgets/       # 布局与复合 UI：admin-shell、navbar、biz-list（筛选/汇总/列表）…
  features/      # 用户交互特性：拉黑/白名单、个人中心、角色创建、用户详情 …
  entities/      # MobX：global-state、page-tabs、system-settings（后台系统参数）
  shared/        # api（含 admin 生成物）、lib、locale、config、assets
```

## 业务 API 约定

- 只引用 `@shared/api/admin/*` 生成函数与全局 `AdminAPI` 类型
- 页面 Form `field` / Table `dataIndex` / state **不做字段映射**，列表用 `res.data?.list` / `res.data?.total`
- **禁止手改** `src/shared/api/admin/**`；文档更新后执行 `npm run openapi`
- 无文档模块：保留菜单，页面展示「接口未就绪」（`ApiNotReady`）
- 登录后 `AppProviders` 并行拉 `auth/me` 与 `system-settings/get`；侧栏品牌与 `formatDateTime` 消费 `systemSettingsStore`
- 后台图片：`@shared/lib/uploadAdminImage` → `postV1AdminCommonUploadCredential`（取返回 `url`）

通用列表积木：`widgets/biz-list`（`SearchFilterBar` / `DataSummary` / `BizListPage` / `TableBatchBar`）。批量：表头「批量操作」进入选择模式后再勾选。

壳层对齐：侧栏展开 **240px**、收起 **56px**（贴边全高、仅右边框，见 Figma `862:20168`）；主题色默认 `#635CFF`。

## 接口引入方式（OpenAPI 生成）

Admin 网关文档：[docs/admin/openapi.yaml](https://im-api-gateway.djftech.app/docs/admin/openapi.yaml)。

```ts
import { postV1AdminAuthLogin } from '@shared/api/admin/auth';
import { postV1AdminUsersList } from '@shared/api/admin/users';
import { setAccessToken } from '@shared/api/request';

const res = await postV1AdminAuthLogin({ username: 'admin', password: '***' });
// res: AdminAPI.SysUserLoginEnvelope（code === 0 时带 data）
```

| 路径 | 职责 |
| --- | --- |
| `OPENAPI_YAML_URL` | 远程 OpenAPI 地址（见 `.env.example`） |
| `npm run openapi` | 拉取远程 yaml→json + 生成 `src/shared/api/admin/*` |
| `shared/api/request.ts` | axios 单例（Bearer / `X-Request-ID` / `X-Language`，勿删） |
| `shared/api/admin/*` | **Admin OpenAPI 生成物**，不要手改 |
| `shared/ui/api-not-ready` | 无 OpenAPI 页面空态「接口未就绪」 |

联调时复制 `cp .env.example .env`，按需改 `VITE_API_BASE_URL`。正式部署通过 Deployment 的 `BACKEND_URL` 指定后端服务，不需要为后端地址重新构建前端镜像。

## 脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 本地开发 |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run preview` | 预览构建产物 |
| `npm run lint` | ESLint |
| `npm run typecheck` | 仅类型检查 |
| `npm test` | Vitest |
| `npm run openapi` | 从远程 OpenAPI 生成 `src/shared/api/admin` |
