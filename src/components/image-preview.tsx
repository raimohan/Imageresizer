'use client';

import { useState } from 'react';
import type { ImageFile } from '@/types';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Loader2, X, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImagePreviewProps {
  activeImage: ImageFile | null;
  onClose: () => void;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function ImagePreview({ activeImage, onClose }: ImagePreviewProps) {
  const [zoom, setZoom] = useState(1);

  if (!activeImage) {
    return null;
  }

  const hasResized = activeImage.resizedUrl && activeImage.resizedSize;

  return (
    <div className='flex flex-col relative'>
      <div className="flex items-center justify-between">
        <h3 className="text-[#121217] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Preview</h3>
        <Button variant="ghost" size="icon" className="mr-2" onClick={onClose}>
          <X className="h-5 w-5" />
          <span className="sr-only">Close Preview</span>
        </Button>
      </div>

      <Tabs defaultValue="before" className="w-full">
        <div className="pb-3">
          <div className="flex border-b border-[#dcdee5] px-4 gap-8">
            <TabsList className='p-0 bg-transparent gap-8'>
              <TabsTrigger value="before" className='flex flex-col items-center justify-center border-b-[3px] border-b-transparent data-[state=active]:border-b-[#121217] text-[#656a86] data-[state=active]:text-[#121217] pb-[13px] pt-4 rounded-none'>
                <p className="text-sm font-bold leading-normal tracking-[0.015em]">Before</p>
              </TabsTrigger>
              <TabsTrigger value="after" className='flex flex-col items-center justify-center border-b-[3px] border-b-transparent data-[state=active]:border-b-[#121217] text-[#656a86] data-[state=active]:text-[#121217] pb-[13px] pt-4 rounded-none' disabled={!hasResized}>
                <p className="text-sm font-bold leading-normal tracking-[0.015em]">After</p>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="w-full grow bg-white p-4">
          <div className="relative w-full gap-1 overflow-hidden bg-white aspect-[3/2] rounded-xl flex items-center justify-center">
            <TabsContent value="before" className='w-full h-full m-0'>
              <div className="relative w-full h-full aspect-auto rounded-none flex-1 overflow-hidden">
                <Image
                  src={activeImage.previewUrl}
                  alt="Original image preview"
                  fill
                  style={{ objectFit: 'contain', transform: `scale(${zoom})`, transition: 'transform 0.2s' }}
                  unoptimized
                />
              </div>
            </TabsContent>

            <TabsContent value="after" className='w-full h-full m-0'>
              {activeImage.isResizing ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p>Resizing...</p>
                </div>
              ) : activeImage.resizedUrl ? (
                <div className="relative w-full h-full aspect-auto rounded-none flex-1 overflow-hidden">
                  <Image
                    src={activeImage.resizedUrl}
                    alt="Resized image preview"
                    fill
                    style={{ objectFit: 'contain', transform: `scale(${zoom})`, transition: 'transform 0.2s' }}
                    unoptimized
                  />
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  <p>Your resized image will appear here.</p>
                </div>
              )}
            </TabsContent>
          </div>
        </div>
      </Tabs>

      <div className="flex items-center gap-2 px-4 py-2">
        <ZoomOut className="h-5 w-5 text-muted-foreground" />
        <Slider
          value={[zoom]}
          min={0.5}
          max={3}
          step={0.1}
          onValueChange={([val]) => setZoom(val)}
          className="w-full"
        />
        <ZoomIn className="h-5 w-5 text-muted-foreground" />
      </div>

      <p className="text-[#656a86] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
        Dimensions: {hasResized
          ? `${activeImage.settings.width} x ${activeImage.settings.height}`
          : `${activeImage.originalWidth} x ${activeImage.originalHeight}`} px
        | Size: {hasResized && activeImage.resizedSize != null
          ? formatBytes(activeImage.resizedSize)
          : formatBytes(activeImage.file.size)}
      </p>
    </div>
  );
}
