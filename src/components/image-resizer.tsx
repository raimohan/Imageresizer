'use client';

import { useState, useCallback, useMemo } from 'react';
import type { ImageFile } from '@/types';
import ImagePreview from '@/components/image-preview';
import ResizingControls from '@/components/resizing-controls';
import ImageQueue from '@/components/image-queue';
import { Button } from '@/components/ui/button';
import { Shrink, Download, Archive } from 'lucide-react';
import { resizeImage, downloadImage } from '@/lib/image-utils';
import { useToast } from '@/hooks/use-toast';

export default function ImageResizer() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const activeImage = useMemo(() => {
    return activeIndex !== null ? images[activeIndex] : null;
  }, [images, activeIndex]);

  const handleFilesAdded = useCallback((files: File[]) => {
    const newImages: ImageFile[] = [];
    const promises = Array.from(files).map(file => {
      return new Promise<void>(resolve => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const newImage: ImageFile = {
              id: `${file.name}-${Date.now()}`,
              file,
              previewUrl: img.src,
              originalWidth: img.width,
              originalHeight: img.height,
              settings: {
                width: img.width,
                height: img.height,
                isLocked: true,
                percentage: 100,
                format: 'JPEG',
                quality: 0.8,
              },
              resizedUrl: null,
              resizedSize: null,
              isResizing: false
            };
            newImages.push(newImage);
            resolve();
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(() => {
      setImages(prev => [...prev, ...newImages]);
      if (activeIndex === null) {
        setActiveIndex(0);
      }
    });
  }, [activeIndex]);

  const handleSelectImage = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const handleSettingsChange = useCallback((newSettings: Partial<ImageFile['settings']>) => {
    if (activeIndex === null) return;

    setImages(prevImages => {
      const updatedImages = [...prevImages];
      const activeImage = updatedImages[activeIndex];
      const oldSettings = activeImage.settings;

      const mergedSettings = { ...oldSettings, ...newSettings };
      
      if(newSettings.width && oldSettings.width !== newSettings.width && mergedSettings.isLocked) {
        mergedSettings.height = Math.round((newSettings.width / activeImage.originalWidth) * activeImage.originalHeight);
      } else if (newSettings.height && oldSettings.height !== newSettings.height && mergedSettings.isLocked) {
        mergedSettings.width = Math.round((newSettings.height / activeImage.originalHeight) * activeImage.originalWidth);
      } else if(newSettings.percentage && oldSettings.percentage !== newSettings.percentage) {
        mergedSettings.width = Math.round(activeImage.originalWidth * (newSettings.percentage / 100));
        mergedSettings.height = Math.round(activeImage.originalHeight * (newSettings.percentage / 100));
      } else if (newSettings.isLocked !== undefined) {
         if (mergedSettings.isLocked) {
           mergedSettings.height = Math.round((mergedSettings.width / activeImage.originalWidth) * activeImage.originalHeight);
         }
      }

      if (mergedSettings.width !== oldSettings.width || mergedSettings.height !== oldSettings.height) {
        const percentage = Math.round((mergedSettings.width / activeImage.originalWidth) * 100);
        mergedSettings.percentage = percentage;
      }
      
      updatedImages[activeIndex] = {
        ...activeImage,
        settings: mergedSettings,
        resizedUrl: null,
        resizedSize: null,
      };

      return updatedImages;
    });
  }, [activeIndex]);
  
  const handleResize = useCallback(async (imageToResize: ImageFile) => {
    if (!imageToResize) return;
    
    setImages(prev => prev.map(img => img.id === imageToResize.id ? { ...img, isResizing: true } : img));

    try {
        const { url, size } = await resizeImage(imageToResize);
        setImages(prev => prev.map(img => img.id === imageToResize.id ? { ...img, resizedUrl: url, resizedSize: size, isResizing: false } : img));
    } catch (error) {
        console.error("Resizing failed:", error);
        setImages(prev => prev.map(img => img.id === imageToResize.id ? { ...img, isResizing: false } : img));
        toast({
          variant: "destructive",
          title: "Resize Failed",
          description: "There was an error while resizing the image.",
        });
    }
  }, [toast]);
  
  const handleDownload = useCallback(async () => {
      if (!activeImage) return;
      if (!activeImage.resizedUrl) {
          try {
              const { url, size } = await resizeImage(activeImage);
              setImages(prev => prev.map(img => img.id === activeImage.id ? { ...img, resizedUrl: url, resizedSize: size, isResizing: false } : img));
              downloadImage(url, activeImage.file.name, activeImage.settings.format);
          } catch (error) {
              console.error("Resizing for download failed:", error);
              toast({
                  variant: "destructive",
                  title: "Resize Failed",
                  description: "Could not resize image for download.",
              });
          }
      } else {
          downloadImage(activeImage.resizedUrl, activeImage.file.name, activeImage.settings.format);
      }
  }, [activeImage, toast]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <header className="flex items-center gap-2 mb-8">
        <Shrink className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold font-headline">Shrinkray</h1>
        <span className="text-3xl font-light text-muted-foreground">Image Resizer</span>
      </header>
      
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 xl:col-span-6">
          <ImagePreview 
            activeImage={activeImage} 
            onFilesAdded={handleFilesAdded}
          />
        </div>
        <div className="lg:col-span-7 xl:col-span-6 flex flex-col gap-6">
          <div className="flex-grow">
            <ResizingControls 
              image={activeImage} 
              onSettingsChange={handleSettingsChange}
              onResize={handleResize}
              onDownload={handleDownload}
            />
          </div>
          <div className="hidden lg:block">
            <ImageQueue 
              images={images}
              activeIndex={activeIndex}
              onSelectImage={handleSelectImage}
            />
          </div>
        </div>
      </main>

      <div className="lg:hidden mt-6">
        <ImageQueue 
          images={images}
          activeIndex={activeIndex}
          onSelectImage={handleSelectImage}
        />
      </div>

       <div className="mt-6">
          <div className="bg-card p-4 rounded-lg shadow-sm border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Process multiple images and download them at once.</p>
            <div className="flex items-center gap-2">
               <Button variant="outline" className="transition-transform hover:scale-105" disabled={images.length < 2}>
                <Download className="mr-2" />
                Download All
              </Button>
              <Button className="transition-transform hover:scale-105" disabled={images.length < 2}>
                <Archive className="mr-2" />
                Download as ZIP
              </Button>
            </div>
          </div>
        </div>
      
      <footer className="text-center mt-8 text-sm text-muted-foreground">
        <p>All processing happens offline in your browser. No image data is stored on our servers.</p>
      </footer>
    </div>
  );
}
