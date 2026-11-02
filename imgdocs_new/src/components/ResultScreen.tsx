/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, Download, RefreshCw, FileText, Share2 } from 'lucide-react';

interface ResultScreenProps {
  fileName: string;
  fileSize: string;
  isMerge: boolean;
  pageCount: number;
  onDownload: () => void;
  onReset: () => void;
}

export default function ResultScreen({
  fileName,
  fileSize,
  isMerge,
  pageCount,
  onDownload,
  onReset
}: ResultScreenProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center rounded-2xl bg-white p-8 md:p-12 shadow-xl border border-slate-100 text-center animate-fade-in" id="result-screen">
      {/* Success Badge */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 shadow-lg shadow-emerald-500/10">
        <CheckCircle2 className="h-12 w-12" />
      </div>

      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 uppercase tracking-wide">
        Ready for download
      </span>

      {/* Main Title */}
      <h2 className="font-display text-3xl font-extrabold text-slate-800 mt-4" id="result-title">
        Your images have been converted!
      </h2>
      <p className="mt-2 text-base font-medium text-slate-500">
        Your high-quality {isMerge ? 'PDF document is' : 'PDF archive ZIP is'} ready to save.
      </p>

      {/* File Meta Container */}
      <div className="mt-8 flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-5 text-left" id="result-file-details">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-50 text-primary">
          <FileText className="h-8 w-8" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="block truncate text-base font-bold text-slate-800 font-display" title={fileName}>
            {fileName}
          </span>
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
            {isMerge ? `PDF Document • ${pageCount} Pages` : `ZIP Archive • ${pageCount} PDFs`} • {fileSize}
          </span>
        </div>
      </div>

      {/* Primary and Secondary Call to Actions */}
      <div className="mt-8 w-full space-y-4" id="result-actions">
        {/* Large red download button */}
        <button
          type="button"
          onClick={onDownload}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-primary py-4 px-6 text-lg font-bold text-white shadow-xl shadow-red-500/20 hover:bg-primary-hover active:scale-[0.99] transition-all duration-150 cursor-pointer"
          id="btn-download-trigger"
        >
          <Download className="h-5.5 w-5.5" />
          <span>Download your PDF</span>
        </button>

        {/* Convert another button */}
        <button
          type="button"
          onClick={onReset}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 px-6 text-sm font-bold text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 transition-all cursor-pointer"
          id="btn-reset-converter"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Convert another file</span>
        </button>
      </div>

      {/* Security notice */}
      <div className="mt-8 border-t border-slate-100 pt-6 text-[11px] text-slate-400 font-medium" id="privacy-guarantee">
        Because your files are processed completely client-side in your browser, your absolute privacy is guaranteed. No data has been sent to external servers.
      </div>
    </div>
  );
}
