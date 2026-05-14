"use client";

import { ImagePlus, X, Upload, AlertCircle } from "lucide-react";
import React from "react";
import Image from "next/image";
import { useCloudinaryImagePicker } from "@/hooks/useCloudinaryImagePicker";
import type { ImageItem, UploadResult } from "@/types/cloudinary";

interface CustomImagePickerProps {
  maxImages?: number;
  folder?: string;
  onImagesChange?: (images: UploadResult[]) => void;
  initialImages?: string[];
  className?: string;
  error?: string;
}

const CustomImagePicker: React.FC<CustomImagePickerProps> = ({
  maxImages = 10,
  folder = "padisquare",
  onImagesChange,
  initialImages = [],
  className = "",
  error,
}) => {
  const {
    images,
    oldImages,
    fileInputRef,
    canAddMore,
    handleInputChange,
    handleDeleteOldImage,
    handleDeleteNewImage,
  } = useCloudinaryImagePicker({
    maxImages,
    folder,
    initialImages,
    onImagesChange,
  });

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {canAddMore && (
          <ImageUploadButton
            ref={fileInputRef}
            onChange={handleInputChange}
            disabled={!canAddMore}
          />
        )}

        {oldImages.map((image) => (
          <ImagePreview
            key={image.id}
            image={image}
            onDelete={() => handleDeleteOldImage(image.id, image.publicId)}
          />
        ))}

        {images.map((image) => (
          <ImagePreview
            key={image.id}
            image={image}
            onDelete={() => handleDeleteNewImage(image.id, image.publicId)}
          />
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

interface ImagePreviewProps {
  image: ImageItem;
  onDelete: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ image, onDelete }) => {
  return (
    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors bg-gray-50">
      <Image
        src={image.url}
        alt="Upload preview"
        fill
        className="object-cover"
        sizes="128px"
      />

      {!image.isUploading && (
        <button
          onClick={onDelete}
          className="absolute top-1 cursor-pointer right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors z-10"
          aria-label="Delete image"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {image.isUploading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center">
            <Upload className="h-8 w-8 text-white animate-pulse mx-auto mb-2" />
            <p className="text-white text-sm font-medium">
              {image.uploadProgress}%
            </p>
          </div>
        </div>
      )}

      {image.error && (
        <div className="absolute inset-0 bg-red-500/90 flex items-center justify-center p-2">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-white mx-auto mb-2" />
            <p className="text-white text-xs">Error</p>
          </div>
        </div>
      )}
    </div>
  );
};

interface ImageUploadButtonProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const ImageUploadButton = React.forwardRef<
  HTMLInputElement,
  ImageUploadButtonProps
>(({ onChange, disabled }, ref) => {
  return (
    <div className="relative">
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        onChange={onChange}
        disabled={disabled}
        className="hidden"
        id="image-upload"
      />
      <label
        htmlFor="image-upload"
        className={`
          w-20 h-20 rounded-lg border-[1.5px] border-[#c8516a26]
          hover:border-[#C8516A] transition-colors cursor-pointer
          flex flex-col items-center relative justify-center gap-2
          bg-[#FDF8F5]
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <ImagePlus className="h-5 w-5 text-[#1A0A0F] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50" />
      </label>
    </div>
  );
});

ImageUploadButton.displayName = "ImageUploadButton";

export default CustomImagePicker;
