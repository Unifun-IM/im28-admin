/**
 * openapi2ts 配置
 *
 * 使用方式：
 *   npm run openapi
 *   OPENAPI_YAML_URL=https://... npm run openapi
 *
 * 生成目录：src/shared/api/admin（禁止手改；业务直接引用生成函数）
 *
 * 文档来源：OPENAPI_YAML_URL 或
 *   https://im-api-gateway.djftech.app/docs/admin/openapi.yaml
 */

import { resolve } from 'node:path';
import type { GenerateServiceProps } from '@umijs/openapi';

/** OpenAPI tag → 生成文件名 */
const TAG_FILE_MAP: Record<string, string> = {
  'Admin-认证': 'auth',
  'Admin-系统用户': 'systemUsers',
  'Admin-角色权限': 'rbac',
  'Admin-用户管理': 'users',
  'Admin-群管理': 'groups',
  'Admin-平台配置': 'platform',
  'Admin-消息追踪': 'messages',
  'System-健康检查': 'health'
};

const config: GenerateServiceProps = {
  schemaPath: resolve(process.cwd(), 'openapi.json'),
  requestLibPath: "import request from '@shared/api/request'",
  serversPath: './src/shared/api',
  projectName: 'admin',
  namespace: 'AdminAPI',
  isCamelCase: true,
  hook: {
    customFileNames(operationObject) {
      const tag = operationObject.tags?.[0];
      if (tag && TAG_FILE_MAP[tag]) {
        return [TAG_FILE_MAP[tag]];
      }
      return;
    }
  }
};

export default config;
