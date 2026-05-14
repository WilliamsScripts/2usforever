"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CloudinaryService } from "@/services/cloudinary.service";
import { useDeleteCloudinaryImage } from "@/hooks/useCloudinary";
import type { ImageItem, UploadResult } from "@/types/cloudinary";

type UseCloudinaryImagePickerOptions = {
  maxImages?: number;
  folder?: string;
  initialImages?: string[];
  onImagesChange?: (images: UploadResult[]) => void;
};

function toUploadResult(image: ImageItem): UploadResult {
  return {
    public_id: image.publicId!,
    secure_url: image.url,
    width: 0,
    height: 0,
    format: "jpg",
    bytes: 0,
  };
}

function collectUploadedImages(
  oldImages: ImageItem[],
  images: ImageItem[],
): UploadResult[] {
  return [
    ...oldImages
      .filter((img) => img.publicId)
      .map((img) => toUploadResult(img)),
    ...images
      .filter((img) => img.publicId)
      .map((img) => toUploadResult(img)),
  ];
}

export function useCloudinaryImagePicker({
  maxImages = 10,
  folder = "padisquare",
  initialImages = [],
  onImagesChange,
}: UseCloudinaryImagePickerOptions) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [oldImages, setOldImages] = useState<ImageItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const deleteImageMutation = useDeleteCloudinaryImage();

  useEffect(() => {
    const processedImages = initialImages.map((url, index) => {
      const urlParts = url.split("/");
      const lastPart = urlParts[urlParts.length - 1];
      const publicId = lastPart.split(".")[0];

      return {
        id: `initial-${index}-${publicId}`,
        url,
        publicId,
      };
    });

    setOldImages(processedImages);
  }, [initialImages]);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const fileArray = Array.from(files);
      const validFiles = fileArray.filter((file) => {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not a valid image file`);
          return false;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum size is 10MB`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      const totalCurrentImages = images.length + oldImages.length;
      const remainingSlots = maxImages - totalCurrentImages;
      const filesToUpload = validFiles.slice(0, remainingSlots);

      if (validFiles.length > remainingSlots) {
        toast.warning(`Only ${remainingSlots} more images can be uploaded`);
      }

      const newImageItems: ImageItem[] = filesToUpload.map((file) => ({
        id: `temp-${Date.now()}-${Math.random()}`,
        file,
        url: URL.createObjectURL(file),
        isUploading: true,
        uploadProgress: 0,
      }));

      setImages((prev) => [...prev, ...newImageItems]);

      try {
        const uploadPromises = filesToUpload.map(async (file, index) => {
          const tempId = newImageItems[index].id;

          try {
            const result = await CloudinaryService.uploadImage(
              file,
              folder,
              (progress) => {
                setImages((prev) =>
                  prev.map((img) =>
                    img.id === tempId
                      ? { ...img, uploadProgress: progress.percentage }
                      : img,
                  ),
                );
              },
            );

            setImages((prev) =>
              prev.map((img) =>
                img.id === tempId
                  ? {
                      ...img,
                      url: result.secure_url,
                      publicId: result.public_id,
                      isUploading: false,
                      uploadProgress: 100,
                    }
                  : img,
              ),
            );

            return result;
          } catch (error) {
            setImages((prev) =>
              prev.map((img) =>
                img.id === tempId
                  ? {
                      ...img,
                      isUploading: false,
                      error:
                        error instanceof Error
                          ? error.message
                          : "Upload failed",
                    }
                  : img,
              ),
            );
            throw error;
          }
        });

        const results = await Promise.allSettled(uploadPromises);
        const successfulUploads = results
          .filter(
            (result): result is PromiseFulfilledResult<UploadResult> =>
              result.status === "fulfilled",
          )
          .map((result) => result.value);

        if (successfulUploads.length > 0) {
          const uploadedImageItems: ImageItem[] = successfulUploads.map(
            (r) => ({
              id: `initial-${r.public_id}`,
              url: r.secure_url,
              publicId: r.public_id,
            }),
          );

          setOldImages((prev) => {
            const next = [...prev, ...uploadedImageItems];
            onImagesChange?.([
              ...next.map((img) => toUploadResult(img)),
              ...images
                .filter((img) => img.publicId)
                .map((img) => toUploadResult(img)),
            ]);
            return next;
          });

          setImages((prev) =>
            prev.filter(
              (img) =>
                !successfulUploads.some((s) => s.public_id === img.publicId),
            ),
          );

          toast.success(
            `${successfulUploads.length} image(s) uploaded successfully`,
          );
        }

        const failedUploads = results.filter(
          (result) => result.status === "rejected",
        ).length;

        if (failedUploads > 0) {
          toast.error(`${failedUploads} image(s) failed to upload`);
        }
      } catch {
        toast.error("Failed to upload images");
      }
    },
    [images, oldImages, maxImages, folder, onImagesChange],
  );

  const deleteImage = useCallback(
    async (imageId: string, publicId: string | undefined, source: "old" | "new") => {
      if (source === "old") {
        setOldImages((prev) => prev.filter((img) => img.id !== imageId));
      } else {
        setImages((prev) => prev.filter((img) => img.id !== imageId));
      }

      if (publicId) {
        try {
          await deleteImageMutation.mutateAsync(publicId);
          toast.success("Image deleted successfully");
        } catch {
          toast.error("Failed to delete image from server");
        }
      }

      const remainingOld =
        source === "old"
          ? oldImages.filter((img) => img.id !== imageId)
          : oldImages;
      const remainingNew =
        source === "new"
          ? images.filter((img) => img.id !== imageId)
          : images;

      onImagesChange?.(collectUploadedImages(remainingOld, remainingNew));
    },
    [deleteImageMutation, images, oldImages, onImagesChange],
  );

  const handleDeleteOldImage = useCallback(
    (imageId: string, publicId?: string) =>
      deleteImage(imageId, publicId, "old"),
    [deleteImage],
  );

  const handleDeleteNewImage = useCallback(
    (imageId: string, publicId?: string) =>
      deleteImage(imageId, publicId, "new"),
    [deleteImage],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    void handleFileSelect(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const totalImages = images.length + oldImages.length;
  const canAddMore = totalImages < maxImages;

  return {
    images,
    oldImages,
    fileInputRef,
    totalImages,
    canAddMore,
    handleInputChange,
    handleDeleteOldImage,
    handleDeleteNewImage,
  };
}
