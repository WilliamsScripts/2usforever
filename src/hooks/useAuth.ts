"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/query-keys";
import {
  persistRememberDevice,
  sendOtp,
  signOut,
  verifyOtp,
} from "@/services/auth.service";
import type { SendOtpPayload, VerifyOtpPayload } from "@/types/auth";

export function useSendOtp() {
  return useMutation({
    mutationFn: (payload: SendOtpPayload) => sendOtp(payload),
  });
}

export function useVerifyOtp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VerifyOtpPayload & { rememberDevice?: boolean }) =>
      verifyOtp(payload),
    onSuccess: (_data, variables) => {
      if (variables.rememberDevice) {
        persistRememberDevice(variables.email);
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.timeline.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.timeline.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}
