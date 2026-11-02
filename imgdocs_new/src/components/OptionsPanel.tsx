/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  File, 
  Columns, 
  Minimize, 
  Maximize, 
  ArrowRight,
  Info
} from 'lucide-react';
import { ConverterOptions, PageOrientation, PageSize, PageMargin } from '../types';

interface OptionsPanelProps {
  options: ConverterOptions;
  onChange: (options: ConverterOptions) => void;
  onConvert: () => void;
  disabled: boolean;
}

export default function OptionsPanel({
  options,
  onChange,
  onConvert,
  disabled
}: OptionsPanelProps) {
  
  const handleOrientationChange = (orientation: PageOrientation) => {
    onChange({ ...options, orientation });
  };

  const handlePageSizeChange = (pageSize: PageSize) => {
    onChange({ ...options, pageSize });
  };

  const handleMarginChange = (margin: PageMargin) => {
    onChange({ ...options, margin });
  };

  const handleMergeChange = (merge: boolean) => {
    onChange({ ...options, merge });
  };

  return (
    <aside 
      className="w-full lg:w-[360px] shrink-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-md flex flex-col justify-between"
      id="options-side-panel"
    >
      <div className="space-y-6">
        {/* Title */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="font-display text-xl font-bold text-slate-800 dark:text-white">
            Image to PDF options
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Configure the layout parameters for your final PDF.
          </p>
        </div>

        {/* 1. Page Orientation */}
        <div className="space-y-2" id="option-group-orientation">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">PAGE ORIENTATION</label>
          <div className="grid grid-cols-2 gap-3">
            {/* Portrait Option */}
            <button
              type="button"
              onClick={() => handleOrientationChange('portrait')}
              className={`flex flex-col items-center gap-2 rounded-xl border p-3.5 transition-all text-center cursor-pointer ${
                options.orientation === 'portrait'
                  ? 'border-primary bg-primary-light dark:bg-primary/20 text-primary font-semibold ring-2 ring-red-100 dark:ring-primary/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
              id="opt-portrait"
            >
              <div className="relative flex h-14 w-10 items-center justify-center rounded border-2 border-current bg-white dark:bg-slate-950 shadow-xs">
                <div className="h-4 w-1 bg-current rounded-full opacity-60" />
              </div>
              <span className="text-xs">Portrait</span>
            </button>

            {/* Landscape Option */}
            <button
              type="button"
              onClick={() => handleOrientationChange('landscape')}
              className={`flex flex-col items-center gap-2 rounded-xl border p-3.5 transition-all text-center cursor-pointer ${
                options.orientation === 'landscape'
                  ? 'border-primary bg-primary-light dark:bg-primary/20 text-primary font-semibold ring-2 ring-red-100 dark:ring-primary/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
              id="opt-landscape"
            >
              <div className="relative flex h-10 w-14 items-center justify-center rounded border-2 border-current bg-white dark:bg-slate-950 shadow-xs">
                <div className="h-1 w-4 bg-current rounded-full opacity-60" />
              </div>
              <span className="text-xs">Landscape</span>
            </button>
          </div>
        </div>

        {/* 2. Page Size */}
        <div className="space-y-2.5" id="option-group-pagesize">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">PAGE SIZE</label>
          <div className="space-y-2">
            {[
              { id: 'fit', label: 'Fit (Same page size as image)', desc: 'Matches individual image size exactly' },
              { id: 'a4', label: 'A4 (297 x 210 mm)', desc: 'Standard European print sheet' },
              { id: 'letter', label: 'US Letter (215 x 279 mm)', desc: 'Standard American executive format' }
            ].map((size) => (
              <label
                key={size.id}
                className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                  options.pageSize === size.id
                    ? 'border-primary bg-primary-light dark:bg-primary/20 text-slate-800 dark:text-white font-semibold ring-2 ring-red-100 dark:ring-primary/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
                id={`label-size-${size.id}`}
              >
                <input
                  type="radio"
                  name="pageSize"
                  checked={options.pageSize === size.id}
                  onChange={() => handlePageSizeChange(size.id as PageSize)}
                  className="mt-1 h-4 w-4 border-slate-300 dark:border-slate-700 text-primary focus:ring-primary accent-primary"
                  id={`radio-size-${size.id}`}
                />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold">{size.label}</span>
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">{size.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 3. Margins */}
        <div className="space-y-2" id="option-group-margin">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">MARGIN</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'none', label: 'No margin', icon: Minimize },
              { id: 'small', label: 'Small', icon: Columns },
              { id: 'big', label: 'Big', icon: Maximize }
            ].map((margin) => {
              const Icon = margin.icon;
              return (
                <button
                  key={margin.id}
                  type="button"
                  onClick={() => handleMarginChange(margin.id as PageMargin)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center transition-all cursor-pointer ${
                    options.margin === margin.id
                      ? 'border-primary bg-primary-light dark:bg-primary/20 text-primary font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                  id={`opt-margin-${margin.id}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[10px] font-bold">{margin.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Merge Toggle Checkbox */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4" id="option-group-merge">
          <label className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850 transition-all">
            <input
              type="checkbox"
              checked={options.merge}
              onChange={(e) => handleMergeChange(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary accent-primary cursor-pointer"
              id="chk-merge"
            />
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Merge all in one PDF</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">Combine all pages in order</span>
            </div>
          </label>
        </div>
      </div>

      {/* 5. Convert Trigger Button */}
      <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
        <button
          type="button"
          onClick={onConvert}
          disabled={disabled}
          className={`relative flex w-full items-center justify-center gap-2 rounded-xl py-4.5 text-lg font-bold text-white shadow-lg transition-all duration-150 cursor-pointer ${
            disabled
              ? 'bg-slate-300 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed shadow-none'
              : 'bg-primary hover:bg-primary-hover shadow-red-500/25 active:scale-[0.98]'
          }`}
          id="btn-convert-to-pdf"
        >
          <span>Convert to PDF</span>
          <ArrowRight className="h-5 w-5" />
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          <Info className="h-3 w-3 text-emerald-500" />
          <span>Local client-side conversion</span>
        </div>
      </div>
    </aside>
  );
}
