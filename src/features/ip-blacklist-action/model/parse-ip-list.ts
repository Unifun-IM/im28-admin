/** 逗号、空格、换行或分号分隔，最多返回 100 个去重 IP。 */
export function parseIpList(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/[\s,;，；]+/)
        .map((value) => value.trim())
        .filter(Boolean)
    )
  ).slice(0, 100);
}
