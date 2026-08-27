# admin-scaffold Agent 入口

本仓库是包含基础后台能力与 AI 标准页面生成规范的管理后台框架。

开始代码任务前读取：

- `docs/framework-guide.md`
- `docs/skills/ai-code/SKILL.md`
- `docs/skills/project-rules/SKILL.md`

再按 `ai-code` 的任务路由加载最小专项 skill；不要一次性加载全部文档。

规则正文只维护在 `docs/skills/**/SKILL.md`。Codex 使用本文件，Cursor 使用 `.cursor/rules/ai-code.mdc`，Claude Code 使用 `.claude/CLAUDE.md`；工具入口不复制专项规则。
