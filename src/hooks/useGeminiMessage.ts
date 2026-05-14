"use client";

import { useMutation } from "@tanstack/react-query";
import {
  generateMessage,
  improveMessage,
} from "@/services/gemini.service";

export function useGenerateMessage() {
  return useMutation({
    mutationFn: generateMessage,
  });
}

export function useImproveMessage() {
  return useMutation({
    mutationFn: improveMessage,
  });
}
