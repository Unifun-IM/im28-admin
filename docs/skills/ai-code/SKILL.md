---
name: ai-code
description: Common entry skill for Codex, Claude Code, Cursor, and other AI coding tools working in this admin framework. Routes agents to shared project rules and task-specific skills without duplicating tool-specific instructions.
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
| Cursor | `.cursor/rules/ai-code.mdc` |

## 使用方式

进入仓库或开始任务时，先按任务类型读取对应 skill。

| 任务类型 | 读取 |
| --- | --- |
| 了解项目定位、公共索引、内置能力、目录、扩展流程、常用命令 | `docs/framework-guide.md` |
| 了解后台框架现有能力、扩展边界、内置组件/页面/API/部署支持 | `docs/skills/framework-support/SKILL.md` |
| 任意代码修改、样式修改、接口对接、资源处理 | `docs/skills/project-rules/SKILL.md` |
| OpenAPI schema、API 请求函数、API typings 生成或更新 | `docs/skills/api-generation/SKILL.md` |
| CSS、颜色、主题变量、公共样式抽取、Tailwind / Less 选型 | `docs/skills/css-usage/SKILL.md` |
| Figma 只读对照、按稿还原、像素级验证、Figma 自定义 SVG 资源 | `docs/skills/figma-rules/SKILL.md` |
| 生成页面时复用项目组件、正确使用 Arco、抽取相似通用 UI | `docs/skills/component-usage/SKILL.md` |
| 页面使用图标、侧栏菜单图标、Figma 自定义 SVG、SVG 资产归属决策 | `docs/skills/svg-icon-usage/SKILL.md` |
| 根据完整 Figma 地址、PRD、生成接口新增或调整后台列表页、搜索条件、表格列、详情 Drawer、详情内操作记录 | `docs/skills/admin-page/SKILL.md` |

如果任务同时命中多类，先读 `project-rules`，再读对应专项 skill，最后读具体业务 skill。涉及接口或类型生成时补读 `api-generation`；新增或修改页面样式时补读 `css-usage`；页面任务提供完整 Figma 地址时补读 `figma-rules`，并按 `admin-page` 执行 Figma > PRD > 生成接口的信息优先级；涉及菜单图标、按钮图标、空态插画或 SVG 资产时补读 `svg-icon-usage`。

## 通用原则

- 本仓库是管理后台基础框架，内置基础通用功能，并支持 AI 按规范生成标准后台页面。
- 每次任务按增量处理：先查看当前未提交 git 状态，保护用户已有改动。
- 普通任务只处理用户明确点名的范围；OpenAPI 生成保留完整生成物，有具体 PRD / Figma / 点名目标时同步该目标，没有时沿现有调用关系同步直接受影响代码。
- OpenAPI 生成物禁止手改，API 与 typings 通过项目配置命令生成。
- 组件决策统一遵守“组件发现 → 已有组件 → 重复 UI 抽取 → Arco Design / Arco Design Pro → 自建”；Tailwind 只做样式补位。
- Figma 只读，对齐代码到设计稿，禁止写入或编辑 Figma。

## 维护约定

- 规则正文放在 `docs/skills/**/SKILL.md`。
- 工具入口文件只引用 skill 路径，不复制正文。
- 新增专项规则时，优先新增 `docs/skills/<skill-name>/SKILL.md`，再在本文件的路由表补入口。
- 如果某条规则对所有任务都生效，放进 `project-rules`；如果只针对某类页面或工作流，放进专项 skill。
