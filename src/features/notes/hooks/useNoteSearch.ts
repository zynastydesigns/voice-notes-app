import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { notesService } from "@/features/notes/services/notesService";

export function useNoteSearch(searchText: string) {
  const { user } = useAuth();
  const uid = user?.uid;
  const trimmed = searchText.trim();

  const query = useQuery({
    queryKey: ["notes", "search", uid, trimmed],
    queryFn: () => notesService.searchNotes(uid as string, trimmed),
    enabled: !!uid && trimmed.length > 0,
  });

  return {
    results: query.data ?? [],
    isLoading: query.isFetching,
  };
}
