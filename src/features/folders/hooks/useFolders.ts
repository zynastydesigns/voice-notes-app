import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { folderService } from "@/features/folders/services/folderService";
import type { CreateFolderInput } from "@/types/folder";

const foldersKey = (uid: string | undefined) => ["folders", uid] as const;

export function useFolders() {
  const { user } = useAuth();
  const uid = user?.uid;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: foldersKey(uid),
    queryFn: () => folderService.listFolders(uid as string),
    enabled: !!uid,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateFolderInput) => folderService.createFolder(uid as string, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: foldersKey(uid) }),
  });

  const renameMutation = useMutation({
    mutationFn: ({ folderId, name }: { folderId: string; name: string }) =>
      folderService.renameFolder(uid as string, folderId, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: foldersKey(uid) }),
  });

  const deleteMutation = useMutation({
    mutationFn: (folderId: string) => folderService.deleteFolder(uid as string, folderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: foldersKey(uid) }),
  });

  return {
    folders: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    createFolder: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    renameFolder: renameMutation.mutateAsync,
    deleteFolder: deleteMutation.mutateAsync,
  };
}
