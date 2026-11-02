/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, FileText, Check, Copy, ExternalLink, Image as ImageIcon, Sparkles, ShieldCheck } from 'lucide-react';
import { ConvertedFileResult } from '../lib/chatAutoConverter';

interface ChatConvertedCardProps {
  result: ConvertedFileResult;
  isCompact?: boolean;
}

export default function ChatConvertedCard({ result, isCompact = false }: ChatConvertedCardProps) {
  const [downloaded, setDownloaded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = result.downloadUrl;
    link.download = result.outputName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const isPdf = result.outputType.includes('pdf') || result.outputName.endsWith('.pdf');
  const isImage = result.outputType.includes('image') || /\.(png|jpg|jpeg|webp|gif)$/i.test(result.outputName);
  const isText = result.outputType.includes('text') || /\.(txt|csv|json|md)$/i.test(result.outputName);

  return (
    <div className={`mt-2.5 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-50/90 via-slate-50 to-indigo-50/40 dark:from-emerald-950/40 dark:via-slate-900 dark:to-indigo-950/20 p-3 shadow-xs transition-all text-slate-800 dark:text-slate-200 ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
      
      {/* Top Banner */}
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-emerald-500/20 dark:border-emerald-500/10">
        <div className="flex items-center gap-1.5 font-black text-emerald-700 dark:text-emerald-400 text-[10px] uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5 shrink-0 animate-pulse text-emerald-500" />
          <span>Auto-Converted In Chat</span>
        </div>
        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="h-2.5 w-2.5" /> 100% Free
        </span>
      </div>

      {/* Main File Box */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-950/80 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${
          isPdf 
            ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 border border-rose-200/60 dark:border-rose-900/60' 
            : isImage 
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 border border-indigo-200/60 dark:border-indigo-900/60'
              : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200/60 dark:border-emerald-900/60'
        }`}>
          {isPdf ? <FileText className="h-5 w-5" /> : isImage ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-slate-900 dark:text-white truncate" title={result.outputName}>
            {result.outputName}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            <span>{result.size}</span>
            <span>•</span>
            <span className="uppercase text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded font-bold">
              {result.outputName.split('.').pop()}
            </span>
            {result.originalName && (
              <>
                <span>•</span>
                <span className="truncate max-w-[100px] text-slate-400" title={`From: ${result.originalName}`}>
                  From {result.originalName}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-2.5 flex items-center gap-2">
        <button
          onClick={handleDownload}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-black text-xs shadow-xs transition-all cursor-pointer ${
            downloaded 
              ? 'bg-emerald-600 text-white'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white hover:shadow-emerald-500/20'
          }`}
          id={`download-converted-${result.id}`}
        >
          {downloaded ? (
            <>
              <Check className="h-3.5 w-3.5 shrink-0" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5 shrink-0" />
              <span>{result.actionLabel || 'Download File'}</span>
            </>
          )}
        </button>

        <a
          href={result.downloadUrl}
          target="_blank"
          rel="noreferrer"
          className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold transition-all flex items-center justify-center"
          title="Open preview in new tab"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
