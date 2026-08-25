---
name: ai-code
description: Route Codex, Claude Code, Cursor, and other AI coding tools to the shared project rules and the smallest relevant task-specific skill set.
---

# AI Code Skill Router

本文件是 AI code 工具的统一路由。规则正文只维护在 `docs/skills/**/SKILL.md`；`AGENTS.md`、`.claude/CLAUDE.md` 和 `.cursor/rules/ai-code.mdc` 只做入口引用。

## 加载顺序

所有代码任务先读 `docs/skills/project-rules/SKILL.md`，再按任务加载最小专项集合：

| 任务 | 加载 |
| --- | --- |
| 了解框架定位、目录、内置能力 | `docs/framework-guide.md`；需要完整能力索引时再读 `docs/skills/framework-support/SKILL.md` |
| 生成或调整后台页面、菜单、路由、列表、详情 | `docs/skills/admin-page/SKILL.md` + `docs/skills/component-usage/SKILL.md` + `docs/skills/css-usage/SKILL.md` |
| 生成或更新 API / typings | `docs/skills/api-generation/SKILL.md`；需要落页时再加 `docs/skills/admin-page/SKILL.md` |
| 修改组件或抽取重复 UI | `docs/skills/component-usage/SKILL.md`；涉及样式时加 `docs/skills/css-usage/SKILL.md` |
| Figma 还原 | `docs/skills/figma-rules/SKILL.md`；生成页面时同时读 `docs/skills/admin-page/SKILL.md` |
| 图标或 SVG | `docs/skills/svg-icon-usage/SKILL.md`；来自 Figma 时同时读 `docs/skills/figma-rules/SKILL.md` |
| 仅修改 CSS、主题、Tailwind 或 Less | `docs/skills/css-usage/SKILL.md` |

不要为普通任务一次性加载全部 skill；按实际工作增量补读。

## 规则归属

- 全局范围、FSD、不可手改边界：`project-rules`
- 页面信息来源、字段推导、路由和验收：`admin-page`
- 组件发现、Arco 使用、组件契约和列宽：`component-usage`
- API 生成链路：`api-generation`
- 样式、主题变量、Tailwind / Less：`css-usage`
- Figma 只读与视觉验证：`figma-rules`
- 图标来源和 SVG 资产：`svg-icon-usage`
- 已内置能力索引：`framework-support`

新增规则时只写入唯一归属 skill，其它文件使用链接，不复制正文。
