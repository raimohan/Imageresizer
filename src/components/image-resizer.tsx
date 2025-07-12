'use client';

import { useState, useCallback, useMemo } from 'react';
import type { ImageFile } from '@/types';
import ImagePreview from '@/components/image-preview';
import ResizingControls from '@/components/resizing-controls';
import ImageQueue from '@/components/image-queue';
import { Button } from '@/components/ui/button';
import { resizeImage, downloadImage } from '@/lib/image-utils';
import { useToast } from '@/hooks/use-toast';
import { Sun, UploadCloud } from 'lucide-react';

const AppHeader = () => (
    <header className="flex items-center justify-between whitespace-nowrap border-b px-10 py-3">
        <div className="flex items-center gap-4 text-[#121217]">
            <div className="size-4">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path></svg>
            </div>
            <h2 className="text-[#121217] text-lg font-bold leading-tight tracking-[-0.015em]">Image Resizer</h2>
        </div>
        <button
            className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 bg-[#f0f1f4] text-[#121217] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
        >
            <Sun size={20} />
        </button>
    </header>
);

const UploadArea = ({ onFilesAdded }: { onFilesAdded: (files: File[]) => void }) => {
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
        <div className="flex flex-col items-center" onDrop={handleDrop} onDragOver={handleDragOver}>
            <h2 className="text-[#121217] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">Resize your images</h2>
            <p className="text-[#121217] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">Drag and drop your images here, or</p>
            <div className="flex px-4 py-3 justify-center">
                <Button asChild variant="secondary" className='rounded-full h-10 px-4 text-sm font-bold'>
                    <label htmlFor="file-upload" className='cursor-pointer'>
                        Upload
                        <input id="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleFileChange} />
                    </label>
                </Button>
            </div>
        </div>
    );
};


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
                targetSize: Math.round(file.size / 1024),
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
      
      const aspectRatio = activeImage.originalWidth / activeImage.originalHeight;

      if(newSettings.width && oldSettings.width !== newSettings.width && mergedSettings.isLocked) {
        mergedSettings.height = Math.round(newSettings.width / aspectRatio);
      } else if (newSettings.height && oldSettings.height !== newSettings.height && mergedSettings.isLocked) {
        mergedSettings.width = Math.round(newSettings.height * aspectRatio);
      } else if(newSettings.percentage && oldSettings.percentage !== newSettings.percentage) {
        mergedSettings.width = Math.round(activeImage.originalWidth * (newSettings.percentage / 100));
        mergedSettings.height = Math.round(activeImage.originalHeight * (newSettings.percentage / 100));
      } else if (newSettings.isLocked !== undefined) {
         if (mergedSettings.isLocked) {
           mergedSettings.height = Math.round(mergedSettings.width / aspectRatio);
         }
      }

      if (mergedSettings.width !== oldSettings.width || mergedSettings.height !== oldSettings.height) {
        const percentage = Math.round((mergedSettings.width / activeImage.originalWidth) * 100);
        mergedSettings.percentage = isNaN(percentage) ? 100 : percentage;
      }

      if (newSettings.targetSize && oldSettings.targetSize !== newSettings.targetSize) {
        const originalSizeKB = activeImage.file.size / 1024;
        const sizeRatio = Math.sqrt(newSettings.targetSize / originalSizeKB);
        if (sizeRatio > 0 && sizeRatio < Infinity) {
          mergedSettings.width = Math.round(activeImage.originalWidth * sizeRatio);
          mergedSettings.height = Math.round(activeImage.originalHeight * sizeRatio);
          mergedSettings.percentage = Math.round(sizeRatio * 100);
        }
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
        setImages(prev => {
            const newImages = [...prev];
            const imageIndex = newImages.findIndex(img => img.id === imageToResize.id);
            if (imageIndex > -1) {
              newImages[imageIndex] = { ...newImages[imageIndex], resizedUrl: url, resizedSize: size, isResizing: false };
            }
            return newImages;
        });
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
      
      let imageUrl = activeImage.resizedUrl;

      if (!imageUrl) {
          try {
              const { url, size } = await resizeImage(activeImage);
              setImages(prev => prev.map(img => img.id === activeImage.id ? { ...img, resizedUrl: url, resizedSize: size, isResizing: false } : img));
              imageUrl = url;
          } catch (error) {
              console.error("Resizing for download failed:", error);
              toast({
                  variant: "destructive",
                  title: "Resize Failed",
                  description: "Could not resize image for download.",
              });
              return;
          }
      }
      
      downloadImage(imageUrl, activeImage.file.name, activeImage.settings.format);
      
  }, [activeImage, toast]);

  return (
    <div className="flex flex-col h-full min-h-screen">
      <AppHeader />
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
            <main className="layout-content-container flex flex-col max-w-[920px] flex-1">
                {!activeImage ? (
                    <UploadArea onFilesAdded={handleFilesAdded} />
                ) : (
                    <>
                        <ImagePreview activeImage={activeImage} />
                        <ResizingControls 
                            image={activeImage} 
                            onSettingsChange={handleSettingsChange}
                            onResize={() => handleResize(activeImage)}
                            onDownload={handleDownload}
                        />
                    </>
                )}
            </main>
            <aside>
                <ImageQueue 
                    images={images}
                    activeIndex={activeIndex}
                    onSelectImage={handleSelectImage}
                />
            </aside>
        </div>
    </div>
  );
}
