export type UploadResult = {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

export type UploadProgress = {
  loaded: number;
  total: number;
  percentage: number;
};

export type ImageItem = {
  id: string;
  file?: File;
  url: string;
  publicId?: string;
  isUploading?: boolean;
  uploadProgress?: number;
  error?: string;
};
