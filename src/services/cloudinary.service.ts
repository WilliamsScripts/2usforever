import { apiRequest } from "@/lib/api-client";
import type { UploadProgress, UploadResult } from "@/types/cloudinary";

export class CloudinaryService {
  static async uploadImage(
    file: File,
    folder?: string,
    onProgress?: (progress: UploadProgress) => void,
    mediaType: "image" | "video" = "image",
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
      );

      if (folder) {
        formData.append("folder", folder);
      }

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          });
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({
              public_id: response.public_id,
              secure_url: response.secure_url,
              width: response.width,
              height: response.height,
              format: response.format,
              bytes: response.bytes,
            });
          } catch {
            reject(new Error("Failed to parse upload response"));
          }
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed due to network error"));
      });

      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${mediaType}/upload`,
      );
      xhr.send(formData);
    });
  }

  static async uploadMultipleImages(
    files: File[],
    folder?: string,
    onProgress?: (fileIndex: number, progress: UploadProgress) => void,
  ): Promise<UploadResult[]> {
    return Promise.all(
      files.map((file, index) =>
        this.uploadImage(file, folder, (progress) =>
          onProgress?.(index, progress),
        ),
      ),
    );
  }

  static async deleteImage(publicId: string): Promise<boolean> {
    const result = await apiRequest<{ success: boolean }>(
      "/api/cloudinary/delete",
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      },
    );
    return result.success;
  }

  static getOptimizedUrl(
    publicId: string,
    transformations?: {
      width?: number;
      height?: number;
      quality?: string | number;
      format?: string;
      crop?: string;
    },
  ): string {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      throw new Error("Cloudinary cloud name not configured");
    }

    let url = `https://res.cloudinary.com/${cloudName}/image/upload`;

    if (transformations) {
      const transformParams: string[] = [];
      if (transformations.width)
        transformParams.push(`w_${transformations.width}`);
      if (transformations.height)
        transformParams.push(`h_${transformations.height}`);
      if (transformations.quality)
        transformParams.push(`q_${transformations.quality}`);
      if (transformations.format)
        transformParams.push(`f_${transformations.format}`);
      if (transformations.crop)
        transformParams.push(`c_${transformations.crop}`);

      if (transformParams.length > 0) {
        url += `/${transformParams.join(",")}`;
      }
    }

    url += `/${publicId}`;
    return url;
  }
}
