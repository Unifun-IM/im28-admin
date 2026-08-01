import common from "./common";
import login from "./login";
import exception from "./exception";
import user from "./user";
import session from "./session";
import system from "./system";
import openim from "./openim";

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
 * - 业务：login / user / session / system / exception
 * - openim：与 OpenIM SDK 对齐的枚举文案
 */
const i18n = mergeLocale(
  common,
  login,
  exception,
  user,
  session,
  system,
  openim
);

export default i18n;
