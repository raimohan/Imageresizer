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
  };
  resizedUrl: string | null;
  resizedSize: number | null;
  isResizing: boolean;
};
