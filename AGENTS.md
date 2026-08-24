# admin-scaffold — Agent 入口

本仓库是管理后台基础框架：内置登录鉴权、后台壳层、系统管理、通用列表/详情积木、设置页能力与 AI 标准页面生成 skill。公共项目说明见 `docs/framework-guide.md`。

## 必读入口

改代码前先读：

- `docs/framework-guide.md`
- `docs/skills/ai-code/SKILL.md`
- `docs/skills/project-rules/SKILL.md`

按任务补读：

- Figma / 按稿 / 像素级 / 设计 token：`docs/skills/figma-rules/SKILL.md`
- CSS / 主题颜色 / 公共样式 / Tailwind：`docs/skills/css-usage/SKILL.md`
- OpenAPI / API / typings 生成：`docs/skills/api-generation/SKILL.md`
- 页面组件选择：`docs/skills/component-usage/SKILL.md`
- SVG / 菜单图标 / Figma 图标：`docs/skills/svg-icon-usage/SKILL.md`
- 后台列表 / 详情页生成：`docs/skills/admin-page/SKILL.md`
- 框架能力清单：`docs/skills/framework-support/SKILL.md`

工具侧只做薄引用，避免重复维护：Codex 使用本文件，Cursor 使用 `.cursor/rules/ai-code.mdc`，Claude Code 使用 `.claude/CLAUDE.md`。

## 硬性约束

- 组件决策统一遵守：组件发现 → 已有组件 → 重复 UI 抽取 → Arco Design / Arco Design Pro → 自建。
- Figma 只读，禁止写入或编辑稿面。
- 生成页面时，完整可读 Figma 地址 > PRD > 脚本生成接口；高优先级来源明确列出的字段、列、Tab 和操作是闭合集合，低优先级来源只补实现信息，不追加可见项。
- 非标准组件才强制像素级布局。
- OpenAPI 生成的 API 与 typings 禁止手改，只能按配置执行命令重新生成。
- FSD 同层组合仅通过切片公开入口：widget 可组合 widget，feature 可复用 feature；禁止深层导入、循环依赖以及 widget / feature 互相依赖。
- 普通任务严格限定点名范围；OpenAPI 生成物保留完整结果，业务代码有具体 PRD / Figma / 点名目标时同步该目标，没有时沿现有调用关系同步直接受影响代码；仅可独立落页的新业务能力自动生成页面。
- 不擅自提交 git / 推远程；用户明确要求再提交。
