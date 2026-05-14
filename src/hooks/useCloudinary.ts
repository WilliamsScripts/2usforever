"use client";

import { useMutation } from "@tanstack/react-query";
import { CloudinaryService } from "@/services/cloudinary.service";

export function useDeleteCloudinaryImage() {
  return useMutation({
    mutationFn: (publicId: string) => CloudinaryService.deleteImage(publicId),
  });
}
