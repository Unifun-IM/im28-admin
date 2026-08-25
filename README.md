# admin-scaffold

管理后台基础框架。内置基础通用功能，并提供面向 AI 生成标准后台页面的组件、规则与 skill 体系。

完整项目说明见 [docs/framework-guide.md](docs/framework-guide.md)；框架能力清单见 [docs/skills/framework-support/SKILL.md](docs/skills/framework-support/SKILL.md)。

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

`npm run openapi` 是统一生成入口，会读取当前项目配置生成对应的 API 与 typings。

## AI Code 页面生成机制

Codex、Cursor、Claude Code 使用同一套仓库规则生成和维护页面，不分别维护实现约定：

| 工具 | 工具入口 |
| --- | --- |
| Codex | `AGENTS.md` |
| Cursor | `.cursor/rules/ai-code.mdc` |
| Claude Code | `.claude/CLAUDE.md` |

工具入口只加载统一路由 [docs/skills/ai-code/SKILL.md](docs/skills/ai-code/SKILL.md)，再按任务读取最小专项 skill。标准页面生成机制：

1. 检查未提交改动和现有路由、组件、API 调用关系，做增量修改。
2. 按“完整可读 Figma > PRD > 生成接口 > 现有模式”确定闭合的可见信息集合。
3. API / typings 只通过 `npm run openapi` 生成，并同步直接受影响的现有调用方。
4. 按项目组件优先级生成路由、列表、详情与 locale，并在浏览器验证最终组件接入、列宽、Drawer 和交互。

完整规则见 [admin-page](docs/skills/admin-page/SKILL.md)、[component-usage](docs/skills/component-usage/SKILL.md) 与 [api-generation](docs/skills/api-generation/SKILL.md)。

## 文档入口

| 内容 | 文档 |
| --- | --- |
| 项目公共说明 | [docs/framework-guide.md](docs/framework-guide.md) |
| 框架能力清单 | [docs/skills/framework-support/SKILL.md](docs/skills/framework-support/SKILL.md) |
| AI code tools 统一入口 | [docs/skills/ai-code/SKILL.md](docs/skills/ai-code/SKILL.md) |
| 通用项目规则 | [docs/skills/project-rules/SKILL.md](docs/skills/project-rules/SKILL.md) |
| API 与 typings 生成 | [docs/skills/api-generation/SKILL.md](docs/skills/api-generation/SKILL.md) |
| CSS、主题与 Tailwind | [docs/skills/css-usage/SKILL.md](docs/skills/css-usage/SKILL.md) |
| Figma 规则 | [docs/skills/figma-rules/SKILL.md](docs/skills/figma-rules/SKILL.md) |
| SVG 与图标 | [docs/skills/svg-icon-usage/SKILL.md](docs/skills/svg-icon-usage/SKILL.md) |
| 组件选择、Arco 最佳使用与抽取 | [docs/skills/component-usage/SKILL.md](docs/skills/component-usage/SKILL.md) |
| 页面生成 | [docs/skills/admin-page/SKILL.md](docs/skills/admin-page/SKILL.md) |

Codex / Cursor / Claude Code 入口分别见 `AGENTS.md`、`.cursor/rules/ai-code.mdc`、`.claude/CLAUDE.md`。
