/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Loader2, ArrowRight, CheckCircle2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { ChatConversionWidget, ConvertedFileResult, convertImageToPdf, convertImageFormat, convertTextToFile, convertTextToPdf } from '../lib/chatAutoConverter';

interface ChatDropzoneWidgetProps {
  widget: ChatConversionWidget;
  onConverted: (result: ConvertedFileResult) => void;
  isCompact?: boolean;
}

export default function ChatDropzoneWidget({ widget, onConverted, isCompact = false }: ChatDropzoneWidgetProps) {
  const [isConverting, setIsConverting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>(widget.targetFormat || 'pdf');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    setIsConverting(true);
    try {
      let result: ConvertedFileResult | null = null;

      if (selectedFormat === 'pdf') {
        if (file.type.startsWith('image/')) {
          const res = await convertImageToPdf(file, file.name);
          result = {
            id: 'conv_' + Date.now(),
            originalName: file.name,
            outputName: res.name,
            outputType: 'application/pdf',
            size: res.size,
            downloadUrl: res.url,
            formatIcon: 'pdf',
            actionLabel: 'Download PDF',
            summary: `Successfully converted ${file.name} to high-definition PDF!`
          };
        } else {
          const text = await file.text();
          const res = await convertTextToPdf(text, file.name.replace(/\.[^.]+$/, ''));
          result = {
            id: 'conv_' + Date.now(),
            originalName: file.name,
            outputName: res.name,
            outputType: 'application/pdf',
            size: res.size,
            downloadUrl: res.url,
            formatIcon: 'pdf',
            actionLabel: 'Download PDF',
            summary: `Generated PDF from ${file.name} text content.`
          };
        }
      } else if (selectedFormat === 'png' || selectedFormat === 'jpg' || selectedFormat === 'webp') {
        const fmt = selectedFormat === 'jpg' ? 'jpeg' : (selectedFormat as 'png' | 'webp');
        const res = await convertImageFormat(file, fmt, file.name);
        result = {
          id: 'conv_' + Date.now(),
          originalName: file.name,
          outputName: res.name,
          outputType: `image/${selectedFormat}`,
          size: res.size,
          downloadUrl: res.url,
          formatIcon: 'image',
          actionLabel: `Download ${selectedFormat.toUpperCase()}`,
          summary: `Converted ${file.name} to ${selectedFormat.toUpperCase()} format.`
        };
      } else if (selectedFormat === 'txt' || selectedFormat === 'csv' || selectedFormat === 'json') {
        const text = await file.text();
        const res = convertTextToFile(text, selectedFormat as 'txt' | 'csv' | 'json', file.name);
        result = {
          id: 'conv_' + Date.now(),
          originalName: file.name,
          outputName: res.name,
          outputType: `text/${selectedFormat}`,
          size: res.size,
          downloadUrl: res.url,
          formatIcon: selectedFormat,
          actionLabel: `Download ${selectedFormat.toUpperCase()}`,
          summary: `Exported ${file.name} to ${selectedFormat.toUpperCase()}.`
        };
      }

      if (result) {
        onConverted(result);
      }
    } catch (err) {
      console.error('In-chat file drop conversion failed:', err);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessFile(file);
  };

  return (
    <div className="mt-2.5 rounded-xl border border-indigo-500/30 bg-white dark:bg-slate-900/90 p-3 shadow-xs text-xs space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-[11px]">
          <Sparkles className="h-3 w-3 text-indigo-500 animate-pulse" />
          <span>{widget.title || 'Instant File Converter'}</span>
        </span>

        {/* Format Selector Pills */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md">
          {['pdf', 'png', 'jpg', 'txt'].map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => setSelectedFormat(fmt)}
              className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase transition-all cursor-pointer ${
                selectedFormat === fmt
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Drop Zone Box */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-3.5 text-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 scale-[0.99]'
            : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleProcessFile(file);
          }}
          className="hidden"
        />

        {isConverting ? (
          <div className="flex flex-col items-center justify-center py-1 space-y-1.5">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Converting file automatically...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-1">
            <UploadCloud className="h-5 w-5 text-indigo-500" />
            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
              Drop file here or <span className="text-indigo-600 dark:text-indigo-400 underline">browse</span>
            </p>
            <p className="text-[9px] text-slate-400">
              {widget.promptHint || `Converts directly into ${selectedFormat.toUpperCase()} with 1-click download`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
