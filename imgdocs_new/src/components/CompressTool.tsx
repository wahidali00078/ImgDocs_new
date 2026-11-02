/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  ArrowRight, 
  Download, 
  RefreshCw, 
  Sliders, 
  Maximize, 
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Lock,
  X
} from 'lucide-react';
import JSZip from 'jszip';

interface CompressedItem {
  id: string;
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  src: string;
  compressedSize: number;
  compressedSrc: string;
  compressedWidth: number;
  compressedHeight: number;
  cropLeft: number;
  cropRight: number;
  cropTop: number;
  cropBottom: number;
}

interface CompressToolProps {
  onSuccess: (fileName: string, fileSize: string, count: number) => void;
  userId?: string | null;
  isLimitReached?: boolean;
  onLimitTrigger?: () => void;
}

export default function CompressTool({ onSuccess, userId, isLimitReached, onLimitTrigger }: CompressToolProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<CompressedItem[]>([]);
  
  // Compression parameters
  const [compressionMode, setCompressionMode] = useState<'SLIDERS' | 'TARGET_SIZE'>('SLIDERS');
  const [quality, setQuality] = useState<number>(0.75); // Quality between 0.1 and 1.0
  const [scale, setScale] = useState<number>(0.80); // Scale factor between 0.1 and 1.0
  const [targetSizeValue, setTargetSizeValue] = useState<number>(150); // Target numerical value
  const [targetSizeUnit, setTargetSizeUnit] = useState<'KB' | 'MB'>('KB'); // Target unit
  
  // Crop overlay state
  const [croppingItemId, setCroppingItemId] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'UPLOAD' | 'EDIT' | 'RESULT'>('UPLOAD');
  const [dragActive, setDragActive] = useState(false);

  // Read dimensions of the file
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
    });
  };

  // Drag and drop setup
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFilesSelected(Array.from(e.target.files));
    }
  };

  const handleFilesSelected = async (files: File[]) => {
    const validImages = files.filter(f => f.type.startsWith('image/') || /\.(jpe?g|png)$/i.test(f.name));
    if (validImages.length === 0) return;

    setIsProcessing(true);
    const newItems: CompressedItem[] = [];

    for (const file of validImages) {
      const src = URL.createObjectURL(file);
      const img = await loadImage(src);

      newItems.push({
        id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: file.name,
        originalSize: file.size,
        originalWidth: img.naturalWidth || 800,
        originalHeight: img.naturalHeight || 600,
        src,
        compressedSize: file.size, // starts identical, calculated later
        compressedSrc: src,
        compressedWidth: img.naturalWidth || 800,
        compressedHeight: img.naturalHeight || 600,
        cropLeft: 0,
        cropRight: 0,
        cropTop: 0,
        cropBottom: 0
      });
    }

    setImages(newItems);
    setIsProcessing(false);
    setStep('EDIT');
  };

  // Crop parameters modifiers
  const updateCrop = (id: string, side: 'cropLeft' | 'cropRight' | 'cropTop' | 'cropBottom', val: number) => {
    setImages(prev => prev.map(img => {
      if (img.id === id) {
        // Capping Left+Right and Top+Bottom to avoid breaking aspect ratios
        if (side === 'cropLeft' && val + img.cropRight >= 90) return img;
        if (side === 'cropRight' && val + img.cropLeft >= 90) return img;
        if (side === 'cropTop' && val + img.cropBottom >= 90) return img;
        if (side === 'cropBottom' && val + img.cropTop >= 90) return img;
        return { ...img, [side]: val };
      }
      return img;
    }));
  };

  const updateCropMultiple = (id: string, values: { cropLeft: number, cropRight: number, cropTop: number, cropBottom: number }) => {
    setImages(prev => prev.map(img => {
      if (img.id === id) {
        return { ...img, ...values };
      }
      return img;
    }));
  };

  // Perform client-side compression on current state settings
  const runCompression = async () => {
    if (isLimitReached) {
      if (onLimitTrigger) onLimitTrigger();
      return;
    }
    setIsProcessing(true);
    const updatedItems = [...images];

    const targetBytes = targetSizeUnit === 'KB' 
      ? targetSizeValue * 1024 
      : targetSizeValue * 1024 * 1024;

    for (const item of updatedItems) {
      const img = await loadImage(item.src);
      
      const cropLeft = item.cropLeft || 0;
      const cropRight = item.cropRight || 0;
      const cropTop = item.cropTop || 0;
      const cropBottom = item.cropBottom || 0;

      // Map cropping source dimensions
      const sX = Math.round(item.originalWidth * (cropLeft / 100));
      const sY = Math.round(item.originalHeight * (cropTop / 100));
      const sWidth = Math.max(16, Math.round(item.originalWidth * (1 - (cropLeft + cropRight) / 100)));
      const sHeight = Math.max(16, Math.round(item.originalHeight * (1 - (cropTop + cropBottom) / 100)));

      if (compressionMode === 'TARGET_SIZE') {
        // Smart search algorithm
        let bestBlob: Blob | null = null;
        let bestWidth = sWidth;
        let bestHeight = sHeight;

        // Try standard downscaling grids to fit target size elegantly
        const scales = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];
        const qualities = [0.95, 0.85, 0.75, 0.65, 0.55, 0.45, 0.35, 0.25, 0.15, 0.05];

        let found = false;

        for (const currentScale of scales) {
          if (found) break;

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;

          const targetWidth = Math.max(16, Math.round(sWidth * currentScale));
          const targetHeight = Math.max(16, Math.round(sHeight * currentScale));
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          // Draw crop region on canvas
          ctx.drawImage(img, sX, sY, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

          for (const currentQuality of qualities) {
            const blob = await new Promise<Blob | null>((resolve) => {
              canvas.toBlob((b) => resolve(b), 'image/jpeg', currentQuality);
            });

            if (blob) {
              bestBlob = blob;
              bestWidth = targetWidth;
              bestHeight = targetHeight;

              // Break search if we are below target
              if (blob.size <= targetBytes) {
                found = true;
                break;
              }
            }
          }
        }

        if (bestBlob) {
          if (item.compressedSrc && item.compressedSrc !== item.src) {
            URL.revokeObjectURL(item.compressedSrc);
          }
          item.compressedSize = bestBlob.size;
          item.compressedSrc = URL.createObjectURL(bestBlob);
          item.compressedWidth = bestWidth;
          item.compressedHeight = bestHeight;
        }

      } else {
        // Manual Slider settings
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        const targetWidth = Math.max(16, Math.round(sWidth * scale));
        const targetHeight = Math.max(16, Math.round(sHeight * scale));

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Draw crop region onto canvas
        ctx.drawImage(img, sX, sY, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

        // Compress
        await new Promise<void>((resolve) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                if (item.compressedSrc && item.compressedSrc !== item.src) {
                  URL.revokeObjectURL(item.compressedSrc);
                }
                item.compressedSize = blob.size;
                item.compressedSrc = URL.createObjectURL(blob);
                item.compressedWidth = targetWidth;
                item.compressedHeight = targetHeight;
              }
              resolve();
            },
            'image/jpeg',
            quality
          );
        });
      }
    }

    setImages(updatedItems);
    setIsProcessing(false);
    setStep('RESULT');

    // Trigger Success History callback
    const totalNewSize = updatedItems.reduce((acc, curr) => acc + curr.compressedSize, 0);
    const sizeStr = totalNewSize < 1024 * 1024 
      ? `${(totalNewSize / 1024).toFixed(1)} KB` 
      : `${(totalNewSize / (1024 * 1024)).toFixed(2)} MB`;

    onSuccess(
      updatedItems.length === 1 ? 'compressed-image.jpg' : 'compressed-images.zip',
      sizeStr,
      updatedItems.length
    );
  };

  // Download logic (creates a ZIP if multiple, otherwise downloads single image)
  const handleDownload = async () => {
    if (images.length === 0) return;

    if (images.length === 1) {
      const item = images[0];
      const link = document.createElement('a');
      link.href = item.compressedSrc;
      link.download = `compressed-${item.name.replace(/\.[^/.]+$/, "")}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const zip = new JSZip();
      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        const response = await fetch(item.compressedSrc);
        const blob = await response.blob();
        zip.file(`compressed-${item.name.replace(/\.[^/.]+$/, "")}.jpg`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'imgdocs-compressed.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    }
  };

  const handleDeleteItem = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(item => item.id !== id);
      if (filtered.length === 0) {
        setStep('UPLOAD');
      }
      return filtered;
    });
  };

  const handleReset = () => {
    images.forEach(item => {
      URL.revokeObjectURL(item.src);
      if (item.compressedSrc !== item.src) {
        URL.revokeObjectURL(item.compressedSrc);
      }
    });
    setImages([]);
    setStep('UPLOAD');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const calculateSavingsPercent = (original: number, compressed: number) => {
    if (original === 0) return 0;
    const diff = original - compressed;
    return Math.max(0, Math.round((diff / original) * 100));
  };

  const activeCroppingItem = images.find(img => img.id === croppingItemId);

  return (
    <div className="mx-auto w-full max-w-5xl" id="compress-tool-workspace">
      {step === 'UPLOAD' && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group flex min-h-[380px] cursor-pointer flex-col items-center justify-center rounded-2xl border-3 border-dashed px-6 py-12 text-center transition-all duration-300 ${
            dragActive
              ? 'border-primary bg-primary-light scale-[1.01]'
              : 'border-slate-300 bg-white hover:border-slate-400 hover:shadow-lg'
          }`}
          id="compress-drop-zone"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />

          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-primary group-hover:scale-105 transition-all">
            <Sliders className="h-10 w-10" />
          </div>

          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Compress & Crop Images
          </h1>
          <p className="mt-3 text-lg font-medium text-slate-500">
            Reduce image file size to a target metric, scale dimensions, and crop client-side.
          </p>

          <button
            type="button"
            className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-bold text-white shadow-lg shadow-red-500/20 hover:bg-primary-hover active:scale-95 transition-all cursor-pointer"
          >
            <ImageIcon className="h-5 w-5" />
            Select Images to Compress
          </button>
          <span className="mt-4 text-sm font-semibold text-slate-400">
            or drop JPG/PNG files here
          </span>
        </div>
      )}

      {step === 'EDIT' && (
        <div className="flex flex-col gap-8 lg:flex-row items-start" id="compress-editor-layout">
          {/* Main workspace listing items */}
          <div className="flex-1 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between shadow-sm">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Configure {images.length} Image{images.length > 1 ? 's' : ''} For Compression
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-primary bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg cursor-pointer"
              >
                + Add more
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" id="compress-editor-grid">
              {images.map((item) => {
                const isCropped = item.cropLeft > 0 || item.cropRight > 0 || item.cropTop > 0 || item.cropBottom > 0;
                return (
                  <div key={item.id} className="group relative rounded-xl border border-slate-200 bg-white p-3 flex flex-col justify-between hover:shadow-md transition-shadow">
                    
                    {/* Action buttons overlay on hover */}
                    <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setCroppingItemId(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900/80 text-white hover:bg-primary transition-colors cursor-pointer"
                        title="Crop Image"
                      >
                        <Maximize className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900/80 text-white hover:bg-red-600 transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Image thumbnail viewport */}
                    <div className="flex-1 relative flex items-center justify-center overflow-hidden aspect-square rounded-lg bg-slate-50 border border-slate-100">
                      <img src={item.src} alt={item.name} className="max-h-24 max-w-full object-contain" referrerPolicy="no-referrer" />
                      
                      {/* Visual Crop overlay indicator if cropped */}
                      {isCropped && (
                        <span className="absolute bottom-2 left-2 inline-flex items-center rounded bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wide">
                          Cropped
                        </span>
                      )}
                    </div>

                    <div className="mt-2 text-center">
                      <p className="truncate text-xs font-semibold text-slate-700 font-display" title={item.name}>{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{formatSize(item.originalSize)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sizing & quality panel */}
          <aside className="w-full lg:w-[350px] shrink-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-md space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-display text-xl font-bold text-slate-800">Compression Panel</h3>
              <p className="text-xs text-slate-400 mt-1">Configure your image footprint reduction parameters.</p>
            </div>

            {/* Compression Mode Selector */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setCompressionMode('SLIDERS')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  compressionMode === 'SLIDERS' 
                    ? 'bg-white text-slate-800 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Manual Settings
              </button>
              <button
                type="button"
                onClick={() => setCompressionMode('TARGET_SIZE')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  compressionMode === 'TARGET_SIZE' 
                    ? 'bg-white text-slate-800 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Target File Size
              </button>
            </div>

            {compressionMode === 'SLIDERS' ? (
              <div className="space-y-6 animate-fade-in">
                {/* Quality Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-700 uppercase tracking-wide text-xs">Image Quality</span>
                    <span className="font-bold text-primary font-mono">{Math.round(quality * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>MAX COMPRESSION</span>
                    <span>BEST QUALITY</span>
                  </div>
                </div>

                {/* Scale Reducer Slider */}
                <div className="space-y-3 border-t border-slate-100 pt-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-700 uppercase tracking-wide text-xs">Resize Dimensions</span>
                    <span className="font-bold text-primary font-mono">{Math.round(scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>10% (SMALLEST DIMENSIONS)</span>
                    <span>100% (ORIGINAL PIXELS)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in border-slate-100 pt-1">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Set Target Size Limit
                  </label>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 focus-within:border-primary focus-within:bg-white transition-colors">
                    <input
                      type="number"
                      min="1"
                      value={targetSizeValue}
                      onChange={(e) => setTargetSizeValue(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full bg-transparent px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none"
                    />
                    <select
                      value={targetSizeUnit}
                      onChange={(e) => setTargetSizeUnit(e.target.value as 'KB' | 'MB')}
                      className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-xs border border-slate-100 focus:outline-none"
                    >
                      <option value="KB">KB</option>
                      <option value="MB">MB</option>
                    </select>
                  </div>
                </div>
                <p className="text-[11px] font-medium text-slate-400">
                  Our compression engine will run iteratively to scale down resolution and adjust quality parameters automatically until each image size fits cleanly under <strong className="text-slate-600">{targetSizeValue} {targetSizeUnit}</strong>.
                </p>
              </div>
            )}

            {/* Trigger Button */}
            <button
              type="button"
              onClick={runCompression}
              disabled={isProcessing}
              className="w-full mt-6 flex items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-bold text-white hover:bg-primary-hover shadow-lg shadow-red-500/20 transition-all active:scale-[0.98] disabled:bg-slate-300 cursor-pointer"
            >
              <span>Compress Files</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </aside>
        </div>
      )}

      {step === 'RESULT' && (
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center rounded-2xl bg-white p-8 md:p-12 border border-slate-100 shadow-xl text-center animate-fade-in">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 shadow-lg">
            <CheckCircle2 className="h-12 w-12" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 uppercase tracking-wide">
            COMPRESSION COMPLETED
          </span>

          <h2 className="font-display text-3xl font-extrabold text-slate-800 mt-4">Images compressed successfully!</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">Download your resized file or package below.</p>

          {/* Savings summary stats card */}
          <div className="mt-8 grid grid-cols-3 gap-4 border-y border-slate-100 py-6 w-full text-center">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Original Size</span>
              <span className="text-base font-bold text-slate-700 font-mono mt-1 block">
                {formatSize(images.reduce((acc, curr) => acc + curr.originalSize, 0))}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Compressed Size</span>
              <span className="text-base font-bold text-primary font-mono mt-1 block">
                {formatSize(images.reduce((acc, curr) => acc + curr.compressedSize, 0))}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Total Saving</span>
              <span className="text-base font-extrabold text-emerald-600 mt-1 block">
                {calculateSavingsPercent(
                  images.reduce((acc, curr) => acc + curr.originalSize, 0),
                  images.reduce((acc, curr) => acc + curr.compressedSize, 0)
                )}% Less
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 w-full space-y-4">
            <button
              type="button"
              onClick={handleDownload}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 px-6 text-lg font-bold text-white shadow-xl hover:bg-primary-hover active:scale-[0.99] transition-all cursor-pointer"
            >
              <Download className="h-5.5 w-5.5" />
              <span>Download Compressed Images</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 px-6 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Compress another batch</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Crop Modal Portal */}
      {croppingItemId && activeCroppingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-lg font-bold text-slate-800">Crop Image</h3>
              <button 
                onClick={() => setCroppingItemId(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Visual Crop Preview */}
            <div className="relative overflow-hidden border border-slate-200 bg-slate-100 rounded-lg max-h-[300px] flex items-center justify-center select-none">
              <img 
                src={activeCroppingItem.src} 
                className="max-h-[300px] object-contain" 
              />
              {/* Highlighted Crop Area Box */}
              <div 
                className="absolute border-2 border-primary bg-black/15 shadow-[0_0_0_9999px_rgba(15,23,42,0.65)]"
                style={{
                  left: `${activeCroppingItem.cropLeft}%`,
                  right: `${activeCroppingItem.cropRight}%`,
                  top: `${activeCroppingItem.cropTop}%`,
                  bottom: `${activeCroppingItem.cropBottom}%`,
                }}
              />
            </div>

            {/* Sliders for the 4 crop boundaries */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Left Crop</span>
                    <span>{activeCroppingItem.cropLeft}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="45"
                    value={activeCroppingItem.cropLeft}
                    onChange={(e) => updateCrop(croppingItemId, 'cropLeft', parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-100 rounded appearance-none cursor-pointer accent-primary"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Right Crop</span>
                    <span>{activeCroppingItem.cropRight}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="45"
                    value={activeCroppingItem.cropRight}
                    onChange={(e) => updateCrop(croppingItemId, 'cropRight', parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-100 rounded appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Top Crop</span>
                    <span>{activeCroppingItem.cropTop}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="45"
                    value={activeCroppingItem.cropTop}
                    onChange={(e) => updateCrop(croppingItemId, 'cropTop', parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-100 rounded appearance-none cursor-pointer accent-primary"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Bottom Crop</span>
                    <span>{activeCroppingItem.cropBottom}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="45"
                    value={activeCroppingItem.cropBottom}
                    onChange={(e) => updateCrop(croppingItemId, 'cropBottom', parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-100 rounded appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>
            </div>

            {/* Preset helpers */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Presets:</span>
              <button 
                onClick={() => {
                  updateCropMultiple(croppingItemId, { cropLeft: 0, cropRight: 0, cropTop: 0, cropBottom: 0 });
                }}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                Reset
              </button>
              <button 
                onClick={() => {
                  updateCropMultiple(croppingItemId, { cropLeft: 15, cropRight: 15, cropTop: 0, cropBottom: 0 });
                }}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                Portrait (Tall)
              </button>
              <button 
                onClick={() => {
                  updateCropMultiple(croppingItemId, { cropLeft: 0, cropRight: 0, cropTop: 15, cropBottom: 15 });
                }}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                Landscape (Wide)
              </button>
              <button 
                onClick={() => {
                  // Make it a perfect center square crop
                  const diff = Math.abs(activeCroppingItem.originalWidth - activeCroppingItem.originalHeight);
                  if (activeCroppingItem.originalWidth > activeCroppingItem.originalHeight) {
                    const margin = Math.round((diff / activeCroppingItem.originalWidth) * 50);
                    updateCropMultiple(croppingItemId, { cropLeft: margin, cropRight: margin, cropTop: 0, cropBottom: 0 });
                  } else {
                    const margin = Math.round((diff / activeCroppingItem.originalHeight) * 50);
                    updateCropMultiple(croppingItemId, { cropLeft: 0, cropRight: 0, cropTop: margin, cropBottom: margin });
                  }
                }}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                Square (1:1)
              </button>
            </div>

            <button 
              onClick={() => setCroppingItemId(null)}
              className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-lg hover:bg-primary-hover transition-colors cursor-pointer mt-2"
            >
              Apply Crop Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
