---
name: api-generation
description: Generate API clients and AdminAPI typings through the repository-configured OpenAPI command, keep generated files read-only, and synchronize directly affected business code.
---

# API Generation

## 不可变规则

- 统一执行 `npm run openapi`；它会读取当前项目配置、环境变量和输入源。
- API 函数、索引、`typings.d.ts` 和 `AdminAPI` 命名空间全部由生成器维护，禁止手改或格式化。
- 契约错误修改 OpenAPI 源；命名 / 输出 / 请求实例错误修改生成配置；随后重新完整生成。
- 不在业务代码复制一套接口类型或字段映射层。
- 远程源不在任务授权范围时，只报告契约问题，不能修改远程源或补丁生成物。

## 当前配置入口

| 用途 | 文件 |
| --- | --- |
| 命令 | `package.json` |
| 生成配置 | `.openapi2tsrc.ts` |
| YAML 转 JSON | `scripts/convert-yaml-to-json.mjs` |
| 环境输入 | `.env.example` 的 `OPENAPI_YAML_URL` |
| 中间 schema | `openapi.json`，git ignored |
| 默认输出 | `src/shared/api/admin/**` |

输入优先级由转换脚本决定，当前为：命令行参数 -> `OPENAPI_YAML_URL` / `.env`。未配置输入源时命令应明确失败；派生项目仍执行同一命令，但 schema、命名空间、请求实例和输出目录以其当前配置为准。

## 工作流

1. 执行 `git status --short`，识别生成目录中的已有改动。
2. 读取命令、生成配置和转换脚本，确认输入、输出、namespace、请求库与命名 hook。
3. 通过项目已有参数或环境变量选择输入源。
4. 执行：

   ```bash
   npm run openapi
   ```

5. 检查 schema、API 文件、索引和 typings 的完整 diff，不手工裁剪生成结果。
6. 运行 `npm run typecheck`，并按影响范围运行测试 / 构建。
7. 同步直接受影响的业务调用方；需要落页时继续按 `admin-page` 执行。

远程 schema 不可访问时报告未完成，不能根据记忆手写接口。

## 生成物边界

生成目录中禁止：

- 新增、删除、重命名或编辑请求函数和索引。
- 修改参数、返回值、字段可选性、枚举、注释或路径。
- 为通过类型检查而放宽生成类型。
- 手改 `openapi.json` 或清理生成代码风格。

问题归属：

| 问题 | 修改 |
| --- | --- |
| 路径、字段、请求 / 响应契约 | OpenAPI 源 |
| tag 文件名 | `.openapi2tsrc.ts` 命名 hook |
| 输出、namespace、请求实例 | `.openapi2tsrc.ts` |
| schema 来源 / 转换 | 脚本、参数、环境变量 |

## 业务代码

- 页面和 feature 直接使用生成函数及 `AdminAPI` 字段名。
- 局部 UI 类型可用 `Pick`、`Omit` 和索引访问类型派生；纯 UI 状态使用本地类型。
- 组合请求写在 pages / features，不写回生成目录。
- 已有接口签名变化时检查参数、响应读取、空值、类型引用和测试。

同步范围：

1. 生成目录保留全部确定性生成差异。
2. 有 PRD、完整 Figma、点名页面 / 路由 / 接口 / 文件时，只同步该目标和必要直接依赖。
3. 没有明确目标时，沿路由、生成函数 import 和类型引用同步直接调用方。
4. 无调用方的新接口只有构成独立业务页面时才落页；详情、创建、更新、动作、上传、鉴权和记录接口不单独落页。

## 验收

- 命令和输入是否来自当前项目配置。
- 生成文件是否完全由生成器产出。
- 契约 / 配置问题是否修改了正确源。
- 完整生成 diff 和直接调用方是否已检查。
- typecheck 与任务所需测试 / 构建是否通过。
