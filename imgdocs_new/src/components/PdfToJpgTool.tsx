/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  RefreshCw, 
  Layers, 
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Loader2,
  Settings,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import JSZip from 'jszip';

interface PDFPageItem {
  pageNumber: number;
  src: string; // generated preview image source
  width: number;
  height: number;
}

interface PdfToJpgToolProps {
  onSuccess: (fileName: string, fileSize: string, count: number) => void;
  userId?: string | null;
  isLimitReached?: boolean;
  onLimitTrigger?: () => void;
}

export default function PdfToJpgTool({ onSuccess, userId, isLimitReached, onLimitTrigger }: PdfToJpgToolProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPages, setPdfPages] = useState<PDFPageItem[]>([]);
  const [scale, setScale] = useState<number>(1.5); // Resolution scale (1x, 1.5x, 2x)
  const [format, setFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [step, setStep] = useState<'UPLOAD' | 'EDIT' | 'RESULT'>('UPLOAD');
  const [dragActive, setDragActive] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  // Dynamically load PDF.js from highly reliable cdnjs script tags to bypass local compilation complexity
  useEffect(() => {
    if ((window as any).pdfjsLib) {
      setPdfjsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setPdfjsLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load PDF.js engine from CDN');
    };
    document.body.appendChild(script);
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) return;
    setPdfFile(file);
    setIsProcessing(true);
    setLoadingText('Loading PDF and preparing converter pages...');

    try {
      let pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib) {
        for (let t = 0; t < 30; t++) {
          await new Promise(r => setTimeout(r, 100));
          if ((window as any).pdfjsLib) {
            pdfjsLib = (window as any).pdfjsLib;
            break;
          }
        }
      }

      if (!pdfjsLib) {
        throw new Error("PDF processing engine is still initializing. Please retry in a moment.");
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const pagesCount = pdf.numPages;

      const loadedPages: PDFPageItem[] = [];

      for (let i = 1; i <= pagesCount; i++) {
        setLoadingText(`Rendering preview for page ${i} of ${pagesCount}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.6 }); // lower scale for fast thumbnails

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        const src = canvas.toDataURL('image/jpeg', 0.85);
        loadedPages.push({
          pageNumber: i,
          src,
          width: viewport.width,
          height: viewport.height
        });
      }

      setPdfPages(loadedPages);
      setStep('EDIT');
    } catch (err) {
      console.error('Error rendering PDF:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Process the full scale rendering for high resolution output
  const handleRenderFullImages = async () => {
    if (!pdfFile) return;
    if (isLimitReached) {
      if (onLimitTrigger) onLimitTrigger();
      return;
    }
    setIsProcessing(true);
    setLoadingText('Compiling PDF pages into high-resolution JPG images...');

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfjsLib = (window as any).pdfjsLib;
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const pagesCount = pdf.numPages;

      const fullPages: PDFPageItem[] = [];

      for (let i = 1; i <= pagesCount; i++) {
        setLoadingText(`Processing page ${i} of ${pagesCount} at ${scale}x scale...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        const src = canvas.toDataURL(mimeType, 0.92);
        
        fullPages.push({
          pageNumber: i,
          src,
          width: viewport.width,
          height: viewport.height
        });
      }

      setPdfPages(fullPages);
      setStep('RESULT');

      // Save record callback
      onSuccess(
        pagesCount === 1 ? 'extracted-page.jpg' : 'extracted-images.zip',
        `${pagesCount} extracted image${pagesCount > 1 ? 's' : ''}`,
        pagesCount
      );
    } catch (err) {
      console.error('Error in full rendering:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (pdfPages.length === 0) return;

    if (pdfPages.length === 1) {
      const item = pdfPages[0];
      const link = document.createElement('a');
      link.href = item.src;
      link.download = `extracted-page-${item.pageNumber}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const zip = new JSZip();
      for (let i = 0; i < pdfPages.length; i++) {
        const item = pdfPages[i];
        const response = await fetch(item.src);
        const blob = await response.blob();
        zip.file(`extracted-page-${item.pageNumber}.${format}`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${pdfFile?.name.replace(/\.[^/.]+$/, "") || 'extracted'}-images.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    }
  };

  const handleReset = () => {
    setPdfFile(null);
    setPdfPages([]);
    setStep('UPLOAD');
  };

  return (
    <div className="mx-auto w-full max-w-5xl" id="pdf-to-jpg-workspace">
      {!pdfjsLoaded && (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border text-slate-500">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <h3 className="font-bold text-slate-800">Bootstrapping PDF rendering engine...</h3>
          <p className="text-xs mt-1">Please wait while the page renders the compilation modules.</p>
        </div>
      )}

      {pdfjsLoaded && step === 'UPLOAD' && (
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
          id="pdf-to-jpg-drop-zone"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="hidden"
          />

          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-primary group-hover:scale-105 transition-all">
            <FileText className="h-10 w-10" />
          </div>

          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            PDF to JPG Converter
          </h1>
          <p className="mt-3 text-lg font-medium text-slate-500">
            Extract PDF pages as individual high-quality JPG/PNG images entirely client-side.
          </p>

          {isProcessing ? (
            <div className="mt-8 flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm font-semibold text-slate-600">{loadingText}</span>
            </div>
          ) : (
            <button
              type="button"
              className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-bold text-white shadow-lg shadow-red-500/20 hover:bg-primary-hover active:scale-95 transition-all cursor-pointer"
            >
              <ImageIcon className="h-5 w-5" />
              Select PDF File
            </button>
          )}

          {!isProcessing && (
            <span className="mt-4 text-sm font-semibold text-slate-400">
              or drop PDF file here
            </span>
          )}
        </div>
      )}

      {pdfjsLoaded && step === 'EDIT' && (
        <div className="flex flex-col gap-8 lg:flex-row items-start" id="pdf-to-jpg-editor-layout">
          {/* Main list view of loaded pages */}
          <div className="flex-1 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between shadow-sm">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Extracted PDF Pages ({pdfPages.length})
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg cursor-pointer"
              >
                Choose other PDF
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6" id="pdf-to-jpg-preview-grid">
              {pdfPages.map((page) => (
                <div key={page.pageNumber} className="relative rounded-xl border border-slate-200 bg-white p-3 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="absolute top-2 left-2 rounded bg-slate-900/80 px-2 py-0.5 text-[9px] font-bold text-white z-10">
                    Page {page.pageNumber}
                  </div>

                  <div className="flex-1 flex items-center justify-center overflow-hidden aspect-[1/1.3] rounded bg-slate-50 border border-slate-100 relative">
                    <img src={page.src} alt={`Page ${page.pageNumber}`} className="max-h-36 max-w-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Options side controls */}
          <aside className="w-full lg:w-[350px] shrink-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-md space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-display text-xl font-bold text-slate-800">Export Settings</h3>
              <p className="text-xs text-slate-400 mt-1">Configure format and quality parameters.</p>
            </div>

            {/* Export Format (JPEG/PNG) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Image Format</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormat('jpeg')}
                  className={`py-3.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                    format === 'jpeg'
                      ? 'border-primary bg-primary-light text-primary ring-2 ring-red-100'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  JPG (Fast, standard)
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('png')}
                  className={`py-3.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                    format === 'png'
                      ? 'border-primary bg-primary-light text-primary ring-2 ring-red-100'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  PNG (Crisp text)
                </button>
              </div>
            </div>

            {/* Scale/Resolution Multiplier */}
            <div className="space-y-2 border-t border-slate-100 pt-5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Render Resolution</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 1.0, label: '1x (Normal)' },
                  { value: 1.5, label: '1.5x (Medium)' },
                  { value: 2.0, label: '2x (High DPI)' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setScale(opt.value)}
                    className={`py-2.5 rounded-lg border text-center text-[10px] font-bold transition-all cursor-pointer ${
                      scale === opt.value
                        ? 'border-primary bg-primary-light text-primary font-bold'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Convert Trigger Button */}
            {isProcessing ? (
              <div className="mt-6 flex flex-col items-center gap-2 pt-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-[11px] font-bold text-slate-500 text-center leading-normal">{loadingText}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRenderFullImages}
                className="w-full mt-6 flex items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-bold text-white hover:bg-primary-hover shadow-lg shadow-red-500/20 transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>Extract All Pages</span>
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            )}
          </aside>
        </div>
      )}

      {pdfjsLoaded && step === 'RESULT' && (
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center rounded-2xl bg-white p-8 md:p-12 border border-slate-100 shadow-xl text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 shadow-lg">
            <CheckCircle2 className="h-12 w-12" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 uppercase tracking-wide">
            PAGES EXTRACTED SUCCESSFULLY
          </span>

          <h2 className="font-display text-3xl font-extrabold text-slate-800 mt-4">Your PDF has been converted!</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">Download your extracted image pages format below.</p>

          <div className="mt-8 flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-5 text-left">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-50 text-primary">
              <FileText className="h-8 w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block truncate text-base font-bold text-slate-800 font-display">
                {pdfPages.length === 1 ? `extracted-page-1.${format}` : `${pdfFile?.name.replace(/\.[^/.]+$/, "")}-images.zip`}
              </span>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                {pdfPages.length === 1 ? 'Single image page' : `${pdfPages.length} converted ZIP images`} • {format.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Download buttons */}
          <div className="mt-8 w-full space-y-4">
            <button
              type="button"
              onClick={handleDownload}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 px-6 text-lg font-bold text-white shadow-xl hover:bg-primary-hover active:scale-[0.99] transition-all cursor-pointer"
            >
              <Download className="h-5.5 w-5.5" />
              <span>Download converted image file</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 px-6 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Convert another PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
