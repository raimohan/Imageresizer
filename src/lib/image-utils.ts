
'use client';

import type { ImageFile } from '@/types';

type ResizeResult = {
    url: string;
    size: number;
}

// Helper to perform a single resize operation
function performResize(img: HTMLImageElement, settings: ImageFile['settings']): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const { width, height, format, quality } = settings;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return reject(new Error('Could not get canvas context'));
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    return reject(new Error('Canvas to Blob conversion failed'));
                }
                resolve(blob);
            },
            `image/${format.toLowerCase()}`,
            quality
        );
    });
}

export function resizeImage(imageFile: ImageFile): Promise<ResizeResult> {
    return new Promise((resolve, reject) => {
        const { file, settings } = imageFile;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = async () => {
                try {
                    // If a target size is specified, try to meet it
                    if (settings.targetSize && settings.targetSize > 0 && settings.format === 'JPEG') {
                        const targetBytes = settings.targetSize * 1024;
                        let minQuality = 0;
                        let maxQuality = 1;
                        let bestBlob: Blob | null = null;

                        // Iteratively find the best quality setting
                        for (let i = 0; i < 7; i++) { // 7 iterations are usually enough for good precision
                            const quality = (minQuality + maxQuality) / 2;
                            const currentSettings = { ...settings, quality };
                            const blob = await performResize(img, currentSettings);

                            // We want the largest blob that is still smaller than the target
                            if (blob.size <= targetBytes) {
                                if (!bestBlob || blob.size > bestBlob.size) {
                                    bestBlob = blob;
                                }
                                minQuality = quality; // try for higher quality
                            } else {
                                maxQuality = quality; // too big, reduce quality
                            }
                        }

                        if (bestBlob) {
                            const url = URL.createObjectURL(bestBlob);
                            resolve({ url, size: bestBlob.size });
                        } else {
                             // Fallback to a default quality if no suitable blob was found (e.g., target size is too small)
                            const blob = await performResize(img, { ...settings, quality: 0.1 });
                            const url = URL.createObjectURL(blob);
                            resolve({ url, size: blob.size });
                        }

                    } else {
                        // Standard resize if no target size or not JPEG
                        const blob = await performResize(img, settings);
                        const url = URL.createObjectURL(blob);
                        resolve({ url, size: blob.size });
                    }
                } catch (err) {
                    reject(err);
                }
            };
            img.onerror = () => reject(new Error("Image failed to load for resizing."));
        };
        reader.onerror = () => reject(new Error("File reader failed during resize process."));
    });
}

export function downloadImage(url: string, originalFilename: string, format: 'JPEG' | 'PNG' | 'WebP') {
    const link = document.createElement('a');
    link.href = url;
    
    const name = originalFilename.substring(0, originalFilename.lastIndexOf('.')) || originalFilename;
    const extension = format.toLowerCase();
    
    link.download = `${name}_resized.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Don't revoke URL immediately, allow time for download to start
    setTimeout(() => URL.revokeObjectURL(url), 100);
}
