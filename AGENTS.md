# im-admin — Agent 准则

给 AI / 协作者的项目约定。改代码前先遵守下列规则；细节以 `README.md` 为准。

## 参考基线：Arco Design Pro

本仓库能力源自 [Arco Design Pro](https://github.com/arco-design/arco-design-pro) 的 **Vite 精简模板**（`arco-design-pro-vite`），官方站点 [pro.arco.design](https://pro.arco.design)。

实现 / 对照问题时优先参考上游：

- 布局壳层（Navbar / Menu / Settings 抽屉）、主题切换、Mock、i18n、权限包装等 Pro 惯例
- 组件用法与主题变量以 [Arco Design React](https://arco.design/react/docs/start) + Pro 主题包为准

本仓库相对上游的刻意差异（不要「还原成官方脚手架」）：

- 目录按 **FSD** 重组，不是 Pro 默认的 `src/pages` + 扁平结构
- 状态用 **MobX**，不是 Pro 常见的 Redux / context-only 方案
- 样式为 **Arco + Tailwind（关 Preflight）+ Less Modules** 并存，不是纯 Less
- 业务菜单与视觉以 **Figma 业务1.0** 为准，演示页（workplace 等）可不挂菜单

不确定交互或布局惯例时：先查 Pro Vite 模板对应实现，再按上表差异落到本仓库分层。

## 技术栈

- React 18 + TypeScript + Vite 5 + React Router v6
- UI：**Arco Design**（`@arco-design/web-react` + `@arco-themes/react-arco-pro`）
- 状态：**MobX** / `mobx-react-lite`（不要引入 Redux）
- 样式：**Tailwind CSS v3**（布局/间距）+ **Less Modules**（Arco 深度覆盖）
- 路径别名：`@app` / `@pages` / `@widgets` / `@features` / `@entities` / `@shared`

## FSD 目录

```text
src/app | pages | widgets | features | entities | shared
```

- 禁止在 `src/` 下新建 `components`、`containers`、`services`、`utils`、`hooks` 等遗留根目录
- 页面放 `pages/`；可复用复合 UI 放 `widgets/`；跨页实体与全局 store 放 `entities/`；通用能力放 `shared/`
- 依赖方向：`pages → widgets/features → entities → shared`，禁止反向依赖

## Arco × Tailwind × Less

| 职责 | 用什么 |
| --- | --- |
| 交互组件、表单、表格、弹层、菜单等 | **Arco** |
| 页面壳层布局、flex/grid、间距微调、原子类 | **Tailwind** |
| 深度覆盖 Arco 内部 DOM（`:global(.arco-*)`） | **Less Modules** |

硬性约束：

1. **`preflight: false`**（`tailwind.config.js`），禁止打开，避免冲掉 Arco 基础样式
2. **不要用 Tailwind 全面替换** Arco 主题 / 组件内部样式；不要无 prefix 搞两套工具类体系（当前无 prefix）
3. 主题色走 `applyThemeColor` + `settings.json` 的 `themeColor`（默认 `#635CFF`），映射到 `--arcoblue-*` / `--primary-6`；Tailwind 品牌色对齐这些 token
4. 样式入口顺序：`arco.css` → `tailwind.css` → `global.less`（见 `src/main.tsx`）
5. 新写布局优先 Tailwind；已有 Arco `:global` 覆盖（筛选栏、表格、侧栏等）继续留在对应 `.module.less`，不要为「统一」强行迁移

## UI / 业务

- 视觉与交互以 Figma「IM管理后台 / 业务1.0」为准；壳层侧栏展开 **240px**、收起 **56px**
- 通用列表积木复用 `@widgets/biz-list`（`SearchFilterBar` / `DataSummary` / `BizListPage` / `TableBatchBar`）
- 文案默认中文；需要 i18n 时走现有 `locale` 模式

## API / Mock

- 业务接口现阶段：`@shared/api/biz` + `shared/mock/biz.ts`（前缀 `/api/biz/...`）
- OpenAPI 生成物在 `shared/api/user.ts` 等，**不要手改**；手写 axios 单例 `shared/api/request.ts` 勿删
- 页面尽量只依赖 `@shared/api/*`，便于日后用生成客户端替换 mock

## 改动边界

- 只改任务相关文件；不顺手大重构、不批量「格式化无关文件」
- 不擅自提交 git / 推远程；用户明确要求再提交
- 新增依赖前先说明理由；UI 库以 Arco 为准，不要再引入第二套组件库
