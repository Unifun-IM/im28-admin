# Admin Framework Guide

`admin-scaffold` 是基于 Arco Design Pro Vite 精简模板演进的管理后台基础框架。它不是空白脚手架，而是内置基础通用功能，并提供面向 AI 生成标准后台页面的组件、规则与 skill 体系。

具体业务域页面由派生项目或业务迭代在本框架上扩展。

## 文档索引

| 内容 | 文档 |
| --- | --- |
| 框架现有能力清单 | `docs/skills/framework-support/SKILL.md` |
| AI code tools 统一入口 | `docs/skills/ai-code/SKILL.md` |
| 通用项目规则 | `docs/skills/project-rules/SKILL.md` |
| API 与 typings 生成 | `docs/skills/api-generation/SKILL.md` |
| CSS、主题与 Tailwind | `docs/skills/css-usage/SKILL.md` |
| Figma 只读与按稿还原 | `docs/skills/figma-rules/SKILL.md` |
| 项目组件、Arco 最佳使用与组件抽取 | `docs/skills/component-usage/SKILL.md` |
| SVG 图标决策 | `docs/skills/svg-icon-usage/SKILL.md` |
| 标准后台列表 / 详情页生成 | `docs/skills/admin-page/SKILL.md` |
| Codex 项目入口 | `AGENTS.md` |
| Claude Code 项目入口 | `.claude/CLAUDE.md` |
| Cursor 薄规则入口 | `.cursor/rules/ai-code.mdc` |

## 内置能力

- 登录 / 异常页 / 基础工作台
- 布局壳层：侧栏、顶栏、多页签、主题与设置抽屉
- 通用系统管理：后台账号、角色、系统参数、操作日志
- 通用列表页积木：筛选、汇总、表格、批量操作、操作列、状态、空态
- 通用详情能力：详情 Drawer、多 Tab、详情内操作记录表格
- 设置页壳层、未保存守卫、后台图片上传
- Admin OpenAPI 生成物与统一请求实例
- 主题色、浅/暗色、语言、时间格式、Logo、系统名称等基础设置
- Docker、Nginx、Kubernetes 部署样例与 Vitest 测试基础
- Codex / Claude Code / Cursor 共用的 AI 标准页面生成规则

## 技术栈

- React 18 + TypeScript + Vite 5
- React Router v6
- Arco Design React + `@arco-themes/react-arco-pro`
- MobX / `mobx-react-lite`
- Less / Less Modules
- Tailwind CSS v3，`preflight: false`，用于 Arco 标准组件之外的布局与装饰
- `@umijs/openapi` 生成 Admin 网关接口
- Vitest + Testing Library + jsdom

## 目录结构

```text
src/
  app/           # 应用入口、Providers、路由装配、全部 icon SVG 与通用 SVG
  pages/         # 页面：login / dashboard / system / system-params / exception
  widgets/       # 后台壳层、顶栏、多页签、通用列表、详情 Drawer、设置页壳等复合 UI
  features/      # 通用交互：账号/角色/GA/个人中心/未保存守卫
  entities/      # 全局 MobX store：global-state / page-tabs / system-settings
  shared/        # api / lib / locale / config / ui
```

依赖方向：`pages -> widgets/features -> entities -> shared`。所有 icon SVG 及通用 SVG 统一放在 `src/app/assets`，允许各层直接引用其中的静态资产，但不得借此依赖 `app` 下的代码模块。禁止在 `src/` 下新增遗留根目录 `components`、`containers`、`services`、`utils`、`hooks`。

## 内置菜单

| 模块 | 路由前缀 | 说明 |
| --- | --- | --- |
| 首页看板 | `/dashboard` | 基础工作台，业务可自行填充 |
| 系统 | `/system/*` | 后台账号、角色、操作日志 |
| 系统参数 | `/system-params/settings` | 系统名称 / Logo / 默认语言 / 时间格式 / IP 白名单开关 |

## 业务扩展

1. 在 `src/shared/config/routes.ts` 追加菜单路由。
2. 新增 `src/pages/<route.key>/index.tsx`。
3. 用户交互流程拆到 `src/features/<feature-name>`。
4. 可复用复合 UI 拆到 `src/widgets/<widget-name>`。
5. 跨页面状态放到 `src/entities/<entity-name>`。
6. 业务文案放 `src/shared/locale/<biz>.ts`，并在 `locale/index.ts` merge。
7. 业务 API 更新 OpenAPI 后执行统一入口 `npm run openapi`；命令会读取当前项目配置生成对应接口与 typings。
8. 侧栏新一级菜单图标在 `PageLayout.getIconFromKey` 注册。

## 核心约定

- 组件决策统一遵守：组件发现 → 已有组件 → 重复 UI 抽取 → Arco Design / Arco Design Pro → 自建。
- 颜色、公共样式抽取与 Tailwind / Less 选型见 `docs/skills/css-usage/SKILL.md`。
- Figma 只读；按稿还原规则见 `docs/skills/figma-rules/SKILL.md`。
- OpenAPI 生成物 `src/shared/api/admin/**` 禁止手改。
- API 与 typings 必须按项目配置执行生成命令，具体流程见 `docs/skills/api-generation/SKILL.md`。
- 业务页 / feature 直接使用生成函数与 `AdminAPI` 字段名，避免新增业务字段映射层。
- 普通任务严格限定用户点名范围；OpenAPI 工作流的完整生成与现有调用方同步范围见 `docs/skills/api-generation/SKILL.md`。

## 常用命令

```bash
npm install
cp .env.example .env
npm run openapi
npm run dev
npm run build
npm test
npm run lint
npm run typecheck
```

本地开发通过 `VITE_API_BASE_URL` 指定网关。

`npm run openapi` 会读取当前项目的 OpenAPI 输入、生成配置和环境变量，因此同一命令可用于框架及采用不同接口配置的派生项目。
