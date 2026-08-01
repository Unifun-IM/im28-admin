import React, { useMemo, useState } from 'react';
import { Checkbox, Input } from '@arco-design/web-react';
import { IconDown, IconSearch } from '@arco-design/web-react/icon';
import cs from 'classnames';
import useLocale from '@shared/lib/useLocale';
import {
  ROLE_PERM_MODULES,
  collectAllPermKeys,
  collectModuleKeys,
  type PermModule,
  type PermResource
} from '../model/permTree';

export type PermissionConfigProps = {
  value?: string[];
  onChange?: (keys: string[]) => void;
};

function matchKeyword(title: string, kw: string) {
  if (!kw) return true;
  return title.toLowerCase().includes(kw.toLowerCase());
}

/**
 * 权限配置面板 — Figma 666:21515
 */
export default function PermissionConfig({
  value = [],
  onChange
}: PermissionConfigProps) {
  const t = useLocale();
  const permTitle = (key: string, fallback: string) =>
    t[`system.perm.${key}`] || fallback;

  const checked = useMemo(() => new Set(value), [value]);
  const [keyword, setKeyword] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ROLE_PERM_MODULES.map((m) => [m.key, true]))
  );

  const allKeys = useMemo(() => collectAllPermKeys(), []);
  const allChecked = allKeys.length > 0 && allKeys.every((k) => checked.has(k));
  const allIndeterminate =
    !allChecked && allKeys.some((k) => checked.has(k));

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
    if (!keyword.trim()) return ROLE_PERM_MODULES;
    const kw = keyword.trim();
    return ROLE_PERM_MODULES.map((mod) => {
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
    }).filter(Boolean) as PermModule[];
  }, [keyword, t]);

  const renderResource = (res: PermResource) => {
    const actionKeys = (res.actions || []).map((a) => a.key);
    const resKeys = [res.key, ...actionKeys];
    const resAll = resKeys.every((k) => checked.has(k));
    const resSome = !resAll && resKeys.some((k) => checked.has(k));

    return (
      <div
        key={res.key}
        className="flex items-start gap-3 border-0 border-b border-dashed border-[rgba(0,0,0,0.08)] bg-[var(--color-fill-1,#f7f8fa)] py-2 pl-[46px] pr-4 last:border-b-0"
      >
        <div className="flex w-[240px] shrink-0 items-center gap-3 border-0 border-r border-solid border-[rgba(0,0,0,0.08)]">
          <Checkbox
            checked={resAll}
            indeterminate={resSome}
            onChange={(v) => toggleMany(resKeys, v)}
          />
          <span className="text-[14px] leading-[21px] text-arco-text-2">
            {permTitle(res.key, res.title)}
          </span>
        </div>
        {res.actions?.length ? (
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
            {res.actions.map((a) => (
              <Checkbox
                key={a.key}
                checked={checked.has(a.key)}
                onChange={(v) => {
                  const next = new Set(checked);
                  if (v) {
                    next.add(a.key);
                    next.add(res.key);
                  } else {
                    next.delete(a.key);
                    const still = (res.actions || []).some(
                      (x) => x.key !== a.key && next.has(x.key)
                    );
                    if (!still) next.delete(res.key);
                  }
                  setKeys(next);
                }}
              >
                <span className="text-[14px] text-arco-text-2">
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
    <div className="use-role-perm-config overflow-hidden rounded-xl border border-solid border-[rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between gap-3 border-0 border-b border-solid border-[rgba(0,0,0,0.08)] px-4 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Input
            allowClear
            placeholder={t['createRole.perm.search']}
            prefix={<IconSearch className="text-arco-text-3" />}
            value={keyword}
            onChange={setKeyword}
            className="max-w-[240px]"
          />
          <Checkbox
            checked={allChecked}
            indeterminate={allIndeterminate}
            onChange={(v) => toggleMany(allKeys, v)}
          >
            {t['createRole.perm.selectAll']}
          </Checkbox>
        </div>
        <button
          type="button"
          className="cursor-pointer border-0 bg-transparent p-0 text-[14px] font-medium leading-[21px] text-[rgb(var(--primary-6))]"
          onClick={() => {
            const next = Object.fromEntries(
              ROLE_PERM_MODULES.map((m) => [m.key, true])
            );
            setExpanded(next);
          }}
        >
          {t['createRole.perm.expandAll']}
        </button>
      </div>

      <div className="max-h-[360px] overflow-y-auto">
        {filterModules.map((mod) => {
          const keys = collectModuleKeys(mod);
          const modAll = keys.every((k) => checked.has(k));
          const modSome = !modAll && keys.some((k) => checked.has(k));
          const open = expanded[mod.key] !== false;
          const hasChildren = !mod.leaf && (mod.resources?.length || 0) > 0;

          return (
            <div key={mod.key}>
              <div
                className={cs(
                  'flex items-center justify-between border-0 border-b border-solid border-[rgba(0,0,0,0.08)] bg-[var(--color-bg-2,#fff)] px-4 py-2'
                )}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={modAll}
                    indeterminate={modSome}
                    onChange={(v) => toggleMany(keys, v)}
                  />
                  <span className="text-[14px] font-medium leading-[21px] text-arco-text-1">
                    {permTitle(mod.key, mod.title)}
                  </span>
                </div>
                {hasChildren ? (
                  <button
                    type="button"
                    className="inline-flex cursor-pointer items-center gap-4 border-0 bg-transparent p-0 text-[14px] font-medium text-arco-text-3"
                    onClick={() =>
                      setExpanded((s) => ({ ...s, [mod.key]: !open }))
                    }
                  >
                    <span>
                      {keys.filter((k) => checked.has(k)).length}/{keys.length}
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
        })}
      </div>
    </div>
  );
}
