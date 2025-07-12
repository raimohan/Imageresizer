'use client';

import type { ImageFile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, Unlock, Download, RefreshCw } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ResizingControlsProps {
  image: ImageFile | null;
  onSettingsChange: (settings: Partial<ImageFile['settings']>) => void;
  onResize: (image: ImageFile) => void;
  onDownload: () => void;
}

export default function ResizingControls({ image, onSettingsChange, onResize, onDownload }: ResizingControlsProps) {
  const settings = image?.settings;
  const isDisabled = !image;

  const handleSettings = (key: keyof ImageFile['settings'], value: any) => {
    onSettingsChange({ [key]: value });
  };
  
  const handleResizeClick = () => {
    if (image) {
      onResize(image);
    }
  }

  const handleDownloadClick = () => {
    if (image) {
      onDownload();
    }
  }

  return (
    <Card className="h-full shadow-sm">
      <CardHeader>
        <CardTitle>Resizing Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <fieldset disabled={isDisabled} className="space-y-4 disabled:opacity-50">
          
          <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>By Dimensions</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
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
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>By Percentage</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                 <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Percentage</Label>
                      <span className="text-sm font-medium text-primary">{settings?.percentage || 100}%</span>
                    </div>
                    <Slider value={[settings?.percentage || 100]} min={1} max={200} step={1} onValueChange={([val]) => handleSettings('percentage', val)} />
                  </div>
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-3">
              <AccordionTrigger>By Target Size</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                 <div className="space-y-2">
                    <Label htmlFor="targetSize">Target Size (approx. KB)</Label>
                    <Input 
                      id="targetSize"
                      type="number"
                      value={settings?.targetSize || ''} 
                      onChange={e => handleSettings('targetSize', parseInt(e.target.value, 10) || 0)}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Note: Actual size may vary based on image content.</p>
                  </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="grid grid-cols-2 gap-4 pt-4">
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
        </fieldset>
        
        <div className="flex flex-col gap-2 pt-4">
            <Button size="lg" className="w-full text-lg transition-transform hover:scale-105" disabled={isDisabled || image?.isResizing} onClick={handleResizeClick}>
                <RefreshCw className={`mr-2 ${image?.isResizing ? 'animate-spin' : ''}`} />
                {image?.isResizing ? 'Resizing...' : 'Preview Changes'}
            </Button>
            <Button size="lg" className="w-full text-lg transition-transform hover:scale-105" disabled={isDisabled} onClick={handleDownloadClick}>
              <Download className="mr-2" />
              Resize & Download
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
