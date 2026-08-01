/** 角色权限树：由 postV1AdminPermissionsList 扁平权限按 key 层级拼装 */

export type PermAction = {
  key: string;
  title: string;
  id: number;
};

export type PermResource = {
  key: string;
  title: string;
  /** 资源自身对应权限 id；仅有 actions 时可能为空 */
  id?: number;
  leaf?: boolean;
  actions?: PermAction[];
};

export type PermModule = {
  key: string;
  title: string;
  id?: number;
  leaf?: boolean;
  resources?: PermResource[];
};

type ResAcc = {
  key: string;
  title: string;
  id?: number;
  actions: PermAction[];
};

type ModAcc = {
  key: string;
  title: string;
  id?: number;
  resources: Map<string, ResAcc>;
};

/**
 * 将权限列表按 key 点分层级：
 * - `a` → 模块叶子
 * - `a.b` → 模块 a 下资源
 * - `a.b.c` → 资源 a.b 下操作
 */
export function buildPermModules(
  list: AdminAPI.SysPermission[]
): PermModule[] {
  const modules = new Map<string, ModAcc>();

  const ensureMod = (key: string, title: string, id?: number) => {
    let mod = modules.get(key);
    if (!mod) {
      mod = { key, title, id, resources: new Map() };
      modules.set(key, mod);
      return mod;
    }
    if (id != null) mod.id = id;
    if (title && title !== key) mod.title = title;
    return mod;
  };

  const ensureRes = (mod: ModAcc, key: string, title: string, id?: number) => {
    let res = mod.resources.get(key);
    if (!res) {
      res = { key, title, id, actions: [] };
      mod.resources.set(key, res);
      return res;
    }
    if (id != null) res.id = id;
    if (title && title !== key) res.title = title;
    return res;
  };

  (list || []).forEach((p) => {
    const key = p.key?.trim();
    if (!key || p.is_enable === false) return;
    const title = (p.name || key).trim();
    const id = p.id;
    const parts = key.split('.').filter(Boolean);
    if (!parts.length) return;

    if (parts.length === 1) {
      ensureMod(parts[0], title, id);
      return;
    }

    if (parts.length === 2) {
      const mod = ensureMod(parts[0], parts[0]);
      ensureRes(mod, key, title, id);
      return;
    }

    const mod = ensureMod(parts[0], parts[0]);
    const resKey = `${parts[0]}.${parts[1]}`;
    const res = ensureRes(mod, resKey, resKey);
    if (id != null) {
      res.actions.push({ key, title, id });
    }
  });

  return Array.from(modules.values()).map((mod) => {
    const resources = Array.from(mod.resources.values()).map((res) => {
      if (res.actions.length) {
        return {
          key: res.key,
          title: res.title,
          id: res.id,
          actions: res.actions
        } satisfies PermResource;
      }
      return {
        key: res.key,
        title: res.title,
        id: res.id,
        leaf: true
      } satisfies PermResource;
    });

    if (!resources.length) {
      return {
        key: mod.key,
        title: mod.title,
        id: mod.id,
        leaf: true
      } satisfies PermModule;
    }

    return {
      key: mod.key,
      title: mod.title,
      id: mod.id,
      resources
    } satisfies PermModule;
  });
}

/** 模块下可勾选的权限 key（仅接口真实存在的节点） */
export function collectModuleKeys(mod: PermModule): string[] {
  if (mod.leaf) return mod.id != null ? [mod.key] : [];
  const keys: string[] = [];
  if (mod.id != null) keys.push(mod.key);
  (mod.resources || []).forEach((res) => {
    if (res.id != null) keys.push(res.key);
    (res.actions || []).forEach((a) => keys.push(a.key));
  });
  return keys;
}

export function collectAllPermKeys(modules: PermModule[]): string[] {
  return modules.flatMap(collectModuleKeys);
}
