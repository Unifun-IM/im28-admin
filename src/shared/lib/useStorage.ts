import { useCallback, useEffect, useState } from 'react';

import { isSSR } from '@shared/lib/is';

const getDefaultStorage = (key: string) => {
  if (!isSSR) {
    return localStorage.getItem(key);
  }
  return undefined;
};

function useStorage(
  key: string,
  defaultValue?: string
): [string, (value: string) => void, () => void] {
  const [storedValue, setStoredValue] = useState(
    getDefaultStorage(key) || defaultValue || ''
  );

  const setStorageValue = useCallback(
    (value: string) => {
      if (!isSSR) {
        localStorage.setItem(key, value);
        setStoredValue((prev) => (value !== prev ? value : prev));
      }
    },
    [key]
  );

  const removeStorage = useCallback(() => {
    if (!isSSR) {
      localStorage.removeItem(key);
    }
  }, [key]);

  useEffect(() => {
    const storageValue = localStorage.getItem(key);
    if (storageValue) {
      setStoredValue(storageValue);
    }
  }, [key]);

  return [storedValue, setStorageValue, removeStorage];
}

export default useStorage;
