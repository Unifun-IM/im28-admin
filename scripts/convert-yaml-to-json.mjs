#!/usr/bin/env node

/**
 * 将远程 OpenAPI YAML 转为 JSON
 *
 * 用法:
 *   OPENAPI_YAML_URL=https://example.com/openapi.yaml npm run openapi:convert
 *   node scripts/convert-yaml-to-json.mjs https://example.com/openapi.yaml
 *
 * 优先级: 命令行参数 > 环境变量 OPENAPI_YAML_URL
 */

import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { load as loadYaml } from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_JSON_PATH = resolve(__dirname, '../openapi.json');

function isRemoteUrl(input) {
  return typeof input === 'string' && (input.startsWith('http://') || input.startsWith('https://'));
}

async function loadYamlText(source) {
  if (!isRemoteUrl(source)) {
    throw new Error(
      '仅支持远程 OpenAPI YAML。请设置 OPENAPI_YAML_URL 或传入 https://... 参数。'
    );
  }

  console.log(`📥 正在下载 YAML 文件: ${source}`);
  const response = await fetch(source);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.text();
}

async function convertYamlToJson(yamlSource) {
  try {
    const yamlText = await loadYamlText(yamlSource);
    console.log('🔄 正在转换 YAML 为 JSON...');
    const jsonData = loadYaml(yamlText);
    writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(jsonData, null, 2), 'utf8');
    console.log(`✅ 转换完成！JSON 文件已保存到: ${OUTPUT_JSON_PATH}`);
    return OUTPUT_JSON_PATH;
  } catch (error) {
    console.error('❌ 转换失败:', error.message);
    process.exit(1);
  }
}

const yamlUrl = process.argv[2] || process.env.OPENAPI_YAML_URL;

if (!yamlUrl) {
  console.error(
    '❌ 缺少 OpenAPI 地址。请设置环境变量 OPENAPI_YAML_URL，或传入远程 YAML URL 参数。\n' +
      '示例: OPENAPI_YAML_URL=https://example.com/openapi.yaml npm run openapi'
  );
  process.exit(1);
}

convertYamlToJson(yamlUrl);
