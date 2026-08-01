import { useCallback, useEffect, useState } from 'react';
import { useBlocker } from 'react-router-dom';

export type UnsavedDiscardMode = 'navigate' | 'reset' | null;

/**
 * 未保存离开拦截：
 * - 切换菜单 / 返回上一页：useBlocker
 * - 关闭浏览器/标签：beforeunload
 * - 未修改：不拦截
 */
export function useUnsavedChangesGuard(dirty: boolean) {
  const [discardMode, setDiscardMode] = useState<UnsavedDiscardMode>(null);
  const blocker = useBlocker(dirty);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      setDiscardMode('navigate');
    }
  }, [blocker.state]);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const openResetConfirm = useCallback(() => {
    if (!dirty) return false;
    setDiscardMode('reset');
    return true;
  }, [dirty]);

  const stay = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.reset?.();
    }
    setDiscardMode(null);
  }, [blocker]);

  const leave = useCallback(() => {
    const mode = discardMode;
    setDiscardMode(null);
    if (mode === 'navigate' && blocker.state === 'blocked') {
      blocker.proceed?.();
    }
    return mode;
  }, [blocker, discardMode]);

  return {
    visible: discardMode != null,
    discardMode,
    openResetConfirm,
    stay,
    leave
  };
}
