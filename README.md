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

工具入口只负责加载统一路由 [docs/skills/ai-code/SKILL.md](docs/skills/ai-code/SKILL.md)，再根据任务读取页面生成、API、组件、CSS、Figma、SVG 等专项 skill。页面生成流程如下：

1. **读取增量上下文**：先检查当前未提交的 git 改动，并读取现有路由、页面、组件和 API 调用关系；在已有实现上增量修改，不覆盖或格式化无关改动。
2. **确定页面定义**：按“完整且可读取的 Figma 地址 > 当前任务 PRD > 脚本生成的 API > 现有同类页面模式”取值。Figma 或 PRD 已明确的筛选项、表格列、详情字段、Tab 和操作入口视为闭合集合；低优先级来源只补字段绑定、枚举、校验、格式和权限，不自行增加可见项。
3. **生成 API 契约**：接口或 typings 需要新增、更新时只执行 `npm run openapi`。命令会读取当前项目的脚本、环境变量和 OpenAPI 配置并生成完整结果；`src/shared/api/admin/**` 等生成物只读，禁止手工修改接口函数或类型定义。
4. **同步受影响代码**：完整保留生成器产生的确定性 API diff。任务给出具体 Figma、PRD、页面、路由、接口或文件时，只同步该目标和必要直接依赖；没有具体目标时，沿现有路由、生成函数 import 和类型引用更新直接受影响的调用方。已有接口变化更新已有页面，新增业务接口生成对应路由、页面及必要配套文件。
5. **选择和抽取组件**：统一遵循“组件发现 -> 已有组件 -> 重复 UI 抽取 -> Arco Design / Arco Design Pro -> 自建”。优先使用 `BizListPage`、筛选组件、`ActionLinks`、`BizDetailDrawer` 等项目积木；发现稳定的重复 UI 时按 FSD 抽取，再由页面复用。
6. **生成标准页面**：根据确定后的契约生成列表筛选、表格列、操作入口、详情 Drawer、locale、菜单和路由。单类详情使用纯详情展示；多接口或多类信息使用 Tab；操作记录复用 `BizDetailDrawer` / `use-biz-detail-table` 的现有样式。

完整 Figma 明确展示但接口暂缺的字段，只能使用页面生成 skill 定义的 Figma 专项例外，并在交付说明中列出接口缺口；仅有 PRD 或 API 时不生成未接线控件。具体字段推导、Drawer、Tab 和接口同步规则见 [docs/skills/admin-page/SKILL.md](docs/skills/admin-page/SKILL.md)。

## 文档入口

| 内容 | 文档 |
| --- | --- |
| 项目公共说明 | [docs/framework-guide.md](docs/framework-guide.md) |
| AI code tools 统一入口 | [docs/skills/ai-code/SKILL.md](docs/skills/ai-code/SKILL.md) |
| 通用项目规则 | [docs/skills/project-rules/SKILL.md](docs/skills/project-rules/SKILL.md) |
| API 与 typings 生成 | [docs/skills/api-generation/SKILL.md](docs/skills/api-generation/SKILL.md) |
| CSS、主题与 Tailwind | [docs/skills/css-usage/SKILL.md](docs/skills/css-usage/SKILL.md) |
| Figma 规则 | [docs/skills/figma-rules/SKILL.md](docs/skills/figma-rules/SKILL.md) |
| 组件选择、Arco 最佳使用与抽取 | [docs/skills/component-usage/SKILL.md](docs/skills/component-usage/SKILL.md) |
| 页面生成 | [docs/skills/admin-page/SKILL.md](docs/skills/admin-page/SKILL.md) |

Codex / Cursor / Claude Code 入口分别见 `AGENTS.md`、`.cursor/rules/ai-code.mdc`、`.claude/CLAUDE.md`。
