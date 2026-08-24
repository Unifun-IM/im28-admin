# Claude Code 项目入口

本仓库的通用协作准则见根目录 `AGENTS.md`。该文件也是 Codex 的项目级专属入口。

AI code 工具统一入口：

- `docs/skills/ai-code/SKILL.md`

专项规则正文：

- `docs/skills/project-rules/SKILL.md`
- `docs/skills/admin-page/SKILL.md`

该文档是 Codex / Claude Code / Cursor 共用的单一来源，不在 `.claude` 下复制正文。

核心优先级：

1. 产品 `prd.md` / `PRD.md`（如果存在，优先；代码标识使用语义化英文）
2. 脚本生成的接口文件：`src/shared/api/admin/**` 与 `AdminAPI` 类型
3. 现有页面模式（只作为组件与交互参考，不自行扩面）

每次页面生成都按增量任务处理：先看当前未提交 git 状态；已有页面接口变更时同步更新既有页面，新增接口才新增对应路由、页面和配套文件。

实现时继续遵守：Arco 优先、FSD 分层、OpenAPI 生成物禁止手改、接口不完整不删 UI 交互。
