import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Checkbox, Input, Spin } from '@arco-design/web-react';
import { IconDown, IconSearch } from '@arco-design/web-react/icon';
import cs from 'classnames';
import useLocale from '@shared/lib/useLocale';
import {
  collectAllPermKeys,
  collectModuleKeys,
  type PermModule,
  type PermResource
} from '../model/permTree';

export type PermissionConfigProps = {
  value?: string[];
  onChange?: (keys: string[]) => void;
  /** 由 postV1AdminPermissionsList 拼装的模块树 */
  modules?: PermModule[];
  loading?: boolean;
};

function matchKeyword(title: string, kw: string) {
  if (!kw) return true;
  return title.toLowerCase().includes(kw.toLowerCase());
}

/**
 * 权限配置面板 — Figma 666:21515
 * 数据来自 permissions 列表，不再使用静态 permTree 假数据
 */
export default function PermissionConfig({
  value = [],
  onChange,
  modules = [],
  loading
}: PermissionConfigProps) {
  const t = useLocale();
  const permTitle = useCallback(
    (key: string, fallback: string) => t[`system.perm.${key}`] || fallback,
    [t]
  );

  const checked = useMemo(() => new Set(value), [value]);
  const [keyword, setKeyword] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setExpanded(
      Object.fromEntries(
        modules
          .filter((m) => !m.leaf && (m.resources?.length || 0) > 0)
          .map((m) => [m.key, true])
      )
    );
  }, [modules]);

  const allKeys = useMemo(() => collectAllPermKeys(modules), [modules]);
  const allChecked = allKeys.length > 0 && allKeys.every((k) => checked.has(k));
  const allIndeterminate = !allChecked && allKeys.some((k) => checked.has(k));

  const expandableKeys = useMemo(
    () =>
      modules
        .filter((m) => !m.leaf && (m.resources?.length || 0) > 0)
        .map((m) => m.key),
    [modules]
  );
  const allExpanded =
    expandableKeys.length > 0 &&
    expandableKeys.every((k) => expanded[k] !== false);

  const setKeys = (next: Set<string>) => {
    onChange?.(Array.from(next));
  };

  const toggleMany = (keys: string[], on: boolean) => {
    const next = new Set(checked);
    keys.forEach((k) => {
      if (on) next.add(k);
      else next.delete(k);
    });
    setKeys(next);
  };

  const filterModules = useMemo(() => {
    if (!keyword.trim()) return modules;
    const kw = keyword.trim();
    return modules
      .map((mod) => {
        const modTitle = permTitle(mod.key, mod.title);
        if (mod.leaf) {
          return matchKeyword(modTitle, kw) ? mod : null;
        }
        const resources = (mod.resources || [])
          .map((res) => {
            const resTitle = permTitle(res.key, res.title);
            const titleHit = matchKeyword(resTitle, kw);
            const actions = (res.actions || []).filter((a) =>
              matchKeyword(permTitle(a.key, a.title), kw)
            );
            if (titleHit) return res;
            if (actions.length) return { ...res, actions };
            return null;
          })
          .filter(Boolean) as PermResource[];
        if (matchKeyword(modTitle, kw) || resources.length) {
          return {
            ...mod,
            resources: matchKeyword(modTitle, kw) ? mod.resources : resources
          };
        }
        return null;
      })
      .filter(Boolean) as PermModule[];
  }, [keyword, modules, permTitle]);

  useEffect(() => {
    if (!keyword.trim()) return;
    setExpanded((prev) => {
      const next = { ...prev };
      filterModules.forEach((mod) => {
        if (!mod.leaf && (mod.resources?.length || 0) > 0) {
          next[mod.key] = true;
        }
      });
      return next;
    });
  }, [keyword, filterModules]);

  const renderResource = (res: PermResource) => {
    const actionKeys = (res.actions || []).map((a) => a.key);
    const resKeys =
      res.id != null
        ? [res.key, ...actionKeys]
        : actionKeys.length
        ? actionKeys
        : res.key
        ? [res.key]
        : [];
    const resAll = resKeys.length > 0 && resKeys.every((k) => checked.has(k));
    const resSome = !resAll && resKeys.some((k) => checked.has(k));

    return (
      <div
        key={res.key}
        className="box-border flex min-w-0 max-w-full items-start gap-3 border-0 border-b border-dashed border-[var(--color-border-2)] bg-[var(--color-fill-1,#f7f8fa)] py-2 pl-[46px] pr-4 last:border-b-0 max-md:flex-col max-md:pl-4"
      >
        <div className="flex w-[240px] shrink-0 items-center gap-3 border-0 border-r border-solid border-[var(--color-border-2)] pr-3 max-md:w-full max-md:border-r-0 max-md:pr-0">
          <Checkbox
            checked={resAll}
            indeterminate={resSome}
            disabled={!resKeys.length}
            onChange={(v) => toggleMany(resKeys, v)}
          />
          <span className="truncate text-sm text-arco-text-2">
            {permTitle(res.key, res.title)}
          </span>
        </div>
        {res.actions?.length ? (
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">
            {res.actions.map((a) => (
              <Checkbox
                key={a.key}
                className="max-w-full"
                checked={checked.has(a.key)}
                onChange={(v) => {
                  const next = new Set(checked);
                  if (v) {
                    next.add(a.key);
                    if (res.id != null) next.add(res.key);
                  } else {
                    next.delete(a.key);
                    if (res.id != null) {
                      const still = (res.actions || []).some(
                        (x) => x.key !== a.key && next.has(x.key)
                      );
                      if (!still) next.delete(res.key);
                    }
                  }
                  setKeys(next);
                }}
              >
                <span className="break-words text-sm text-arco-text-2">
                  {permTitle(a.key, a.title)}
                </span>
              </Checkbox>
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="use-role-perm-config min-w-0 max-w-full overflow-hidden rounded-lg border border-solid border-[var(--color-border-2)] bg-[var(--color-bg-2,#fff)]">
      <div className="flex items-center justify-between gap-3 border-0 border-b border-solid border-[var(--color-border-2)] px-4 py-2 max-md:items-start max-md:flex-col">
        <div className="flex min-w-0 flex-1 items-center gap-3 max-md:w-full max-md:flex-wrap">
          <Input
            allowClear
            placeholder={t['createRole.perm.search']}
            prefix={<IconSearch className="text-arco-text-3" />}
            value={keyword}
            onChange={setKeyword}
            className="max-w-[240px] max-md:max-w-none"
            disabled={loading}
          />
          <Checkbox
            checked={allChecked}
            indeterminate={allIndeterminate}
            disabled={!allKeys.length || loading}
            onChange={(v) => toggleMany(allKeys, v)}
          >
            {t['createRole.perm.selectAll']}
          </Checkbox>
        </div>
        <button
          type="button"
          disabled={!expandableKeys.length || loading}
          className="shrink-0 cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-primary disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => {
            const nextOpen = !allExpanded;
            setExpanded(
              Object.fromEntries(expandableKeys.map((k) => [k, nextOpen]))
            );
          }}
        >
          {allExpanded
            ? t['createRole.perm.collapseAll']
            : t['createRole.perm.expandAll']}
        </button>
      </div>

      <div className="use-role-perm-scroll box-border max-h-[360px] w-full min-w-0 max-w-full overflow-x-hidden overflow-y-auto">
        {loading ? (
          <div className="flex justify-center px-4 py-10">
            <Spin />
          </div>
        ) : filterModules.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-arco-text-3">
            {t['common.empty']}
          </div>
        ) : (
          filterModules.map((mod, index) => {
            const keys = collectModuleKeys(mod);
            const modAll = keys.length > 0 && keys.every((k) => checked.has(k));
            const modSome = !modAll && keys.some((k) => checked.has(k));
            const open = expanded[mod.key] !== false;
            const hasChildren = !mod.leaf && (mod.resources?.length || 0) > 0;
            const selectedCount = keys.filter((k) => checked.has(k)).length;
            const isLast = index === filterModules.length - 1;

            return (
              <div key={mod.key} className="min-w-0 max-w-full">
                <div
                  className={cs(
                    'box-border flex min-w-0 max-w-full items-center justify-between border-0 border-b border-solid border-[var(--color-border-2)] bg-[var(--color-bg-2,#fff)] px-4 py-2',
                    isLast && (!hasChildren || !open) && 'border-b-0'
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Checkbox
                      checked={modAll}
                      indeterminate={modSome}
                      disabled={!keys.length}
                      onChange={(v) => toggleMany(keys, v)}
                    />
                    <span className="truncate text-sm font-medium text-arco-text-1">
                      {permTitle(mod.key, mod.title)}
                    </span>
                  </div>
                  {hasChildren ? (
                    <button
                      type="button"
                      className="inline-flex shrink-0 cursor-pointer items-center gap-4 border-0 bg-transparent p-0 text-sm font-medium text-arco-text-3"
                      onClick={() =>
                        setExpanded((s) => ({ ...s, [mod.key]: !open }))
                      }
                    >
                      <span>
                        {selectedCount}/{keys.length}
                      </span>
                      <IconDown
                        className={cs(
                          'text-[16px] transition-transform',
                          open && 'rotate-180'
                        )}
                      />
                    </button>
                  ) : null}
                </div>
                {hasChildren && open
                  ? (mod.resources || []).map(renderResource)
                  : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
