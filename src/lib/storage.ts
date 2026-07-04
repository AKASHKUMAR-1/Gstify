import { useCallback, useState } from 'react';

function readValue<T>(key: string, initialValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : initialValue;
  } catch {
    return initialValue;
  }
}

/**
 * Drop-in replacement for useState that also persists the value to
 * localStorage under `key`, as JSON. Every read/write of a given key
 * should go through one call to this hook so the key and its shape
 * live in exactly one place.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => readValue(key, initialValue));

  const setPersistedValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (prev: T) => T)(prev) : next;
        localStorage.setItem(key, JSON.stringify(resolved));
        return resolved;
      });
    },
    [key]
  );

  return [value, setPersistedValue] as const;
}

/** For values stored as a raw string (not JSON), e.g. 'true' / 'dark'. */
export function useLocalStorageString(key: string, initialValue: string) {
  const [value, setValue] = useState<string>(() => localStorage.getItem(key) ?? initialValue);

  const setPersistedValue = useCallback(
    (next: string) => {
      localStorage.setItem(key, next);
      setValue(next);
    },
    [key]
  );

  return [value, setPersistedValue] as const;
}

export function removeStorageKey(key: string) {
  localStorage.removeItem(key);
}
