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

## AI Code 使用机制

Codex、Cursor、Claude Code 使用同一套仓库规则生成和维护页面，不分别维护实现约定：

| 工具 | 工具入口 |
| --- | --- |
| Codex | `AGENTS.md` |
| Cursor | `.cursor/rules/ai-code.mdc` |
| Claude Code | `.claude/CLAUDE.md` |

三个工具共用一套角色契约与 [ai-code router](docs/skills/ai-code/SKILL.md)，不复制规则或预加载全部文档。`AGENTS.md` 负责技术执行入口，Router 会保护工作树、归一必要上下文，再为当前任务选择一个主 skill。

| 角色 | 决策文档 | 负责 |
| --- | --- | --- |
| 产品经理 | [PROJECT.md](PROJECT.md) | 产品目标、范围、信息架构、术语和验收边界 |
| 设计总监 | [DESIGN.md](DESIGN.md) | 信息层级、视觉语言、交互体验和响应式方向 |
| 技术负责人 | [AGENTS.md](AGENTS.md) | 变更范围、实现路由、架构约束和质量闭环 |

### 最短链路

1. 技术负责人理解当前输入，只读取点名或与目标直接相关的 PRD、Figma、代码和接口。
2. 产品经理阶段：由 [project-context](docs/skills/project-context/SKILL.md) 把稳定产品要求增量归一到 [PROJECT.md](PROJECT.md)。
3. 设计总监阶段：由 [design-system](docs/skills/design-system/SKILL.md) 基于最新 `PROJECT.md` 把稳定设计要求增量归一到 [DESIGN.md](DESIGN.md)。
4. 技术负责人阶段：选择一个主 skill 生成代码；页面任务由 [admin-page](docs/skills/admin-page/SKILL.md) 主导，并按需补读 API、组件、CSS、Figma 或资源 skill。
5. 技术负责人按改动风险运行类型、测试、构建和浏览器验证，最后检查 diff 与用户点名范围。

普通修复、单页临时要求和纯 API 生成不重写 `PROJECT.md` / `DESIGN.md`。上下文文件只保存跨页面、后续任务仍有效的已确认结论。

### 最佳实践

- **一个入口，一个主 skill**：从 `ai-code` 路由，不一次性加载全部 skills；主 skill 明确需要时才增加专项上下文。
- **先决策再实现**：`PROJECT.md` 以产品经理视角回答做什么，`DESIGN.md` 以设计总监视角回答如何呈现，`AGENTS.md` 以技术负责人视角组织工程落地；任一角色都不越权补写其它角色的未知决策。
- **尊重权威来源**：页面字段与来源优先级只看 `admin-page`；Figma 读取和还原只看 `figma-rules`；不要在 README 或其它 skill 复制精确顺序。
- **接口生成优先**：API 和 typings 只通过 `npm run openapi` 更新，生成物、同步范围和失败处理只看 `api-generation`，不手改类型兜底。
- **项目组件优先**：按 `component-usage` 完成组件发现、复用和抽取，再使用 Arco；列宽、Drawer 和关系钻取沿用公共契约。
- **设计与实现分离**：现有组件和页面不是设计上限；先由 `DESIGN.md` 和 `design-system` 确定符合产品目标、项目规范和通用原则的交互，再由 `component-usage` 决定复用、扩展、抽取或自建，样式实现交给 `css-usage`。
- **保持增量**：先检查未提交改动，只修改点名目标和必要直接依赖；不把邻近问题、文档清理或重构顺手扩入任务。
- **验证真实结果**：类型和测试不能替代浏览器检查。可见 UI 需要验证目标视口、主题、最长文案、滚动、弹层和关键交互。
- **文档也要去重**：新规则只写入唯一归属 skill；其它文件使用链接。发现冲突时先确定所有者，再删除旧副本。

完整路由和规则归属见 [ai-code](docs/skills/ai-code/SKILL.md)。

## 文档入口

| 内容 | 文档 |
| --- | --- |
| 产品经理：项目定位、业务边界、术语与产品约束 | [PROJECT.md](PROJECT.md) |
| 设计总监：设计目标、体验与视觉差异 | [DESIGN.md](DESIGN.md) |
| 技术负责人：工程执行入口与职责编排 | [AGENTS.md](AGENTS.md) |
| 项目公共说明 | [docs/framework-guide.md](docs/framework-guide.md) |
| 框架能力清单 | [docs/skills/framework-support/SKILL.md](docs/skills/framework-support/SKILL.md) |
| AI code tools 统一入口 | [docs/skills/ai-code/SKILL.md](docs/skills/ai-code/SKILL.md) |
| 通用项目规则 | [docs/skills/project-rules/SKILL.md](docs/skills/project-rules/SKILL.md) |
| 文字需求 / PRD 到项目上下文 | [docs/skills/project-context/SKILL.md](docs/skills/project-context/SKILL.md) |
| 技术栈、工具链与依赖边界 | [docs/skills/tech-stack/SKILL.md](docs/skills/tech-stack/SKILL.md) |
| 设计语言、尺度与响应式 | [docs/skills/design-system/SKILL.md](docs/skills/design-system/SKILL.md) |
| API 与 typings 生成 | [docs/skills/api-generation/SKILL.md](docs/skills/api-generation/SKILL.md) |
| CSS、主题与 Tailwind | [docs/skills/css-usage/SKILL.md](docs/skills/css-usage/SKILL.md) |
| Figma 规则 | [docs/skills/figma-rules/SKILL.md](docs/skills/figma-rules/SKILL.md) |
| SVG 与图标 | [docs/skills/svg-icon-usage/SKILL.md](docs/skills/svg-icon-usage/SKILL.md) |
| 组件选择、Arco 最佳使用与抽取 | [docs/skills/component-usage/SKILL.md](docs/skills/component-usage/SKILL.md) |
| 页面生成 | [docs/skills/admin-page/SKILL.md](docs/skills/admin-page/SKILL.md) |

Codex / Cursor / Claude Code 入口分别见 `AGENTS.md`、`.cursor/rules/ai-code.mdc`、`.claude/CLAUDE.md`。
