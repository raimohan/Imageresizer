'use client';

import { useState, useEffect } from 'react';
import type { ImageFile } from '@/types';
import { useDebounce } from '@/hooks/use-debounce';
import { estimateFileSize } from '@/ai/flows/estimate-file-size';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Crop, RotateCw, Lock, Unlock, Download } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface ResizingControlsProps {
  image: ImageFile | null;
  onSettingsChange: (settings: Partial<ImageFile['settings']>) => void;
  onEstimationUpdate: (size: number | null, isEstimating: boolean) => void;
}

export default function ResizingControls({ image, onSettingsChange, onEstimationUpdate }: ResizingControlsProps) {
  const settings = image?.settings;
  const debouncedSettings = useDebounce(settings, 500);

  useEffect(() => {
    if (!debouncedSettings || !image) {
      return;
    }

    const runEstimation = async () => {
      onEstimationUpdate(null, true);
      try {
        const result = await estimateFileSize({
          originalWidth: image.originalWidth,
          originalHeight: image.originalHeight,
          percentage: debouncedSettings.percentage,
          targetFileSizeKB: debouncedSettings.targetSize,
          format: debouncedSettings.format,
          quality: debouncedSettings.quality,
        });
        onEstimationUpdate(result.estimatedFileSizeKB, false);
      } catch (error) {
        console.error("Estimation failed:", error);
        onEstimationUpdate(null, false);
      }
    };
    runEstimation();
  }, [debouncedSettings, image, onEstimationUpdate]);


  const handleSettings = (key: keyof ImageFile['settings'], value: any) => {
    onSettingsChange({ [key]: value });
  };
  
  const isDisabled = !image;

  return (
    <Card className="h-full shadow-sm">
      <CardHeader>
        <CardTitle>Resizing Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <fieldset disabled={isDisabled} className="space-y-6 disabled:opacity-50">
          <div className="grid grid-cols-10 gap-2 items-center">
            <div className="col-span-4">
              <Label htmlFor="width">Width (px)</Label>
              <Input id="width" type="number" value={settings?.width || ''} onChange={e => handleSettings('width', parseInt(e.target.value, 10) || 0)} />
            </div>
            <div className="col-span-2 flex items-end justify-center h-full pb-2">
              <Button variant="ghost" size="icon" onClick={() => handleSettings('isLocked', !settings?.isLocked)}>
                {settings?.isLocked ? <Lock /> : <Unlock />}
              </Button>
            </div>
            <div className="col-span-4">
              <Label htmlFor="height">Height (px)</Label>
              <Input id="height" type="number" value={settings?.height || ''} onChange={e => handleSettings('height', parseInt(e.target.value, 10) || 0)} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Percentage</Label>
              <span className="text-sm font-medium text-primary">{settings?.percentage || 100}%</span>
            </div>
            <Slider value={[settings?.percentage || 100]} min={10} max={200} step={1} onValueChange={([val]) => handleSettings('percentage', val)} />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Target File Size</Label>
               {image?.isEstimating ? <Skeleton className="w-20 h-5" /> : (
                <span className="text-sm font-medium text-primary">{image?.estimatedSize ? `~${image.estimatedSize.toFixed(1)} KB` : 'N/A'}</span>
              )}
            </div>
            <Slider value={[settings?.targetSize || 250]} min={10} max={500} step={10} onValueChange={([val]) => handleSettings('targetSize', val)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="format">Format</Label>
              <Select value={settings?.format || 'JPEG'} onValueChange={(val: 'JPEG' | 'PNG' | 'WebP') => handleSettings('format', val)}>
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JPEG">JPEG</SelectItem>
                  <SelectItem value="PNG">PNG</SelectItem>
                  <SelectItem value="WebP">WebP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Quality</Label>
                <span className="text-sm">{Math.round((settings?.quality || 0.8) * 100)}</span>
              </div>
              <Slider value={[(settings?.quality || 0.8) * 100]} onValueChange={([val]) => handleSettings('quality', val / 100)} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-muted-foreground">Optional Tools:</p>
            <Button variant="outline" size="icon" className="transition-transform hover:scale-105"><RotateCw/></Button>
            <Button variant="outline" size="icon" className="transition-transform hover:scale-105"><Crop/></Button>
          </div>
        </fieldset>
        
        <Button size="lg" className="w-full text-lg transition-transform hover:scale-105" disabled={isDisabled}>
          <Download className="mr-2" />
          Resize & Download
        </Button>
      </CardContent>
    </Card>
  );
}
