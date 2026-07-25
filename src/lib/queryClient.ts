import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 2, // 2 minutes — Firestore reads aren't free
      gcTime: 1000 * 60 * 30, // keep cached data 30 minutes for offline viewing
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export const queryKeys = {
  notes: {
    all: ["notes"] as const,
    list: (folderId?: string) => ["notes", "list", folderId ?? "all"] as const,
    detail: (noteId: string) => ["notes", "detail", noteId] as const,
    search: (query: string, mode: "normal" | "semantic") =>
      ["notes", "search", mode, query] as const,
  },
  folders: {
    all: ["folders"] as const,
  },
  user: {
    profile: (uid: string) => ["user", "profile", uid] as const,
  },
} as const;
