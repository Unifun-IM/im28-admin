---
name: project-rules
description: Apply repository-wide constraints for task scope, incremental changes, FSD dependencies, project-first UI, generated API files, theme safety, and git behavior.
---

# Project Rules Skill

本文件只保存所有任务都适用的硬约束；页面、组件、API、CSS、Figma 和 SVG 的细节由对应专项 skill 负责。

## 开始任务

- 先执行 `git status --short`，识别并保护已有未提交改动。
- 阅读目标文件、公开入口和现有调用方，在当前实现上增量修改。
- 只处理用户点名范围及完成它所需的直接依赖；相关但无调用关系的问题只报告。
- 不擅自提交、切分支或推远程；用户明确要求时再执行。切分支前必须先让当前改动可恢复，用户要求提交时先提交。

## UI 与架构

- 组件顺序固定为：组件发现 -> 已有组件 -> 重复 UI 抽取 -> Arco Design / Arco Design Pro -> 自建。
- 依赖方向为 `pages -> widgets/features -> entities -> shared`；`app` 和 `src/main.tsx` 负责装配。
- 同层切片组合只能走目标 `index.ts` 公开入口；禁止深层导入、循环依赖和 widget / feature 互相依赖。
- `shared` 不依赖更高层。需要共享的业务无关能力下沉到 `shared`，跨页面复合 UI 放 `widgets`，用户动作放 `features`。
- `src/assets` 是图片静态资源根目录，不属于 FSD 业务层；各层只通过 `@assets/*` 引用，不把图片散落到 `app`、`pages`、`widgets`、`features`、`entities` 或 `shared`。
- 不在 `src/` 新增遗留根目录 `components`、`containers`、`services`、`utils`、`hooks`。

组件发现、Arco 使用和抽取规则见 `component-usage`。

## 不可绕过的来源

- Figma 只读，禁止写入稿面；页面生成的信息优先级由 `admin-page` 定义。
- `src/shared/api/admin/**`、生成索引和 typings 只允许由 `npm run openapi` 生成，禁止手改。
- 新增或修改颜色必须使用主题 CSS 变量；Tailwind 保持 `preflight: false`，不得重做 Arco Form / Grid / Table。
- 图片静态资源、icon SVG 与通用 SVG 的归属和引用遵守 `svg-icon-usage`。

## OpenAPI 范围例外

- 生成目录保留生成器产生的完整确定性差异，不按单页面裁剪。
- 有 PRD、完整可读 Figma、点名页面 / 路由 / 接口 / 文件时，只同步该目标和必要直接依赖。
- 没有明确目标时，沿路由、API import 和类型引用同步直接受影响的现有调用方。
- 无调用方的新接口只有构成可独立落页的新业务能力时才生成页面；详情、动作、上传、鉴权和记录接口不单独落页。

完整流程见 `api-generation`。
