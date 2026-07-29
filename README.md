# im-admin

IM 管理后台。基于 **Arco Design Pro（Vite 精简版）** 能力，按 **Feature-Sliced Design (FSD)** 组织代码，状态管理使用 **MobX**（不使用 Redux）。

参考脚手架：`arco init` → Arco Pro → Vite → **simple**（与仓库旁 `im28-admin2` 精简模板对齐）。

## 技术栈

- React 18 + TypeScript + Vite 5
- Arco Design + `@arco-themes/react-arco-pro`
- React Router v6
- MobX / mobx-react-lite
- `@umijs/openapi` 生成接口
- Less Modules、MockJS、i18n（内置 zh-CN / en-US）

## 快速开始

```bash
npm install
# OPENAPI_YAML_URL=https://... npm run openapi   # 有远程文档后再生成
npm run dev
npm run build
npm test
```

默认账号（Mock）：`admin` / `admin`。

## 目录结构（FSD）

```text
src/
  app/           # 应用入口、Providers、路由
  pages/         # 页面：login / dashboard/workplace / example / exception/403
  widgets/       # 布局与复合 UI：admin-shell、navbar、settings、message-box…
  features/      # 用户交互特性（可扩展）
  entities/      # 业务实体；global-state 为 MobX 全局状态（替代 Pro 的 Redux）
  shared/        # api(request + openapi 生成)、lib、locale、mock、config、assets
```

## 相对官方精简版 Pro 的映射

| Pro（im28-admin2） | 本项目（FSD + MobX） |
| --- | --- |
| `store/`（Redux） | `entities/global-state` + `shared/lib/redux-compat` |
| `layout.tsx` | `widgets/admin-shell/PageLayout.tsx`（Router v6） |
| `components/*` | `widgets/*` |
| `utils/*` | `shared/lib/*` |
| `routes.ts` / `settings.json` / `locale` / `mock` | `shared/config` / `shared/locale` / `shared/mock` |
| `pages/login|workplace|example|403` | 同路径，位于 `pages/` |

精简版页面范围（对齐 simple）：登录 / 工作台 / 示例页 / 403。

## 接口引入方式

接口由 **OpenAPI 脚本生成**，页面按模块具名导入：

```ts
import { postApiUserLogin } from '@shared/api/user'
import { getApiWorkplaceOverviewContent } from '@shared/api/workplace'
import { setAccessToken } from '@shared/api/request'

const res = await postApiUserLogin({ userName, password })
```

| 路径 | 职责 |
| --- | --- |
| `OPENAPI_YAML_URL` | 远程 OpenAPI YAML 地址 |
| `npm run openapi` | 拉取远程 YAML→JSON + 生成 `src/shared/api/*` |
| `shared/api/request.ts` | 手写 axios 单例（生成代码依赖它，勿删） |
| `src/shared/api/*.ts` / `typings.d.ts` | **生成物**，不要手改 |

```bash
OPENAPI_YAML_URL=https://example.com/openapi.yaml npm run openapi
```

环境变量见 `.env.example`（`VITE_API_BASE_URL`）。

## 内置能力

- 顶栏 / 侧栏 / 页脚布局，可折叠菜单与面包屑
- 设置抽屉：主题色、导航/菜单/页脚开关、菜单宽度、色弱模式
- 亮暗色切换、中英文切换
- 消息中心（MessageBox）
- 权限路由过滤与 `PermissionWrapper`
- 开发环境 Mock（`shared/mock`，页面级 mock 如 workplace）

## 脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 本地开发 |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run preview` | 预览构建产物 |
| `npm run lint` | ESLint |
| `npm run typecheck` | 仅类型检查 |
| `npm test` | Vitest |
| `npm run openapi` | 从远程 OpenAPI 生成 `src/shared/api` |
| `npm run openapi:convert` | 仅拉取远程 YAML → `openapi.json` |
