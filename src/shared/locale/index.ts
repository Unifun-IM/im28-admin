import common from "./common";
import login from "./login";
import exception from "./exception";
import system from "./system";

type LocalePack = Record<string, Record<string, string>>;

function mergeLocale(...packs: LocalePack[]): LocalePack {
  const out: LocalePack = { "en-US": {}, "zh-CN": {} };
  for (const pack of packs) {
    Object.assign(out["en-US"]!, pack["en-US"] || {});
    Object.assign(out["zh-CN"]!, pack["zh-CN"] || {});
  }
  return out;
}

/**
 * i18n 统一入口
 * - common：菜单 / 壳层 / 通用文案
 * - 业务：login / system / exception
 * 具体业务 locale 包在业务仓库中追加 merge
 */
const i18n = mergeLocale(common, login, exception, system);

export default i18n;
