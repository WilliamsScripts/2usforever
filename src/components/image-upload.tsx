"use client";

import { Loader2, ImagePlus } from "lucide-react";
import Image from "next/image";
import React from "react";
import { useImageUpload } from "@/hooks/useImageUpload";

interface ImageUploadProps {
  imageUrl?: string;
  onImageUpload?: (image: string) => void;
  isUploadingApi?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  imageUrl,
  onImageUpload,
  isUploadingApi,
}) => {
  const { image, isUploading, handleImageUpload } = useImageUpload({
    initialUrl: imageUrl,
    onImageUpload,
  });

  if (isUploading || isUploadingApi) {
    return (
      <div className="h-[65px] w-[65px] cursor-pointer bg-password-toggle-btn flex items-center justify-center rounded-full">
        <Loader2 className="w-4 h-4 animate-spin text-brand-main" />
      </div>
    );
  }

  return (
    <div className="h-[65px] relative w-[65px] cursor-pointer bg-password-toggle-btn flex items-center justify-center rounded-full">
      {image ? (
        <Image
          src={image}
          alt="Image"
          fill
          className="object-cover rounded-full"
        />
      ) : (
        <ImagePlus className="w-4 h-4" strokeWidth={2} />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
      />
    </div>
  );
};

export default ImageUpload;
