# admin-scaffold Agent 入口

本仓库是包含基础后台能力与 AI 标准页面生成规范的管理后台框架。

开始任务只读取 `docs/skills/ai-code/SKILL.md`，由它加载公共规则、项目上下文和当前任务所需的最小专项 skill。

规则正文不在工具入口重复维护。Codex 使用本文件，Cursor 使用 `.cursor/rules/ai-code.mdc`，Claude Code 使用 `.claude/CLAUDE.md`。
