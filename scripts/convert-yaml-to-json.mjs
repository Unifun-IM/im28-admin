#!/usr/bin/env node

/**
 * 将远程 OpenAPI YAML 转为 JSON
 *
 * 用法:
 *   npm run openapi
 *   OPENAPI_YAML_URL=https://... npm run openapi:convert
 *
 * 优先级: 命令行参数 > 环境变量 / .env > 默认远程地址
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { load as loadYaml } from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const OUTPUT_JSON_PATH = resolve(ROOT, 'openapi.json');
const DEFAULT_REMOTE_URL =
  'https://im-api-gateway.djftech.app/docs/admin/openapi.yaml';

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(resolve(ROOT, '.env'));
loadEnvFile(resolve(ROOT, '.env.example'));

function isRemoteUrl(input) {
  return (
    typeof input === 'string' &&
    (input.startsWith('http://') || input.startsWith('https://'))
  );
}

async function loadYamlText(source) {
  if (!isRemoteUrl(source)) {
    throw new Error(`仅支持远程 OpenAPI YAML: ${source}`);
  }
  console.log(`📥 正在下载 YAML: ${source}`);
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
    console.log(`✅ 转换完成：${OUTPUT_JSON_PATH}`);
    return OUTPUT_JSON_PATH;
  } catch (error) {
    console.error('❌ 转换失败:', error.message);
    process.exit(1);
  }
}

const yamlSource =
  process.argv[2] || process.env.OPENAPI_YAML_URL || DEFAULT_REMOTE_URL;

convertYamlToJson(yamlSource);
