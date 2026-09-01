---
name: project-context
description: Act as the product-manager context layer by synthesizing explicit requirements and relevant PRDs into durable product decisions in PROJECT.md before design or implementation.
---

# Project Context

本 skill 承担产品经理的上下文维护职责，只负责把输入需求归一为 `PROJECT.md` 中可持续复用的产品决策。视觉规范由设计总监角色的 `design-system` 生成到 `DESIGN.md`，工程落地由 `AGENTS.md` 路由后续专项 skill 处理。

## 触发条件

以下信息会持续影响多个页面或后续生成任务时，先使用本 skill：

- 项目定位、目标用户、核心任务或业务边界
- 导航树、模块归属、路由层级或业务术语
- 跨页面流程、权限边界、数据可见性或统一文案原则
- 新增或修改的 `prd.md`、产品说明或用户明确要求

单页字段、局部间距、一次性交互和纯代码修复不重写 `PROJECT.md`，但生成代码前仍需读取现有上下文。

## 输入识别

1. 先理解当前用户文字输入，明确本次变更范围和用户纠正。
2. 读取用户点名的 PRD；未点名但仓库存在 `prd.md` / `PRD.md` 时，只读取与目标模块语义相关的文件。
3. 读取现有 `PROJECT.md`，以增量方式合并已确认要求。
4. 路由、代码和生成接口只用于验证现状，不反向虚构产品需求。

多个来源冲突时，当前用户明确要求高于旧 PRD 和旧 `PROJECT.md`。页面可见字段的精确来源优先级只由 `admin-page` 定义。

## PROJECT.md 内容边界

把 `PROJECT.md` 当成产品经理的决策记录：回答“为谁做、为什么做、做什么、做到什么边界”，不回答“界面具体怎么画”或“代码具体怎么写”。

只记录稳定、项目特有且后续任务仍需遵守的信息：

- 产品定位、主要用户、核心目标和高频任务
- 当前范围、明确不在范围内的能力和业务边界
- 信息架构、导航顺序、模块归属和统一术语
- 跨页面业务流程、权限或数据边界
- 不能从通用 skill 推导出的项目级 AI Code 约束

禁止写入：

- 颜色、间距、圆角、组件形态和响应式等设计结论，这些进入 `DESIGN.md`
- 单页字段清单、接口签名或一次性任务说明
- FSD、OpenAPI、组件优先级等已经由通用 skill 维护的规则
- 未确认推断、占位符和大段 PRD 原文

## 增量更新

- 保留仍有效的既有事实，语义化合并重复描述。
- 新要求替代旧要求时同步删除冲突内容，不并列保留两个版本。
- 需求未涉及的章节不重写，不因模板示例扩展业务范围。
- 派生项目已有明确业务定位时，移除不再适用的模板定位。

完成 `PROJECT.md` 后，如果产品变化影响视觉方向、信息密度、页面结构、品牌或响应式策略，继续使用 `design-system` 更新 `DESIGN.md`；两份上下文一致后再进入代码生成。
