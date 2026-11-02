/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Crop, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, 
  Download, RefreshCw, Check, Copy, FileText, Image as ImageIcon,
  Sliders, ShieldCheck, Sparkles, ZoomIn, ZoomOut
} from 'lucide-react';
import { jsPDF } from 'jspdf';

interface CropImageToolProps {
  onSuccess?: (fileName: string, fileSize: string, count: number) => void;
  userId?: string;
  isLimitReached?: boolean;
  onLimitTrigger?: () => void;
}

type AspectRatioOption = 'free' | 'original' | '1:1' | '16:9' | '4:3' | '9:16' | '3:2' | '2:3';

interface CropBox {
  x: number; // percentage 0..100
  y: number; // percentage 0..100
  width: number; // percentage 0..100
  height: number; // percentage 0..100
}

export default function CropImageTool({
  onSuccess,
  userId,
  isLimitReached,
  onLimitTrigger
}: CropImageToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [step, setStep] = useState<'UPLOAD' | 'CROP' | 'RESULT'>('UPLOAD');

  // Aspect Ratio & Crop Box state
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('free');
  const [cropBox, setCropBox] = useState<CropBox>({ x: 10, y: 10, width: 80, height: 80 });
  const [isCircle, setIsCircle] = useState(false);

  // Manipulations
  const [rotation, setRotation] = useState<number>(0); // -270..270
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(100); // 100% to 250%

  // Output settings
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg' | 'webp' | 'pdf'>('png');
  const [quality, setQuality] = useState<number>(90); // 10 to 100

  // Result state
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultFileName, setResultFileName] = useState<string>('');
  const [resultFileSize, setResultFileSize] = useState<string>('');
  const [croppedDimensions, setCroppedDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Dragging state for crop handles
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDraggingBox, setIsDraggingBox] = useState(false);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; crop: CropBox }>({
    x: 0,
    y: 0,
    crop: { x: 10, y: 10, width: 80, height: 80 }
  });

  // Handle File Select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const processSelectedFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WEBP, GIF, SVG, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const src = evt.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        setImageSrc(src);
        setFile(selectedFile);
        setCropBox({ x: 10, y: 10, width: 80, height: 80 });
        setRotation(0);
        setFlipH(false);
        setFlipV(false);
        setZoom(100);
        setStep('CROP');
      };
      img.src = src;
    };
    reader.readAsDataURL(selectedFile);
  };

  // Adjust crop box based on aspect ratio
  useEffect(() => {
    if (aspectRatio === 'free') return;

    let targetRatio = 1;
    if (aspectRatio === 'original') {
      targetRatio = (imageDimensions.width || 1) / (imageDimensions.height || 1);
    } else if (aspectRatio === '1:1') {
      targetRatio = 1;
    } else if (aspectRatio === '16:9') {
      targetRatio = 16 / 9;
    } else if (aspectRatio === '4:3') {
      targetRatio = 4 / 3;
    } else if (aspectRatio === '9:16') {
      targetRatio = 9 / 16;
    } else if (aspectRatio === '3:2') {
      targetRatio = 3 / 2;
    } else if (aspectRatio === '2:3') {
      targetRatio = 2 / 3;
    }

    const imgRatio = (imageDimensions.width || 800) / (imageDimensions.height || 600);
    
    let newWidth = 80;
    let newHeight = (newWidth / targetRatio) * imgRatio;

    if (newHeight > 80) {
      newHeight = 80;
      newWidth = (newHeight * targetRatio) / imgRatio;
    }

    const newX = Math.max(0, (100 - newWidth) / 2);
    const newY = Math.max(0, (100 - newHeight) / 2);

    setCropBox({
      x: newX,
      y: newY,
      width: Math.min(100, newWidth),
      height: Math.min(100, newHeight)
    });
  }, [aspectRatio, imageDimensions]);

  // Handle Wheel Zoom
  const handleWheelZoom = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 10 : -10;
    setZoom((prev) => Math.min(300, Math.max(100, prev + delta)));
  };

  // Pointer / Mouse events for dragging crop box and handles
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, handle: string | null = null) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    
    if (handle) {
      setActiveHandle(handle);
    } else {
      setIsDraggingBox(true);
    }
    
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      crop: { ...cropBox }
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    if (!isDraggingBox && !activeHandle) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaXPercent = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaYPercent = ((e.clientY - dragStart.y) / rect.height) * 100;

    if (isDraggingBox) {
      const newX = Math.max(0, Math.min(100 - dragStart.crop.width, dragStart.crop.x + deltaXPercent));
      const newY = Math.max(0, Math.min(100 - dragStart.crop.height, dragStart.crop.y + deltaYPercent));
      setCropBox(prev => ({ ...prev, x: newX, y: newY }));
      return;
    }

    if (activeHandle) {
      let { x, y, width, height } = dragStart.crop;

      if (activeHandle.includes('e')) {
        width = Math.max(5, Math.min(100 - x, dragStart.crop.width + deltaXPercent));
      }
      if (activeHandle.includes('s')) {
        height = Math.max(5, Math.min(100 - y, dragStart.crop.height + deltaYPercent));
      }
      if (activeHandle.includes('w')) {
        const possibleWidth = dragStart.crop.width - deltaXPercent;
        if (possibleWidth >= 5 && dragStart.crop.x + deltaXPercent >= 0) {
          x = dragStart.crop.x + deltaXPercent;
          width = possibleWidth;
        }
      }
      if (activeHandle.includes('n')) {
        const possibleHeight = dragStart.crop.height - deltaYPercent;
        if (possibleHeight >= 5 && dragStart.crop.y + deltaYPercent >= 0) {
          y = dragStart.crop.y + deltaYPercent;
          height = possibleHeight;
        }
      }

      setCropBox({ x, y, width, height });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setIsDraggingBox(false);
    setActiveHandle(null);
  };

  // Perform the high-resolution crop on canvas
  const handleExecuteCrop = async () => {
    if (!imageSrc || !file) return;
    if (isLimitReached && onLimitTrigger) {
      onLimitTrigger();
      return;
    }

    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageSrc;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to create canvas context');

      const origW = img.naturalWidth;
      const origH = img.naturalHeight;

      let cropPixelX = (cropBox.x / 100) * origW;
      let cropPixelY = (cropBox.y / 100) * origH;
      let cropPixelW = (cropBox.width / 100) * origW;
      let cropPixelH = (cropBox.height / 100) * origH;

      cropPixelX = Math.max(0, Math.min(origW - 10, cropPixelX));
      cropPixelY = Math.max(0, Math.min(origH - 10, cropPixelY));
      cropPixelW = Math.max(10, Math.min(origW - cropPixelX, cropPixelW));
      cropPixelH = Math.max(10, Math.min(origH - cropPixelY, cropPixelH));

      canvas.width = Math.round(cropPixelW);
      canvas.height = Math.round(cropPixelH);

      ctx.save();

      if (isCircle) {
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2, 0, Math.PI * 2);
        ctx.clip();
      }

      ctx.drawImage(
        img,
        cropPixelX,
        cropPixelY,
        cropPixelW,
        cropPixelH,
        0,
        0,
        canvas.width,
        canvas.height
      );

      ctx.restore();

      // Normalize rotation (0, 90, 180, 270)
      const normRot = ((rotation % 360) + 360) % 360;

      let finalCanvas = canvas;
      if (normRot !== 0 || flipH || flipV) {
        const rotCanvas = document.createElement('canvas');
        const is90or270 = normRot === 90 || normRot === 270;
        rotCanvas.width = is90or270 ? canvas.height : canvas.width;
        rotCanvas.height = is90or270 ? canvas.width : canvas.height;

        const rotCtx = rotCanvas.getContext('2d');
        if (rotCtx) {
          rotCtx.translate(rotCanvas.width / 2, rotCanvas.height / 2);
          rotCtx.rotate((normRot * Math.PI) / 180);
          rotCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
          rotCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
          finalCanvas = rotCanvas;
        }
      }

      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'cropped-image';
      
      if (exportFormat === 'pdf') {
        const pdf = new jsPDF({
          orientation: finalCanvas.width > finalCanvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [finalCanvas.width, finalCanvas.height]
        });

        const imgData = finalCanvas.toDataURL('image/jpeg', quality / 100);
        pdf.addImage(imgData, 'JPEG', 0, 0, finalCanvas.width, finalCanvas.height);

        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const fileName = `${baseName}-cropped.pdf`;
        const fileSizeStr = pdfBlob.size < 1024 * 1024 
          ? `${(pdfBlob.size / 1024).toFixed(1)} KB` 
          : `${(pdfBlob.size / (1024 * 1024)).toFixed(2)} MB`;

        setResultUrl(pdfUrl);
        setResultBlob(pdfBlob);
        setResultFileName(fileName);
        setResultFileSize(fileSizeStr);
        setCroppedDimensions({ width: finalCanvas.width, height: finalCanvas.height });
        setStep('RESULT');

        if (onSuccess) onSuccess(fileName, fileSizeStr, 1);
      } else {
        const mimeType = exportFormat === 'png' ? 'image/png' : (exportFormat === 'webp' ? 'image/webp' : 'image/jpeg');
        const dataUrl = finalCanvas.toDataURL(mimeType, quality / 100);

        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const fileName = `${baseName}-cropped.${exportFormat}`;
        const fileSizeStr = blob.size < 1024 * 1024 
          ? `${(blob.size / 1024).toFixed(1)} KB` 
          : `${(blob.size / (1024 * 1024)).toFixed(2)} MB`;

        setResultUrl(url);
        setResultBlob(blob);
        setResultFileName(fileName);
        setResultFileSize(fileSizeStr);
        setCroppedDimensions({ width: finalCanvas.width, height: finalCanvas.height });
        setStep('RESULT');

        if (onSuccess) onSuccess(fileName, fileSizeStr, 1);
      }
    } catch (err) {
      console.error('Crop error:', err);
      alert('An error occurred during image cropping. Please try another image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl || !resultFileName) return;
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = resultFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyClipboard = async () => {
    if (!resultBlob || exportFormat === 'pdf') return;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ [resultBlob.type]: resultBlob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert('Failed to copy image to clipboard.');
    }
  };

  const handleReset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setImageSrc(null);
    setResultUrl(null);
    setResultBlob(null);
    setStep('UPLOAD');
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8" id="crop-image-tool-root">
      
      {/* HEADER BANNER */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Crop className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold font-display text-slate-900 dark:text-slate-100">
                Crop Image & Photo Editor
              </h1>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                100% Free
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Crop JPG, PNG, WEBP, and GIF images with interactive presets (1:1, 16:9, 4:3, 9:16) directly in browser memory.
            </p>
          </div>
        </div>
      </div>

      {/* STEP 1: UPLOAD ZONE */}
      {step === 'UPLOAD' && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="group relative flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-8 text-center transition-all hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10"
          onClick={() => document.getElementById('crop-file-input')?.click()}
        >
          <input
            id="crop-file-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
            <Upload className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold font-display text-slate-800 dark:text-slate-100">
            Select or Drop Image Here to Crop
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            Supports JPG, JPEG, PNG, WEBP, GIF, SVG, BMP up to 50MB. Processed 100% locally on your device.
          </p>
          
          <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white px-5 py-2.5 text-xs font-bold transition-all shadow-md">
            <ImageIcon className="h-4 w-4" />
            <span>Browse Computer Photos</span>
          </div>

          <div className="mt-6 flex items-center gap-6 text-[11px] font-medium text-slate-400">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Zero Uploads</span>
            <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-blue-500" /> High Precision</span>
            <span className="flex items-center gap-1.5"><Crop className="h-3.5 w-3.5 text-indigo-500" /> Custom Presets</span>
          </div>
        </div>
      )}

      {/* STEP 2: INTERACTIVE CROPPER WORKSPACE */}
      {step === 'CROP' && imageSrc && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: CANVAS PREVIEW & HANDLES */}
          <div className="lg:col-span-8 space-y-4">
            <div 
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 p-4 shadow-inner relative overflow-hidden flex flex-col items-center justify-center min-h-[420px]"
              onWheel={handleWheelZoom}
            >
              
              <div
                ref={containerRef}
                className="relative select-none max-w-full max-h-[520px] overflow-hidden rounded-lg shadow-2xl flex items-center justify-center"
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                  transition: isDraggingBox || activeHandle ? 'none' : 'transform 0.2s ease-out'
                }}
              >
                {/* Background Original Image */}
                <img
                  src={imageSrc}
                  alt="Source"
                  className="max-h-[480px] w-auto object-contain block pointer-events-none"
                />

                {/* Dark Overlay Outside Crop Area */}
                <div className="absolute inset-0 bg-black/60 pointer-events-none" />

                {/* Active Crop Box Window */}
                <div
                  className={`absolute border-2 border-emerald-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] cursor-move ${
                    isCircle ? 'rounded-full' : ''
                  }`}
                  style={{
                    left: `${cropBox.x}%`,
                    top: `${cropBox.y}%`,
                    width: `${cropBox.width}%`,
                    height: `${cropBox.height}%`
                  }}
                  onPointerDown={(e) => handlePointerDown(e, null)}
                >
                  {/* Grid Lines */}
                  {!isCircle && (
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                      <div className="border-r border-b border-emerald-400/30" />
                      <div className="border-r border-b border-emerald-400/30" />
                      <div className="border-b border-emerald-400/30" />
                      <div className="border-r border-b border-emerald-400/30" />
                      <div className="border-r border-b border-emerald-400/30" />
                      <div className="border-b border-emerald-400/30" />
                      <div className="border-r border-emerald-400/30" />
                      <div className="border-r border-emerald-400/30" />
                      <div />
                    </div>
                  )}

                  {/* Corner Handles */}
                  {!isCircle && (
                    <>
                      <div
                        className="absolute -left-1.5 -top-1.5 h-3.5 w-3.5 bg-emerald-400 border border-slate-900 cursor-nwse-resize rounded-xs"
                        onPointerDown={(e) => handlePointerDown(e, 'nw')}
                      />
                      <div
                        className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 bg-emerald-400 border border-slate-900 cursor-nesw-resize rounded-xs"
                        onPointerDown={(e) => handlePointerDown(e, 'ne')}
                      />
                      <div
                        className="absolute -left-1.5 -bottom-1.5 h-3.5 w-3.5 bg-emerald-400 border border-slate-900 cursor-nesw-resize rounded-xs"
                        onPointerDown={(e) => handlePointerDown(e, 'sw')}
                      />
                      <div
                        className="absolute -right-1.5 -bottom-1.5 h-3.5 w-3.5 bg-emerald-400 border border-slate-900 cursor-nwse-resize rounded-xs"
                        onPointerDown={(e) => handlePointerDown(e, 'se')}
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono flex items-center gap-3">
                <span>Orig: {imageDimensions.width} × {imageDimensions.height}px</span>
                <span>•</span>
                <span>Crop: {Math.round((cropBox.width / 100) * imageDimensions.width)} × {Math.round((cropBox.height / 100) * imageDimensions.height)}px</span>
              </div>
            </div>

            {/* QUICK ACTIONS BAR */}
            <div className="flex items-center justify-between gap-2 flex-wrap bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setRotation((r) => r - 90)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                  title="Rotate 90 degrees counter-clockwise"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>90° CCW</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRotation((r) => r + 90)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                  title="Rotate 90 degrees clockwise"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>90° CW</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFlipH(!flipH)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold cursor-pointer transition-colors ${
                    flipH ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                  title="Flip Horizontal"
                >
                  <FlipHorizontal className="h-3.5 w-3.5" />
                  <span>Flip H</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFlipV(!flipV)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold cursor-pointer transition-colors ${
                    flipV ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                  title="Flip Vertical"
                >
                  <FlipVertical className="h-3.5 w-3.5" />
                  <span>Flip V</span>
                </button>
              </div>

              {/* Zoom Slider */}
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(100, z - 25))}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <input
                  type="range"
                  min="100"
                  max="300"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-24 accent-emerald-500 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(300, z + 25))}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <span className="text-[11px] w-8 text-right font-mono">{zoom}%</span>
              </div>
            </div>
          </div>

          {/* RIGHT: CONTROLS & EXPORT PANEL */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* ASPECT RATIO PRESETS */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <Crop className="h-4 w-4 text-emerald-500" />
                Aspect Ratio Presets
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'free', label: 'Freeform', icon: '✨' },
                  { id: 'original', label: 'Original Ratio', icon: '📷' },
                  { id: '1:1', label: '1:1 Square', icon: '⏹️' },
                  { id: '16:9', label: '16:9 Land', icon: '📺' },
                  { id: '4:3', label: '4:3 Std', icon: '🖼️' },
                  { id: '9:16', label: '9:16 Story', icon: '📱' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setAspectRatio(preset.id as AspectRatioOption)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      aspectRatio === preset.id
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-base">{preset.icon}</span>
                    <span className="mt-1 text-[11px]">{preset.label}</span>
                  </button>
                ))}
              </div>

              {/* Circle Mask Toggle */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Circle Mask Preview
                </span>
                <button
                  type="button"
                  onClick={() => setIsCircle(!isCircle)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    isCircle ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    isCircle ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            {/* EXPORT OPTIONS */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-500" />
                Export Settings
              </h3>

              {/* Format selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Output Format</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['png', 'jpg', 'webp', 'pdf'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setExportFormat(fmt)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                        exportFormat === fmt
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality slider if JPEG or WEBP */}
              {(exportFormat === 'jpg' || exportFormat === 'webp' || exportFormat === 'pdf') && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>JPEG / Compression Quality</span>
                    <span className="text-emerald-600 font-mono">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              )}

              {/* CROP BUTTON */}
              <button
                type="button"
                onClick={handleExecuteCrop}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Processing Crop...</span>
                  </>
                ) : (
                  <>
                    <Crop className="h-4 w-4" />
                    <span>Crop & Export Image</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold py-2.5 text-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Select Different Image</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* STEP 3: RESULT SCREEN */}
      {step === 'RESULT' && resultUrl && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl text-center space-y-6 max-w-2xl mx-auto animate-fade-in">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Check className="h-8 w-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black font-display text-slate-900 dark:text-slate-100">
              Image Cropped Successfully!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your cropped image was created 100% locally in your browser RAM.
            </p>
          </div>

          {/* CROPPED IMAGE PREVIEW */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-4 max-h-[300px] flex items-center justify-center overflow-hidden">
            {exportFormat === 'pdf' ? (
              <div className="flex flex-col items-center gap-2 text-slate-300">
                <FileText className="h-16 w-16 text-emerald-400" />
                <span className="text-xs font-bold">{resultFileName}</span>
              </div>
            ) : (
              <img
                src={resultUrl}
                alt="Cropped Result"
                className="max-h-[260px] w-auto object-contain rounded-lg shadow-md"
              />
            )}
          </div>

          {/* METADATA CHIPS */}
          <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-400 flex-wrap">
            <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
              Size: {resultFileSize}
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
              Format: {exportFormat.toUpperCase()}
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
              Dimensions: {croppedDimensions.width} × {croppedDimensions.height}px
            </span>
          </div>

          {/* DOWNLOAD & COPY BUTTONS */}
          <div className="flex items-center gap-3 justify-center flex-wrap pt-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download Cropped File</span>
            </button>

            {exportFormat !== 'pdf' && (
              <button
                type="button"
                onClick={handleCopyClipboard}
                className="flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold py-3.5 px-5 text-xs transition-all cursor-pointer"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setStep('CROP')}
              className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold py-3.5 px-5 text-xs transition-colors cursor-pointer"
            >
              <Crop className="h-4 w-4" />
              <span>Adjust Crop / Format</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold py-3.5 px-5 text-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Crop Another Photo</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
