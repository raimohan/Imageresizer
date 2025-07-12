'use client';

import type { ImageFile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ImageQueueProps {
  images: ImageFile[];
  activeIndex: number | null;
  onSelectImage: (index: number) => void;
}

export default function ImageQueue({ images, activeIndex, onSelectImage }: ImageQueueProps) {
  
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  return (
    <Card className="h-full shadow-sm">
      <CardHeader>
        <CardTitle>Queue ({images.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
          <div className="space-y-2 pr-4">
            {images.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">Your uploaded images will appear here.</p>
            )}
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => onSelectImage(index)}
                className={cn(
                  "flex items-center w-full p-2 rounded-md border text-left transition-colors",
                  index === activeIndex ? "bg-primary/10 border-primary" : "hover:bg-muted"
                )}
              >
                <div className="w-16 h-16 relative rounded-md overflow-hidden bg-muted flex-shrink-0">
                   <Image 
                    src={image.previewUrl} 
                    alt={image.file.name} 
                    fill
                    style={{ objectFit: 'cover' }}
                    unoptimized
                  />
                </div>
                <div className="ml-4 overflow-hidden">
                  <p className="text-sm font-medium truncate">{image.file.name}</p>
                  <p className="text-xs text-muted-foreground">{image.originalWidth}x{image.originalHeight} &bull; {image.file.type.split('/')[1]?.toUpperCase()}</p>
                   <p className="text-xs text-muted-foreground">{formatBytes(image.file.size)}</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
