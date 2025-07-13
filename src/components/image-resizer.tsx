
'use client';

import { useState, useCallback, useMemo } from 'react';
import type { ImageFile } from '@/types';
import ImagePreview from '@/components/image-preview';
import ResizingControls from '@/components/resizing-controls';
import ImageQueue from '@/components/image-queue';
import { Button } from '@/components/ui/button';
import { resizeImage, downloadImage } from '@/lib/image-utils';
import { useToast } from '@/hooks/use-toast';
import { Sun } from 'lucide-react';
import NextImage from 'next/image';

const AppHeader = () => (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f0f1f4] px-10 py-3">
        <div className="flex items-center gap-2 text-[#121217]">
            <NextImage src="https://iili.io/FM85HeS.png" alt="Shrinkray Logo" width={32} height={32} />
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
            event.target.value = ''; // Reset for re-uploading the same file
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
      return new Promise<void>((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            console.warn(`File ${file.name} is not an image, skipping.`);
            resolve();
            return;
        }
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
                quality: 0.9,
                targetSize: undefined,
              },
              resizedUrl: null,
              resizedSize: null,
              isResizing: false
            };
            newImages.push(newImage);
            resolve();
          };
          img.onerror = () => reject(new Error('Image failed to load'));
          img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error('File reader failed'));
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(() => {
      setImages(prevImages => {
        const newImagesList = [...prevImages, ...newImages];
        if (activeIndex === null && newImagesList.length > 0) {
          setActiveIndex(0);
        } else if (activeIndex !== null) {
          // keep current active index if it exists
        } else if (newImagesList.length > 0) {
          setActiveIndex(newImagesList.length -1);
        }

        return newImagesList;
      });
    }).catch(err => {
        console.error("Error adding files:", err);
        toast({
            variant: "destructive",
            title: "File Error",
            description: "There was an error loading one of the images."
        });
    });
  }, [activeIndex, toast]);

  const handleSelectImage = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);
  
  const handleClosePreview = useCallback(() => {
    if (activeIndex === null) return;

    setImages(prevImages => {
      const newImages = [...prevImages];
      newImages.splice(activeIndex, 1);
      
      if (newImages.length === 0) {
        setActiveIndex(null);
      } else if (activeIndex >= newImages.length) {
        setActiveIndex(newImages.length - 1);
      }
      
      return newImages;
    });
  }, [activeIndex]);


  const handleSettingsChange = useCallback((newSettings: Partial<ImageFile['settings']>) => {
    if (activeIndex === null) return;

    setImages(prevImages => {
      const updatedImages = [...prevImages];
      const currentImage = updatedImages[activeIndex];
      const oldSettings = currentImage.settings;

      const mergedSettings = { ...oldSettings, ...newSettings };
      
      const aspectRatio = currentImage.originalWidth / currentImage.originalHeight;
      
      // Clear target size if other dimension-affecting properties are changed
      if (newSettings.width || newSettings.height || newSettings.percentage) {
        mergedSettings.targetSize = undefined;
      }

      if (newSettings.width && oldSettings.width !== newSettings.width) {
        if (mergedSettings.isLocked) {
            mergedSettings.height = Math.round(newSettings.width / aspectRatio);
        }
      } else if (newSettings.height && oldSettings.height !== newSettings.height) {
        if (mergedSettings.isLocked) {
            mergedSettings.width = Math.round(newSettings.height * aspectRatio);
        }
      } else if(newSettings.percentage && oldSettings.percentage !== newSettings.percentage) {
        mergedSettings.width = Math.round(currentImage.originalWidth * (newSettings.percentage / 100));
        mergedSettings.height = Math.round(currentImage.originalHeight * (newSettings.percentage / 100));
      } else if (newSettings.isLocked !== undefined && newSettings.isLocked) {
         mergedSettings.height = Math.round(mergedSettings.width / aspectRatio);
      }

      if (mergedSettings.width !== oldSettings.width || mergedSettings.height !== oldSettings.height) {
          if(mergedSettings.width > 0) {
              const percentage = Math.round((mergedSettings.width / currentImage.originalWidth) * 100);
              mergedSettings.percentage = isNaN(percentage) ? 100 : percentage;
          } else {
              mergedSettings.percentage = 100;
          }
      }
      
      updatedImages[activeIndex] = {
        ...currentImage,
        settings: mergedSettings,
        resizedUrl: null, // Invalidate previous resize on setting change
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
      let imageName = activeImage.file.name;
      let imageFormat = activeImage.settings.format;

      // If there's no resized image URL, we need to resize first
      if (!imageUrl) {
          try {
              setImages(prev => prev.map(img => img.id === activeImage.id ? { ...img, isResizing: true } : img));
              const { url, size } = await resizeImage(activeImage);
              
              setImages(prev => {
                const newImages = [...prev];
                const imageIndex = newImages.findIndex(img => img.id === activeImage.id);
                if (imageIndex > -1) {
                  newImages[imageIndex] = { ...newImages[imageIndex], resizedUrl: url, resizedSize: size, isResizing: false };
                }
                imageUrl = url; // assign for download
                return newImages;
              });

              if (!imageUrl) throw new Error("Resize did not return a URL");
              
          } catch (error) {
              console.error("Resizing for download failed:", error);
              setImages(prev => prev.map(img => img.id === activeImage.id ? { ...img, isResizing: false } : img));
              toast({
                  variant: "destructive",
                  title: "Resize Failed",
                  description: "Could not resize image for download.",
              });
              return;
          }
      }
      
      downloadImage(imageUrl, imageName, imageFormat);
      
  }, [activeImage, toast]);

  return (
    <div className="flex flex-col h-full min-h-screen">
      <AppHeader />
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
            <main className="layout-content-container flex flex-col max-w-[920px] flex-1">
                <UploadArea onFilesAdded={handleFilesAdded} />
                
                {activeImage ? (
                    <>
                        <ImagePreview activeImage={activeImage} onClose={handleClosePreview} />
                        <ResizingControls 
                            image={activeImage} 
                            onSettingsChange={handleSettingsChange}
                            onResize={() => handleResize(activeImage)}
                            onDownload={handleDownload}
                        />
                    </>
                ) : images.length > 0 && (
                  <div className="text-center text-muted-foreground p-8">
                    <p>Select an image from the queue to start editing.</p>
                  </div>
                )}
                 <ImageQueue 
                    images={images}
                    activeIndex={activeIndex}
                    onSelectImage={handleSelectImage}
                />
            </main>
        </div>
    </div>
  );
            }
