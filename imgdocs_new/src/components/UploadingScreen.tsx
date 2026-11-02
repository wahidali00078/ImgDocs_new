/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Loader2, CheckCircle2, CloudLightning } from 'lucide-react';
import { UploadStats } from '../types';

interface UploadingScreenProps {
  stats: UploadStats;
}

export default function UploadingScreen({ stats }: UploadingScreenProps) {
  const isCloud = stats.source === 'drive' || stats.source === 'dropbox';
  const isDone = stats.progress >= 100;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center justify-center rounded-2xl bg-white p-8 shadow-xl border border-slate-100 text-center animate-fade-in" id="uploading-screen">
      {/* Icon header based on upload source */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-primary">
        {isDone ? (
          <CheckCircle2 className="h-10 w-10 text-emerald-500 animate-bounce" />
        ) : isCloud ? (
          <CloudLightning className="h-10 w-10 text-blue-500 animate-pulse" />
        ) : (
          <Loader2 className="h-10 w-10 animate-spin" />
        )}
      </div>

      {/* Main Status Text */}
      <h2 className="font-display text-2xl font-bold text-slate-800" id="upload-status-title">
        {isDone ? (
          <span className="text-emerald-600">Uploaded Successfully!</span>
        ) : isCloud ? (
          <span>Getting files from {stats.source === 'drive' ? 'Google Drive' : 'Dropbox'}...</span>
        ) : (
          <span>Uploading images to editor...</span>
        )}
      </h2>

      {/* Progress counter text */}
      <p className="mt-2 text-sm font-semibold text-slate-500" id="upload-progress-text">
        {isDone ? (
          <span>Preparing editor workspace</span>
        ) : (
          <span>Uploading file {stats.currentFile} of {stats.totalFiles}</span>
        )}
      </p>

      {/* Progress bar container */}
      <div className="mt-6 w-full rounded-full bg-slate-100 h-3 overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${isDone ? 'bg-emerald-500' : 'bg-primary'}`}
          style={{ width: `${stats.progress}%` }}
          id="upload-progress-fill"
        />
      </div>

      {/* Progress percentage */}
      <span className="mt-2 text-xs font-bold text-slate-400">
        {Math.round(stats.progress)}%
      </span>

      {/* Speed, Time Left details (Simulated) */}
      {!isDone && (
        <div className="mt-6 grid w-full grid-cols-2 gap-4 border-t border-slate-100 pt-5 text-slate-500" id="upload-stats-grid">
          <div className="text-left">
            <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Speed</span>
            <span className="text-sm font-bold text-slate-700 font-mono">
              {stats.speed.toFixed(1)} MB/s
            </span>
          </div>
          <div className="text-right">
            <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Time Left</span>
            <span className="text-sm font-bold text-slate-700 font-mono">
              {stats.timeLeft > 0 ? `~ ${stats.timeLeft}s` : 'Calculating...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
