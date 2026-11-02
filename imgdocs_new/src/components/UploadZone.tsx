/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Upload, Cloud, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  onCloudAction: (source: 'drive' | 'dropbox') => void;
}

export default function UploadZone({ onFilesSelected, onCloudAction }: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const validateAndProcessFiles = (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    
    const selectedFiles = Array.from(filesList);
    const validImages: File[] = [];
    const invalidNames: string[] = [];

    selectedFiles.forEach(file => {
      const type = file.type;
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      const isValidType = type.startsWith('image/') ||
                          ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'jfif', 'heic'].includes(extension || '');

      if (isValidType) {
        validImages.push(file);
      } else {
        invalidNames.push(file.name);
      }
    });

    if (invalidNames.length > 0) {
      setErrorMsg(`Invalid file type detected: ${invalidNames.join(', ')}. Please upload valid image files (JPG, JPEG, PNG, WEBP, etc.) only.`);
    } else {
      setErrorMsg(null);
    }

    if (validImages.length > 0) {
      onFilesSelected(validImages);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    validateAndProcessFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndProcessFiles(e.target.files);
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mx-auto w-full max-w-4xl" id="upload-zone-container">
      {/* Drag & Drop Main Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFilePicker}
        className={`group relative flex min-h-[400px] cursor-pointer flex-col items-center justify-center rounded-2xl border-3 border-dashed px-6 py-12 text-center transition-all duration-300 ${
          isDragActive
            ? 'border-primary bg-primary-light dark:bg-primary/20 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-slate-400 dark:hover:border-slate-700 hover:shadow-lg'
        }`}
        id="drop-zone"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="native-file-picker"
        />

        {/* Large visual icon */}
        <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 ${
          isDragActive 
            ? 'bg-primary text-white scale-110' 
            : 'bg-red-50 dark:bg-slate-800 text-primary group-hover:scale-105'
        }`}>
          <Upload className="h-10 w-10" />
        </div>

        {/* Call to Action Title */}
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
          Convert JPG to PDF
        </h1>
        <p className="mt-3 text-lg font-medium text-slate-500 dark:text-slate-400">
          Convert images to PDF in seconds. Easily adjust orientation and margins.
        </p>

        {/* Large red select button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            triggerFilePicker();
          }}
          className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-bold text-white shadow-lg shadow-red-500/20 hover:bg-primary-hover active:scale-95 transition-all duration-150 cursor-pointer"
          id="select-images-button"
        >
          <ImageIcon className="h-5 w-5" />
          Select JPG images
        </button>

        {/* Subtext drag indicator */}
        <span className="mt-4 text-sm font-semibold text-slate-400 dark:text-slate-500">
          or drop JPG images here
        </span>
      </div>

      {/* Cloud Drive import triggers */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4" id="cloud-triggers-container">
        <button
          type="button"
          onClick={() => onCloudAction('drive')}
          className="group relative flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white shadow-xs transition-all cursor-pointer"
          id="btn-google-drive"
        >
          <Cloud className="h-4 w-4 text-blue-500" />
          <span>Upload from Google Drive</span>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 rounded bg-slate-800 px-2 py-1 text-xs font-normal text-white transition-all group-hover:scale-100 whitespace-nowrap z-50 shadow-md">
            Integration stubs — runs entirely locally!
          </span>
        </button>

        <button
          type="button"
          onClick={() => onCloudAction('dropbox')}
          className="group relative flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white shadow-xs transition-all cursor-pointer"
          id="btn-dropbox"
        >
          <Cloud className="h-4 w-4 text-indigo-500" />
          <span>Upload from Dropbox</span>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 rounded bg-slate-800 px-2 py-1 text-xs font-normal text-white transition-all group-hover:scale-100 whitespace-nowrap z-50 shadow-md">
            Integration stubs — runs entirely locally!
          </span>
        </button>
      </div>

      {/* Inline format validation error block */}
      {errorMsg && (
        <div className="mt-6 flex items-start gap-3 rounded-xl bg-amber-50 p-4 border border-amber-200 text-amber-800 animate-fade-in" id="upload-error-banner">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="text-sm font-medium">
            {errorMsg}
          </div>
        </div>
      )}
    </div>
  );
}
