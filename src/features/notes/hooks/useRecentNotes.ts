import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { notesService } from "@/features/notes/services/notesService";

export function useRecentNotes(max = 5) {
  const { user } = useAuth();
  const uid = user?.uid;

  const query = useQuery({
    queryKey: ["notes", "recent", uid, max],
    queryFn: () => notesService.listRecentNotes(uid as string, max),
    enabled: !!uid,
  });

  return {
    notes: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
