/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Loader2, Settings2, FileText, CheckCircle } from 'lucide-react';

interface ConvertingScreenProps {
  currentIndex: number;
  totalImages: number;
  progress: number;
}

export default function ConvertingScreen({
  currentIndex,
  totalImages,
  progress
}: ConvertingScreenProps) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center justify-center rounded-2xl bg-white p-8 shadow-xl border border-slate-100 text-center animate-fade-in" id="converting-screen">
      {/* Decorative spinning settings icon container */}
      <div className="mb-6 relative flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-primary">
        <Loader2 className="absolute inset-0 h-20 w-20 text-blue-100 animate-spin" style={{ animationDuration: '3s' }} />
        <Settings2 className="h-10 w-10 text-primary animate-pulse" />
      </div>

      {/* Primary header status */}
      <h2 className="font-display text-2xl font-bold text-slate-800" id="converting-title">
        Converting images to PDF...
      </h2>

      {/* Description showing current operation */}
      <p className="mt-2 text-sm font-semibold text-slate-500" id="converting-subtitle">
        {currentIndex <= totalImages ? (
          <span className="flex items-center justify-center gap-1.5">
            <FileText className="h-4 w-4 text-slate-400" />
            Processing image <span className="text-primary font-bold">{currentIndex}</span> of <span className="font-bold text-slate-700">{totalImages}</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-1.5 text-emerald-600">
            <CheckCircle className="h-4 w-4" />
            Assembling PDF package
          </span>
        )}
      </p>

      {/* Progress bar */}
      <div className="mt-6 w-full rounded-full bg-slate-100 h-3 overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
          id="converting-progress-fill"
        />
      </div>

      {/* Percent number counter */}
      <span className="mt-2 text-xs font-bold text-slate-400 font-mono">
        {Math.round(progress)}% Complete
      </span>

      {/* Simulated background pipeline stages */}
      <div className="mt-6 w-full border-t border-slate-100 pt-5 text-left space-y-2.5" id="pipeline-status">
        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Conversion Engine Status</span>
        
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-slate-500">Image Decompression</span>
          <span className="text-emerald-500 font-bold">✔ Active</span>
        </div>
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-slate-500">Page-Size Fit Calculation</span>
          <span className="text-emerald-500 font-bold">✔ Active</span>
        </div>
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-slate-500">jsPDF Binary Compiling</span>
          <span className={progress >= 95 ? 'text-emerald-500 font-bold' : 'text-slate-400 animate-pulse'}>
            {progress >= 95 ? '✔ Completed' : '• Pending...'}
          </span>
        </div>
      </div>
    </div>
  );
}
