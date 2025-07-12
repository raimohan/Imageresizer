'use client';

import { useCallback } from 'react';
import type { ImageFile } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';
import Image from 'next/image';

interface ImagePreviewProps {
  activeImage: ImageFile | null;
  onFilesAdded: (files: File[]) => void;
}

export default function ImagePreview({ activeImage, onFilesAdded }: ImagePreviewProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onFilesAdded(Array.from(event.target.files));
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      onFilesAdded(Array.from(event.dataTransfer.files));
      event.dataTransfer.clearData();
    }
  }, [onFilesAdded]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  return (
    <Card className="h-full shadow-sm">
      <CardContent className="h-full p-4">
        {activeImage ? (
          <div className="relative w-full h-full flex items-center justify-center bg-muted/30 rounded-md overflow-hidden">
            <Image
              key={activeImage.id}
              src={activeImage.previewUrl}
              alt="Image preview"
              fill
              style={{ objectFit: 'contain' }}
              className="animate-in fade-in duration-500"
              unoptimized
            />
            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 text-xs rounded-md">
              {activeImage.settings.width} x {activeImage.settings.height} px
            </div>
          </div>
        ) : (
          <div 
            className="h-full border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center text-center p-6"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <UploadCloud className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">Drag & drop images here</h3>
            <p className="text-muted-foreground mb-4">or</p>
            <Button asChild className="transition-transform hover:scale-105">
              <label htmlFor="file-upload">
                Browse Files
                <input id="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleFileChange} />
              </label>
            </Button>
            <p className="text-xs text-muted-foreground mt-4">Supports JPEG, PNG, WebP</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
