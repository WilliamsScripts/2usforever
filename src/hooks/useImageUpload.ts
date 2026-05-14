"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { CloudinaryService } from "@/services/cloudinary.service";

export function useImageUpload({
  initialUrl,
  folder = "2usforever",
  onImageUpload,
}: {
  initialUrl?: string;
  folder?: string;
  onImageUpload?: (image: string) => void;
}) {
  const [image, setImage] = useState<string | undefined>(initialUrl);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not a valid image file`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`);
        return;
      }

      try {
        setIsUploading(true);
        const result = await CloudinaryService.uploadImage(file, folder);
        setImage(result.secure_url);
        onImageUpload?.(result.secure_url);
        toast.success("Image uploaded successfully");
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image");
      } finally {
        setIsUploading(false);
      }
    },
    [folder, onImageUpload],
  );

  return { image, isUploading, handleImageUpload };
}
