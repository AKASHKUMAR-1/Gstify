import { useCallback, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { useLocalStorage } from './storage';

interface HasId {
  id: string;
}

/**
 * Keeps a record array persisted to a Supabase table (scoped to userId via
 * user_id) while using localStorage as an always-available offline cache.
 *
 * - Logged out: behaves exactly like useLocalStorage (no network calls).
 * - On login: fetches the user's rows from Supabase, uploads any records
 *   that were created locally before login (one-time per session), then
 *   treats Supabase as the source of truth.
 * - After login: every setItems call diffs against the previous value and
 *   upserts/deletes only the rows that actually changed.
 */
export function useSupabaseSynced<T extends HasId>(
  table: string,
  userId: string | null,
  localStorageKey: string,
  toRow: (item: T, userId: string) => Record<string, unknown>,
  fromRow: (row: Record<string, unknown>) => T
) {
  const [items, setLocalItems] = useLocalStorage<T[]>(localStorageKey, []);
  const migratedForUser = useRef<string | null>(null);

  useEffect(() => {
    if (!userId || migratedForUser.current === userId) return;

    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from(table).select('*').eq('user_id', userId);
      if (error || cancelled) return;

      const remote = (data ?? []).map(fromRow);
      const remoteIds = new Set(remote.map((r) => r.id));
      const localOnly = items.filter((i) => !remoteIds.has(i.id));

      if (localOnly.length > 0) {
        const { error: insertError } = await supabase
          .from(table)
          .insert(localOnly.map((item) => toRow(item, userId)));
        if (!insertError) remote.push(...localOnly);
      }

      migratedForUser.current = userId;
      if (!cancelled) setLocalItems(remote);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, table]);

  const setItems = useCallback(
    (next: T[] | ((prev: T[]) => T[])) => {
      setLocalItems((prev) => {
        const resolved = typeof next === 'function' ? (next as (prev: T[]) => T[])(prev) : next;

        if (userId) {
          const nextIds = new Set(resolved.map((item) => item.id));
          const removedIds = prev.filter((item) => !nextIds.has(item.id)).map((item) => item.id);
          const changed = resolved.filter((item) => {
            const before = prev.find((p) => p.id === item.id);
            return !before || JSON.stringify(before) !== JSON.stringify(item);
          });

          if (removedIds.length > 0) {
            supabase.from(table).delete().in('id', removedIds).then();
          }
          if (changed.length > 0) {
            supabase.from(table).upsert(changed.map((item) => toRow(item, userId))).then();
          }
        }

        return resolved;
      });
    },
    [userId, table, toRow, setLocalItems]
  );

  return [items, setItems] as const;
}
