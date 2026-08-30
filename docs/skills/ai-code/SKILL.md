---
name: ai-code
description: Route Codex, Claude Code, Cursor, and other AI coding tools from requirements and PRD through PROJECT.md and DESIGN.md into the smallest relevant code-generation skill set.
---

# AI Code Skill Router

本文件是 Codex、Claude Code、Cursor 和其它 AI code 工具的唯一入口。入口文件不再预加载其它文档；由本 router 按任务选择最小上下文。

## 固定启动

1. 读取 `docs/skills/project-rules/SKILL.md` 并检查未提交改动。
2. 读取 `PROJECT.md`；任务涉及可见 UI、交互或响应式时再读取 `DESIGN.md`。
3. 理解当前文字输入，读取用户点名或与目标模块直接相关的 PRD / Figma / 代码，不扫描无关需求文档。
4. 从下表选择一个主 skill；只有主 skill 明确要求或任务新增了对应工作时才补读其它 skill。

## 需求归一

当输入包含会持续影响后续任务的新需求时，先更新上下文再写代码：

1. 产品定位、范围、导航、术语或跨页面业务约束变化：使用 `project-context` 增量更新 `PROJECT.md`。
2. 可见 UI 的品牌、密度、体验或响应式方向发生稳定变化：使用 `design-system` 基于最新 `PROJECT.md` 增量更新 `DESIGN.md`。
3. 上下文一致后进入主 skill 生成代码。

普通修复、单页临时要求和纯 API 生成只读取需要的上下文，不制造 `PROJECT.md` / `DESIGN.md` diff。代码中的猜测不能反写为项目事实。

## 任务路由

每个任务优先选择一个主 skill：

| 任务 | 加载 |
| --- | --- |
| 产品需求、PRD、导航、术语、业务范围 | `docs/skills/project-context/SKILL.md` |
| 项目设计方向、品牌、密度、体验、响应式 | `docs/skills/design-system/SKILL.md` |
| 后台页面、菜单、路由、列表、详情 | `docs/skills/admin-page/SKILL.md` |
| API / typings 生成或接口变更同步 | `docs/skills/api-generation/SKILL.md` |
| 组件发现、复用、抽取、Arco、列宽 | `docs/skills/component-usage/SKILL.md` |
| CSS、主题变量、Tailwind、Less | `docs/skills/css-usage/SKILL.md` |
| Figma 读取、还原与视觉对比 | `docs/skills/figma-rules/SKILL.md` |
| 图片静态资源、SVG、图标 | `docs/skills/svg-icon-usage/SKILL.md` |
| 技术选型、依赖、构建、路由、状态、测试 | `docs/skills/tech-stack/SKILL.md` |
| 查询框架已有能力 | `docs/skills/framework-support/SKILL.md` |

后台页面通常由 `admin-page` 主导，它会在需要时引导读取组件、设计、CSS、API 或 Figma 规则。不要在 router 层一次性加载整套 skill。

## 规则归属

- 产品定位、业务信息架构、术语和稳定业务约束：`PROJECT.md`，由 `project-context` 维护
- 项目设计目标、视觉方向和稳定设计差异：`DESIGN.md`，由 `design-system` 维护
- 任务范围、增量修改、FSD 和 git：`project-rules`
- 技术基线、工具职责、依赖与构建测试边界：`tech-stack`
- 视觉语言、尺度、信息密度与响应式行为：`design-system`
- 页面信息来源、字段推导、路由和验收：`admin-page`
- 组件发现、Arco 使用、组件契约和列宽：`component-usage`
- API 生成链路：`api-generation`
- 样式、主题变量、Tailwind / Less：`css-usage`
- Figma 只读与视觉验证：`figma-rules`
- 图片静态资源归属、图标来源和 SVG 使用：`svg-icon-usage`
- 已内置能力索引：`framework-support`

规则只在唯一归属文件维护；其它入口和 skill 使用链接，不复制精确优先级、数值、目录或工作流正文。
