# im-admin

IM 管理后台。项目基于最新 `admin-scaffold` 框架结构，包含通用后台能力、IM 业务功能，以及面向 AI Code 生成和维护标准页面的统一规则。

完整框架说明见 [docs/framework-guide.md](docs/framework-guide.md)；能力清单见 [docs/skills/framework-support/SKILL.md](docs/skills/framework-support/SKILL.md)。

## 快速开始

```bash
npm install
cp .env.example .env
npm run openapi
npm run dev
```

常用质量检查：

```bash
npm run build
npm test
npm run lint
npm run typecheck
```

`npm run openapi` 会读取当前项目配置，生成 `src/shared/api/admin` 下的 API 和 typings。生成文件不可手动修改。

本地通过 `VITE_API_BASE_URL` 指定网关；生产环境通过 `BACKEND_URL` 指定上游，默认 `http://im28-api-gateway:8080`。

## AI Code 页面生成

Codex、Cursor、Claude Code 共用同一套仓库规则，不分别维护页面实现约定：

| 工具 | 入口 |
| --- | --- |
| Codex | `AGENTS.md` |
| Cursor | `.cursor/rules/ai-code.mdc` |
| Claude Code | `.claude/CLAUDE.md` |

工具入口先加载 [docs/skills/ai-code/SKILL.md](docs/skills/ai-code/SKILL.md)，再按任务读取最小专项 skill。页面生成和更新流程：

1. 检查未提交改动、现有路由、组件和 API 调用关系，执行增量修改。
2. 按“完整可读 Figma > PRD > 生成接口 > 现有模式”确定字段、导航和交互。
3. API / typings 只通过 `npm run openapi` 生成；接口变化时同步直接受影响的现有页面。
4. 按“组件发现 > 已有组件 > 重复 UI 抽取 > Arco > 自建”生成列表、详情和操作流程。
5. 在浏览器验证路由、主题、列宽、Drawer、资源加载和关键交互。

完整规则见 [admin-page](docs/skills/admin-page/SKILL.md)、[component-usage](docs/skills/component-usage/SKILL.md) 和 [api-generation](docs/skills/api-generation/SKILL.md)。

## IM 业务范围

| 模块 | 路由 | 能力 |
| --- | --- | --- |
| 首页 | `/dashboard` | 运营看板 |
| 用户 | `/user/*` | 用户查询、黑白名单、用户日志、统一用户详情 |
| 群组 | `/group/*` | 群组查询、群组设置、群组与成员详情 |
| 会话 | `/session/*` | 单聊/群聊会话查询、会话设置、只读聊天记录 |
| 系统 | `/system/*`、`/system-params/settings` | 后台账号、角色、参数和操作日志 |
| 风控 | `/risk/*` | IP 黑名单 |
| 交易 | `/trade/*` | 红包记录、配置和详情；当前菜单隐藏 |

业务接口直接使用 `@shared/api/admin/*` 生成函数与 `AdminAPI` 类型，不在页面层映射接口字段。图片上传统一通过 `@shared/lib/uploadAdminImage`。

## 目录结构

```text
src/
  app/           # 应用入口、Provider、路由和全局样式
  assets/        # icon、common 与按 route key 组织的页面静态资源
  pages/         # 页面与路由入口
  widgets/       # 跨页面复合 UI
  features/      # 用户操作与业务流程
  entities/      # 业务实体和 MobX 状态
  shared/        # 生成 API、基础库、locale、配置和通用 UI
```

## 文档索引

| 内容 | 文档 |
| --- | --- |
| 框架说明 | [docs/framework-guide.md](docs/framework-guide.md) |
| 框架能力 | [docs/skills/framework-support/SKILL.md](docs/skills/framework-support/SKILL.md) |
| AI Code 路由 | [docs/skills/ai-code/SKILL.md](docs/skills/ai-code/SKILL.md) |
| 项目规则 | [docs/skills/project-rules/SKILL.md](docs/skills/project-rules/SKILL.md) |
| 页面生成 | [docs/skills/admin-page/SKILL.md](docs/skills/admin-page/SKILL.md) |
| API 生成 | [docs/skills/api-generation/SKILL.md](docs/skills/api-generation/SKILL.md) |
| 组件与 Arco | [docs/skills/component-usage/SKILL.md](docs/skills/component-usage/SKILL.md) |
| CSS、主题与 Tailwind | [docs/skills/css-usage/SKILL.md](docs/skills/css-usage/SKILL.md) |
| Figma | [docs/skills/figma-rules/SKILL.md](docs/skills/figma-rules/SKILL.md) |
| SVG 与静态资源 | [docs/skills/svg-icon-usage/SKILL.md](docs/skills/svg-icon-usage/SKILL.md) |
| IM 消息类型 | [docs/消息类型说明.md](docs/消息类型说明.md) |
