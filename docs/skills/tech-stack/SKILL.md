---
name: tech-stack
description: Apply this repository's established frontend runtime, state, routing, UI, styling, API generation, build, and test stack when choosing dependencies or implementation patterns.
---

# Tech Stack

本文件定义“项目使用什么技术以及各自负责什么”。页面字段与路由由 `admin-page` 决定，组件选型由 `component-usage` 决定，具体 CSS 写法由 `css-usage` 决定。

## 权威来源

- 依赖、脚本、Node 要求：`package.json`；锁定结果：`package-lock.json`。
- 构建、别名、SVGR 与测试环境：`vite.config.ts`、`tsconfig.app.json`。
- Tailwind 与主题映射：`tailwind.config.js`、`src/app/styles/theme-tokens.less`。
- API 生成配置：`.openapi2tsrc.ts`、`scripts/convert-yaml-to-json.mjs`。

本文只记录稳定技术选择；精确版本以当前 `package.json` 为准，不能根据本文中的主版本描述跳过实际核对。

## 当前基线

| 职责 | 技术 |
| --- | --- |
| 运行时 | React 18、React DOM、TypeScript、ES Modules |
| 构建 | Vite 5、`@vitejs/plugin-react`、Node.js 20+ |
| 路由 | React Router v6、`import.meta.glob` 页面发现 |
| UI | Arco Design React、Arco Design Pro 主题 |
| 状态 | MobX、`mobx-react-lite` |
| 样式 | Tailwind CSS 3（`preflight: false`）、Less、PostCSS / Autoprefixer |
| 请求与 API | Axios、FingerprintJS、`@umijs/openapi`、全局 `AdminAPI` typings |
| 测试 | Vitest 2、Testing Library、jest-dom、user-event、jsdom |
| 常用能力 | dayjs、lodash、classnames、query-string、copy-to-clipboard、NProgress |
| 可视化与加载 | BizCharts、`@loadable/component`、`vite-plugin-svgr` |

## 使用边界

- 使用 React 函数组件和 Hooks；全局或跨页面可观察状态沿用 MobX，页面私有瞬时状态使用 React state，不引入 Redux、Zustand 或另一套路由/状态框架。
- 路由继续使用 React Router v6 和现有 `routes.ts + import.meta.glob` 装配方式；不要并行建立手写路由注册体系。
- UI 继续使用项目组件和 Arco；组件优先级及 Arco 契约见 `component-usage`。
- 普通布局使用 Tailwind，复杂 Arco 选择器使用 Less；视觉与响应式基线见 `design-system`，颜色与实现规则见 `css-usage`。不得开启 Tailwind preflight。
- 网络请求复用 `src/shared/api/request.ts`；Admin API 与 typings 只通过 `npm run openapi` 生成，具体流程见 `api-generation`。
- 日期、复制、查询串、进度条等优先复用已安装库和项目封装，不为已有能力引入功能重叠依赖。
- SVG 组件由 `vite-plugin-svgr` 的 `?react` 入口处理；资源目录和图标决策见 `svg-icon-usage`。
- 单元与组件测试使用 Vitest + Testing Library；浏览器行为和视觉问题仍需真实浏览器验证，不能用 jsdom 代替。

## 依赖变更

1. 先搜索现有依赖、项目封装和调用方，确认当前技术无法合理完成需求。
2. 新依赖必须解决明确缺口，并与 React 18、Vite 5、ESM 和浏览器目标兼容。
3. 未经用户明确要求，不升级主版本、不替换核心框架、不同时保留两套同职责方案。
4. 依赖变更使用 npm，并同步提交 `package.json` 与 `package-lock.json`；禁止手改 lockfile 内容。
5. 变更构建、TypeScript、ESLint、PostCSS 或 Tailwind 配置时，检查开发、测试和生产构建三条链路。

## 别名与命令

源码使用 `@app`、`@assets`、`@pages`、`@widgets`、`@features`、`@entities`、`@shared` 和 `@` 别名；FSD 依赖限制仍以 `project-rules` 为准。

```bash
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
npm run openapi
```

按改动风险运行检查；依赖、构建配置或公共技术设施变化至少执行 typecheck、测试和生产构建。
