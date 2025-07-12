export type ImageFile = {
  id: string;
  file: File;
  previewUrl: string;
  originalWidth: number;
  originalHeight: number;
  settings: {
    width: number;
    height: number;
    isLocked: boolean;
    percentage: number;
    targetSize: number;
    format: 'JPEG' | 'PNG' | 'WebP';
    quality: number;
  };
  estimatedSize: number | null;
  isEstimating: boolean;
};
