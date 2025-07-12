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
    format: 'JPEG' | 'PNG' | 'WebP';
    quality: number;
    targetSize?: number; // in KB
  };
  resizedUrl: string | null;
  resizedSize: number | null;
  isResizing: boolean;
};
