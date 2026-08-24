---
name: api-generation
description: Generate or refresh API clients and API typings from the repository's configured OpenAPI workflow. Use when API schemas, generated request functions, or generated type declarations change; never manually edit generated API or typings files.
---

# API Generation Skill

本 skill 用于新增、更新或检查 API 客户端与 API typings。所有接口函数和接口类型定义都必须由仓库配置的生成链路产出，不允许手工维护生成文件。

## 核心约束

- 统一执行 `npm run openapi`；该命令读取当前项目的脚本、环境变量和 OpenAPI 配置，生成对应接口与 typings。
- 执行前读取项目配置，确认输入源、命名空间和输出目录；不绕过统一入口直接调用底层生成器。
- 生成的 API 函数、索引和 typings 全部只读，禁止手改。
- 接口契约有误时修改 OpenAPI 源；生成行为有误时修改生成配置；随后重新执行生成命令。
- 不在业务代码中复制、重定义或维护一套平行的接口类型。

如果 OpenAPI 源由后端或外部系统维护，且本次任务未授权修改该来源，应明确反馈契约问题并等待源更新；不得改远程源，也不得手工修补生成物。

## 当前仓库配置

开始任务时仍需读取这些文件，以实际内容为准：

| 用途 | 当前文件 |
| --- | --- |
| 统一生成命令 | `package.json` |
| OpenAPI 生成配置 | `.openapi2tsrc.ts` |
| YAML 输入与 JSON 转换 | `scripts/convert-yaml-to-json.mjs` |
| 环境输入示例 | `.env.example` 的 `OPENAPI_YAML_URL` |
| 中间 schema | `openapi.json`，由转换脚本生成且被 git ignore |
| API 与 typings 输出 | `.openapi2tsrc.ts` 的 `serversPath + projectName` |

当前完整命令是：

```bash
npm run openapi
```

`npm run openapi` 是框架与派生项目的统一生成入口，不是写死 schema、命名或输出路径的固定生成结果。命令会按当前项目的 `package.json` 脚本、`.openapi2tsrc.ts`、转换脚本及环境变量读取配置，再生成该项目对应的 API 和 typings。

该命令依次执行：

```text
OpenAPI YAML -> openapi.json -> openapi2ts -> src/shared/api/admin/**
```

当前输出包含请求函数、`index.ts` 和全局 `AdminAPI` 类型声明 `typings.d.ts`。派生项目仍执行 `npm run openapi`，具体 schema、命名、请求实例和输出目录以派生项目当前配置为准，不硬套这里的路径。

## 输入源优先级

当前转换脚本按以下顺序选择 OpenAPI YAML：

1. 命令行参数。
2. `OPENAPI_YAML_URL` 环境变量或 `.env`。
3. 脚本中的默认远程地址。

使用项目已经提供的输入方式。例如需要指定本地 schema 时，通过现有脚本参数或环境变量传入，不手工编辑生成的 `openapi.json`。

## 生成流程

1. 执行 `git status --short`，识别当前未提交改动。
2. 读取 `package.json`、OpenAPI 配置和转换脚本，确认完整命令、schema 输入、`serversPath`、`projectName`、`namespace`、请求库和文件命名 hook。
3. 根据任务选择已配置的 OpenAPI 输入源。
4. 执行统一完整生成命令 `npm run openapi`，由命令读取当前项目配置。
5. 检查 schema、API 文件、索引与 typings 的生成差异，不手工裁剪或修补生成结果。
6. 运行 `npm run typecheck`；页面或 feature 受接口变化影响时，再按任务范围运行相关测试或构建。
7. 按下文“业务代码同步范围”和 `docs/skills/admin-page/SKILL.md` 同步受影响的现有页面或生成新增页面。

如果生成命令需要访问远程 schema，但网络不可用，应报告生成未完成；禁止根据记忆手写接口或 typings 作为替代。

## 生成物边界

当前配置的生成目录是 `src/shared/api/admin/**`，包括：

- 各 tag 对应的 API 请求函数文件。
- 自动生成的 `index.ts`。
- 自动生成的 `typings.d.ts` 与 `AdminAPI` 命名空间。

对生成目录禁止：

- 手工新增、删除、重命名或编辑接口函数。
- 手工修改参数、返回值、注释、导入、函数名或请求路径。
- 手工修改 `typings.d.ts` 中的字段、可选性、枚举、联合类型或命名空间。
- 格式化生成文件、清理生成注释或调整生成代码风格。
- 为通过 TypeScript 检查而直接放宽生成类型。

生成物异常时按来源修复：

| 问题 | 修改位置 |
| --- | --- |
| 接口路径、字段、请求或响应契约错误 | OpenAPI YAML 源 |
| tag 到文件名不符合项目语义 | `.openapi2tsrc.ts` 的命名 hook |
| 输出目录、命名空间、请求实例错误 | `.openapi2tsrc.ts` |
| schema 来源或转换失败 | 转换脚本、参数或 `OPENAPI_YAML_URL` 配置 |

修改配置是生成链路变更，必须重新执行完整生成命令验证结果。

## 业务代码使用

- 页面和 feature 直接导入生成函数。
- Form、Table、state 和请求体使用生成的 `AdminAPI` 字段名，不增加接口字段映射层。
- 可以用 `Pick`、`Omit`、索引访问类型等方式派生局部 UI 类型，但不能复制字段后冒充 API 契约。
- 纯 UI 状态可以定义本地类型，例如 Drawer 可见性、当前 Tab 或本地 loading；不要把它写进生成 typings。未接线字段仅允许使用 `admin-page` 定义的完整 Figma 专项例外。
- 组合请求写在 `pages` / `features`，不要写回生成目录。

## 增量与变更检查

- 生成前若输出目录已有未提交改动，先确认它们是否来自上一轮生成；不确定时不要直接覆盖用户改动。
- 完整生成可能带出多个 schema 变更，不手工删除“看起来无关”的生成 diff。
- 已有接口签名变化时，同步检查调用参数、响应读取、空值处理、类型引用和相关测试。
- 新增接口需要生成页面时，继续读取 `admin-page`、`component-usage` 和 `css-usage`。

### 业务代码同步范围

生成物和业务代码使用不同的范围判定：

1. `src/shared/api/admin/**`、索引和 typings 是一次完整生成单元，保留生成器产生的全部确定性差异，不按单个页面裁剪。
2. 任务提供具体 PRD、完整可读 Figma 地址，或明确点名页面、路由、接口、代码文件时，只同步该目标及完成它所必需的直接依赖。
3. 没有具体 PRD、Figma 或点名目标时，遵循现有代码：通过路由、生成函数 import、调用参数和类型引用定位现有调用方，同步接口变化直接影响的页面 / feature。
4. 新增接口没有现有调用方时，按 `admin-page` 和现有路由、组件、locale 模式生成对应页面与必要配套文件。
5. 上述完整生成和直接调用方同步属于 OpenAPI 工作流的必要范围，不视为“顺手扩修同类问题”；无调用关系的页面和无关工程债仍不得修改。

## 完成检查

- 是否依据当前项目配置执行了完整生成命令。
- API 函数、索引和 typings 是否全部来自生成器。
- 是否没有手工改动生成目录或 `openapi.json`。
- OpenAPI 契约与生成配置的变更是否落在正确源文件。
- 是否检查了完整生成 diff，并按具体 PRD / Figma / 点名目标或现有调用关系完成业务代码同步。
- 是否通过 typecheck 及任务所需验证。
