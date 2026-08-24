---
name: ai-code
description: Common entry skill for Codex, Claude Code, Cursor, and other AI coding tools working in this admin scaffold. Routes agents to shared project rules and task-specific skills without duplicating tool-specific instructions.
---

# AI Code Tools Skill

本 skill 是本仓库给各类 AI code 工具使用的统一入口。

适用对象：

- Codex
- Claude Code
- Cursor
- 其它能读取仓库 Markdown 约定的 AI 编码助手

工具私有文件只做加载入口，不保存规则正文：

| 工具 | 入口 |
| --- | --- |
| Codex | `AGENTS.md` |
| Claude Code | `.claude/CLAUDE.md` |
| Cursor | `.cursor/rules/*.mdc` |

## 使用方式

进入仓库或开始任务时，先按任务类型读取对应 skill。

| 任务类型 | 读取 |
| --- | --- |
| 了解脚手架现有能力、扩展边界、内置组件/页面/API/部署支持 | `docs/skills/scaffold-support/SKILL.md` |
| 任意代码修改、样式修改、接口对接、Figma 对照、资源处理 | `docs/skills/project-rules/SKILL.md` |
| 新增或调整后台列表页、搜索条件、表格列、详情 Drawer、详情内操作记录 | `docs/skills/admin-page/SKILL.md` |

如果任务同时命中多类，先读 `project-rules`，再读具体业务 skill。

## 通用原则

- 本仓库是管理后台通用脚手架，不含具体业务域页面。
- 每次任务按增量处理：先查看当前未提交 git 状态，保护用户已有改动。
- 只处理用户明确点名的范围，不自行扩到同类问题或全仓追溯。
- OpenAPI 生成物禁止手改；接口能力不足时保留 PRD / 既有 UI 交互。
- UI 优先 Arco Design / Arco Design Pro 标准组件；Tailwind 只做补位。
- Figma 只读，对齐代码到设计稿，禁止写入或编辑 Figma。

## 维护约定

- 规则正文放在 `docs/skills/**/SKILL.md`。
- 工具入口文件只引用 skill 路径，不复制正文。
- 新增专项规则时，优先新增 `docs/skills/<skill-name>/SKILL.md`，再在本文件的路由表补入口。
- 如果某条规则对所有任务都生效，放进 `project-rules`；如果只针对某类页面或工作流，放进专项 skill。
