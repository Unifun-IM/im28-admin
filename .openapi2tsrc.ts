/**
 * openapi2ts 配置
 *
 * 使用方式：
 *   OPENAPI_YAML_URL=https://... npm run openapi
 */

export default {
  // 由 scripts/convert-yaml-to-json.mjs 生成
  schemaPath: require('path').resolve(process.cwd(), 'openapi.json'),

  // 统一请求库（拦截器返回业务 body）
  requestLibPath: "import request from '@shared/api/request'",

  // 生成到 src/shared/api/*（与手写 request.ts 同层；勿删 request.ts）
  serversPath: './src/shared'
};
