"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/query-keys";
import { sendOtp, signOut, verifyOtp } from "@/services/auth.service";

export function useSendOtp() {
  return useMutation({
    mutationFn: (email: string) => sendOtp(email),
  });
}

export function useVerifyOtp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      email,
      token,
      next,
    }: {
      email: string;
      token: string;
      next?: string;
    }) => verifyOtp(email, token, next),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline.all });
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.timeline.all });
    },
  });
}
