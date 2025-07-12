'use client';

import type { ImageFile } from '@/types';

type ResizeResult = {
    url: string;
    size: number;
}

export function resizeImage(imageFile: ImageFile): Promise<ResizeResult> {
    return new Promise((resolve, reject) => {
        const { file, settings } = imageFile;
        const { width, height, format, quality } = settings;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
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
                        const url = URL.createObjectURL(blob);
                        resolve({ url, size: blob.size });
                    },
                    `image/${format.toLowerCase()}`,
                    quality
                );
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
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
    URL.revokeObjectURL(url);
}
