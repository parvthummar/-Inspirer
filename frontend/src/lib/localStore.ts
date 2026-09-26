import { useCallback, useSyncExternalStore } from "react";

/**
 * Small shared state kept in localStorage, for dummy flows (deploys, GitHub, agent settings).
 * Every component reading the same key re-renders when it changes. Storage failures are ignored,
 * so the flow still works for the current session in private windows.
 */

const cache = new Map<string, unknown>();
const listeners = new Set<() => void>();

function read<T>(key: string): T | null {
  if (cache.has(key)) return cache.get(key) as T | null;
  let value: T | null = null;
  try {
    const raw = localStorage.getItem(key);
    value = raw ? (JSON.parse(raw) as T) : null;
  } catch {
    value = null;
  }
  cache.set(key, value);
  return value;
}

export function writeLocal<T>(key: string, value: T | null) {
  cache.set(key, value);
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Not critical: the value is still kept in memory for this session.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useLocalState<T>(key: string): [T | null, (value: T | null) => void] {
  const value = useSyncExternalStore(subscribe, () => read<T>(key));
  const set = useCallback((next: T | null) => writeLocal(key, next), [key]);
  return [value, set];
}
