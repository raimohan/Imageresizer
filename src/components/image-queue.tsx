'use client';

import type { ImageFile } from '@/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ImageQueueProps {
  images: ImageFile[];
  activeIndex: number | null;
  onSelectImage: (index: number) => void;
}

export default function ImageQueue({ images, activeIndex, onSelectImage }: ImageQueueProps) {
  
  return (
    <div className="flex flex-col w-full">
        <h3 className="text-[#121217] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Queue ({images.length})</h3>
        <div className='overflow-y-auto'>
            {images.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8 px-4">Your uploaded images will appear here.</p>
            )}
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => onSelectImage(index)}
                className={cn(
                  "flex items-center w-full gap-4 text-left p-4 min-h-[72px] transition-colors",
                  index === activeIndex ? "bg-secondary" : "hover:bg-secondary/50"
                )}
              >
                <div className="relative size-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                   <Image 
                    src={image.previewUrl} 
                    alt={image.file.name} 
                    fill
                    style={{ objectFit: 'cover' }}
                    unoptimized
                  />
                </div>
                <div className="flex flex-col justify-center overflow-hidden">
                  <p className="text-base font-medium truncate">{image.file.name}</p>
                  <p className="text-sm text-muted-foreground">{image.originalWidth}x{image.originalHeight}, {image.file.type.split('/')[1]?.toUpperCase()}</p>
                </div>
              </button>
            ))}
        </div>
    </div>
  );
}
