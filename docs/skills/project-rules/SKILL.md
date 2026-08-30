---
name: project-rules
description: Apply repository-wide constraints for task scope, incremental changes, FSD dependencies, generated-file safety, and git behavior.
---

# Project Rules Skill

本文件只保存所有代码任务都适用的硬约束；页面、组件、API、CSS、Figma 和资源细节由对应专项 skill 负责。

## 开始任务

- 先执行 `git status --short`，识别并保护已有未提交改动。
- 阅读目标文件、公开入口和现有调用方，在当前实现上增量修改。
- 只处理用户点名范围及完成它所需的直接依赖；相关但无调用关系的问题只报告。
- 不擅自提交、切分支或推远程；用户明确要求时再执行。切分支前必须先让当前改动可恢复，用户要求提交时先提交。

## FSD 架构

- 依赖方向为 `pages -> widgets/features -> entities -> shared`；`app` 和 `src/main.tsx` 负责装配。
- 同层切片组合只能走目标 `index.ts` 公开入口；禁止深层导入、循环依赖和 widget / feature 互相依赖。
- `shared` 不依赖更高层。需要共享的业务无关能力下沉到 `shared`，跨页面复合 UI 放 `widgets`，用户动作放 `features`。
- 不在 `src/` 新增遗留根目录 `components`、`containers`、`services`、`utils`、`hooks`。

图片资源目录由 `svg-icon-usage` 定义，不把资源目录当成 FSD 代码层。

## 生成物

- 生成文件只能通过对应项目命令更新；接口生成物的边界和同步范围由 `api-generation` 定义。
