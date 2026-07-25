import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { profileService } from "@/features/profile/services/profileService";
import type { UserProfileDoc } from "@/types/user";

export function useUserProfile() {
  const { user } = useAuth();
  const uid = user?.uid;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["user", "profile", uid],
    queryFn: () => profileService.getProfile(uid as string),
    enabled: !!uid,
  });

  const updatePreferences = useMutation({
    mutationFn: (prefs: Partial<UserProfileDoc["preferences"]>) =>
      profileService.updatePreferences(uid as string, prefs),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user", "profile", uid] }),
  });

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    updatePreferences: updatePreferences.mutateAsync,
  };
}
