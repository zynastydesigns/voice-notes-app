import { useCallback, useState } from "react";
import { mmkv } from "@/lib/mmkv";

const KEY = "recent-searches";
const MAX_ITEMS = 8;

function readAll(): string[] {
  const raw = mmkv.getString(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useRecentSearches() {
  const [items, setItems] = useState<string[]>(() => readAll());

  const addSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setItems((prev) => {
      const next = [trimmed, ...prev.filter((t) => t.toLowerCase() !== trimmed.toLowerCase())].slice(
        0,
        MAX_ITEMS
      );
      mmkv.set(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearSearches = useCallback(() => {
    mmkv.delete(KEY);
    setItems([]);
  }, []);

  return { recentSearches: items, addSearch, clearSearches };
}
