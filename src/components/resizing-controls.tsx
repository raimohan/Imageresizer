'use client';

import type { ImageFile } from '@/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
    <div className='flex flex-col p-4 gap-3'>
        <fieldset disabled={isDisabled} className="space-y-3 disabled:opacity-50">
          
          <Accordion type="single" collapsible defaultValue="item-1" className="w-full space-y-3">
            <AccordionItem value="item-1" className='rounded-xl border px-[15px] py-[7px]'>
              <AccordionTrigger className='py-2 hover:no-underline'>
                <p className="text-[#121217] text-sm font-medium leading-normal">Dimensions</p>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="flex flex-wrap items-end gap-4">
                  <div className="flex flex-col min-w-40 flex-1">
                    <Label htmlFor="width" className="text-base font-medium leading-normal pb-2">Width (px)</Label>
                    <Input id="width" type="number" value={settings?.width || ''} onChange={e => handleSettings('width', parseInt(e.target.value, 10) || 0)} 
                      className="h-14 p-[15px] text-base"
                    />
                  </div>
                   <div className="flex flex-col min-w-40 flex-1">
                    <Label htmlFor="height" className="text-base font-medium leading-normal pb-2">Height (px)</Label>
                    <Input id="height" type="number" value={settings?.height || ''} onChange={e => handleSettings('height', parseInt(e.target.value, 10) || 0)} 
                      className="h-14 p-[15px] text-base"
                    />
                  </div>
                </div>
                 <div className="flex items-center gap-4 min-h-14 justify-between">
                    <p className="text-base font-normal leading-normal flex-1 truncate">Aspect Ratio</p>
                    <Switch checked={settings?.isLocked} onCheckedChange={(val) => handleSettings('isLocked', val)} />
                 </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className='rounded-xl border px-[15px] py-[7px]'>
              <AccordionTrigger className='py-2 hover:no-underline'>
                 <p className="text-[#121217] text-sm font-medium leading-normal">Percentage</p>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                 <div className="relative flex w-full flex-col items-start justify-between gap-3">
                    <div className="flex w-full shrink-[3] items-center justify-between">
                      <p className="text-base font-medium leading-normal">Percentage (1-200%)</p>
                      <p className="text-sm font-normal leading-normal">{settings?.percentage || 100}</p>
                    </div>
                    <div className="flex h-4 w-full items-center gap-4">
                      <Slider value={[settings?.percentage || 100]} min={1} max={200} step={1} onValueChange={([val]) => handleSettings('percentage', val)} />
                    </div>
                  </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3" className='rounded-xl border px-[15px] py-[7px]'>
              <AccordionTrigger className='py-2 hover:no-underline'>
                 <p className="text-[#121217] text-sm font-medium leading-normal">Target Size</p>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                 <div className="space-y-2">
                    <Label htmlFor="targetSize" className="text-base font-medium leading-normal">Target Size (approx. KB)</Label>
                    <Input 
                      id="targetSize"
                      type="number"
                      value={settings?.targetSize || ''} 
                      onChange={e => handleSettings('targetSize', parseInt(e.target.value, 10) || 0)}
                      className="w-full h-14 p-[15px] text-base"
                    />
                    <p className="text-xs text-muted-foreground pt-1">Note: Actual size may vary based on image content.</p>
                  </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4" className='rounded-xl border px-[15px] py-[7px]'>
              <AccordionTrigger className='py-2 hover:no-underline'>
                 <p className="text-[#121217] text-sm font-medium leading-normal">Format & Quality</p>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                  <div className="flex flex-col min-w-40 flex-1">
                    <Label className="text-base font-medium leading-normal pb-2">Format</Label>
                    <Select value={settings?.format || 'JPEG'} onValueChange={(val: 'JPEG' | 'PNG' | 'WebP') => handleSettings('format', val)}>
                      <SelectTrigger className="h-14 p-[15px] text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JPEG">JPEG</SelectItem>
                        <SelectItem value="PNG">PNG</SelectItem>
                        <SelectItem value="WebP">WebP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative flex w-full flex-col items-start justify-between gap-3">
                    <div className="flex w-full shrink-[3] items-center justify-between">
                      <p className="text-base font-medium leading-normal">Quality</p>
                      <p className="text-sm font-normal leading-normal">{Math.round((settings?.quality || 0.8) * 100)}</p>
                    </div>
                    <div className="flex h-4 w-full items-center gap-4">
                      <Slider value={[(settings?.quality || 0.8) * 100]} onValueChange={([val]) => handleSettings('quality', val / 100)} />
                    </div>
                  </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

        </fieldset>
        
        <div className="flex justify-center px-4 py-3">
            <Button size="lg" className="h-12 px-5 text-base font-bold rounded-full" disabled={isDisabled || image?.isResizing} onClick={handleDownloadClick}>
              {image?.isResizing ? 'Resizing...' : 'Resize & Download'}
            </Button>
        </div>

        <div>
            <h3 className="text-[#121217] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Download</h3>
            <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-start">
                <Button variant="secondary" className="rounded-full h-10 px-4 text-sm font-bold" disabled>
                    Batch Download
                </Button>
                <Button variant="secondary" className="rounded-full h-10 px-4 text-sm font-bold" disabled>
                    Download as ZIP
                </Button>
            </div>
        </div>
    </div>
  );
}
