# Admin Framework Guide

`admin-scaffold` 是基于 Arco Design Pro Vite 精简模板演进的管理后台基础框架。它不是空白脚手架，而是内置基础通用功能，并提供面向 AI 生成标准后台页面的组件、规则与 skill 体系。

具体业务域页面由派生项目或业务迭代在本框架上扩展。

## 文档索引

| 内容 | 文档 |
| --- | --- |
| 当前项目定位、业务边界、术语与产品约束 | `PROJECT.md` |
| 当前项目设计目标、体验与视觉差异 | `DESIGN.md` |
| 框架现有能力清单 | `docs/skills/framework-support/SKILL.md` |
| AI code tools 统一入口 | `docs/skills/ai-code/SKILL.md` |
| 通用项目规则 | `docs/skills/project-rules/SKILL.md` |
| 文字需求 / PRD 到项目上下文 | `docs/skills/project-context/SKILL.md` |
| 技术栈、工具链与依赖边界 | `docs/skills/tech-stack/SKILL.md` |
| 设计语言、尺度与响应式 | `docs/skills/design-system/SKILL.md` |
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

技术基线、各工具职责、依赖变更边界和质量命令统一维护在 `docs/skills/tech-stack/SKILL.md`；精确依赖版本以 `package.json` 和 `package-lock.json` 为准。

## 目录结构

```text
src/
  app/           # 应用入口、Providers、路由装配与全局样式
  assets/        # 图片静态资源：icon / common / 按页面组织的目录
  pages/         # 页面：login / dashboard / system / system-params / exception
  widgets/       # 后台壳层、顶栏、多页签、通用列表、详情 Drawer、设置页壳等复合 UI
  features/      # 通用交互：账号/角色/GA/个人中心/未保存守卫
  entities/      # 全局 MobX store：global-state / page-tabs / system-settings
  shared/        # api / lib / locale / config / ui
```

依赖方向：`pages -> widgets/features -> entities -> shared`。`src/main.tsx` 属于 app 装配入口，可以导入 `@app` 的样式与公开模块。widget 组合其它 widget、feature 复用其它 feature 时只能通过目标切片的 `index.ts` 公开入口；禁止同层深层导入、循环依赖，以及 widget 与 feature 互相依赖。图片静态资源统一放在 `src/assets`，各层通过 `@assets/*` 引用；图标放 `icon`，跨页面公共资源放 `common`，其余按页面路由组织。禁止在 `src/` 下新增遗留根目录 `components`、`containers`、`services`、`utils`、`hooks`。

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

- AI code 的启动、上下文归一和最小 skill 路由见 `docs/skills/ai-code/SKILL.md`。
- 任务范围、增量修改、FSD 与 git 约束见 `docs/skills/project-rules/SKILL.md`。
- 页面来源、导航、字段和落页流程见 `docs/skills/admin-page/SKILL.md`。
- 设计、组件、CSS、API、Figma 和静态资源分别由对应专项 skill 维护，本文不复制规则正文。

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
