/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Image as ImageIcon, Lock, ShieldCheck, Zap, 
  ArrowRight, Sparkles, Check, Layers, Crop, RefreshCw,
  Upload, Download, CheckCircle2, Play, MousePointer
} from 'lucide-react';

interface TransformationPreset {
  id: string;
  toolId: string;
  name: string;
  tagline: string;
  sourceIcon: React.ReactNode;
  sourceName: string;
  sourceType: string;
  sourceSize: string;
  outputIcon: React.ReactNode;
  outputName: string;
  outputType: string;
  outputSize: string;
  badge: string;
  savings: string;
  accentColor: string;
  glowColor: string;
  speed: string;
}

const PRESETS: TransformationPreset[] = [
  {
    id: 'jpg-pdf',
    toolId: 'jpg-to-pdf',
    name: 'JPG to PDF',
    tagline: 'Combine photos into printable, official PDF docs',
    sourceIcon: <ImageIcon className="w-7 h-7 text-amber-500" />,
    sourceName: 'Design_Mockup.jpg',
    sourceType: 'JPEG Image (2400x1600)',
    sourceSize: '2.4 MB',
    outputIcon: <FileText className="w-7 h-7 text-red-500" />,
    outputName: 'Design_Mockup.pdf',
    outputType: 'Vector PDF Document (A4)',
    outputSize: '1.8 MB',
    badge: 'Vector DPI Preserved',
    savings: '25% Smaller',
    accentColor: 'from-amber-500 via-orange-500 to-red-500',
    glowColor: 'rgba(239, 68, 68, 0.22)',
    speed: '0.14s'
  },
  {
    id: 'merge-organize',
    toolId: 'merge-pdf',
    name: 'Merge & Split',
    tagline: 'Combine multiple PDF files into one clean document',
    sourceIcon: <Layers className="w-7 h-7 text-indigo-500" />,
    sourceName: '3 x PDF Documents',
    sourceType: 'Contract_Part1..3.pdf',
    sourceSize: '4.8 MB total',
    outputIcon: <FileText className="w-7 h-7 text-blue-600" />,
    outputName: 'Final_Agreement_Merged.pdf',
    outputType: 'Unified 12-Page Master PDF',
    outputSize: '3.9 MB',
    badge: 'Lossless Assembly',
    savings: '19% Compacted',
    accentColor: 'from-indigo-500 via-blue-500 to-cyan-500',
    glowColor: 'rgba(59, 130, 246, 0.22)',
    speed: '0.19s'
  },
  {
    id: 'protect-encrypt',
    toolId: 'protect-pdf',
    name: 'Lock & Protect',
    tagline: 'Add bank-grade AES-256 password protection in seconds',
    sourceIcon: <FileText className="w-7 h-7 text-slate-500" />,
    sourceName: 'Confidential_Audit.pdf',
    sourceType: 'Standard PDF Document',
    sourceSize: '1.2 MB',
    outputIcon: <Lock className="w-7 h-7 text-emerald-500" />,
    outputName: 'Confidential_Audit_Secured.pdf',
    outputType: 'AES-256 Encrypted PDF',
    outputSize: '1.2 MB',
    badge: '100% Private Encryption',
    savings: 'Password Protected',
    accentColor: 'from-blue-500 via-teal-500 to-emerald-500',
    glowColor: 'rgba(16, 185, 129, 0.22)',
    speed: '0.08s'
  },
  {
    id: 'crop-compress',
    toolId: 'crop-image',
    name: 'Crop & Compress',
    tagline: 'Shrink file size dramatically without losing sharpness',
    sourceIcon: <Crop className="w-7 h-7 text-violet-500" />,
    sourceName: 'UltraHD_Banner.png',
    sourceType: 'Raw 4K Resolution Image',
    sourceSize: '8.6 MB',
    outputIcon: <ImageIcon className="w-7 h-7 text-cyan-500" />,
    outputName: 'UltraHD_Banner_Optimized.webp',
    outputType: 'WebP Compressed Picture',
    outputSize: '820 KB',
    badge: 'Lossless Visual Quality',
    savings: '90% Size Saved',
    accentColor: 'from-violet-500 via-fuchsia-500 to-cyan-500',
    glowColor: 'rgba(6, 182, 212, 0.22)',
    speed: '0.11s'
  }
];

interface InteractiveHeroAnimationProps {
  onSelectTool?: (toolId: string) => void;
}

export default function InteractiveHeroAnimation({ onSelectTool }: InteractiveHeroAnimationProps) {
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(100);

  const preset = PRESETS[activePresetIndex];

  // Auto-cycle through presets smoothly
  useEffect(() => {
    const interval = setInterval(() => {
      triggerAnimationCycle((activePresetIndex + 1) % PRESETS.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [activePresetIndex]);

  const triggerAnimationCycle = (nextIndex: number) => {
    setIsProcessing(true);
    setProgress(0);
    setActivePresetIndex(nextIndex);

    let current = 0;
    const stepInterval = setInterval(() => {
      current += 20;
      if (current >= 100) {
        setProgress(100);
        setIsProcessing(false);
        clearInterval(stepInterval);
      } else {
        setProgress(current);
      }
    }, 55);
  };

  const handleLaunchTool = (toolId: string) => {
    if (onSelectTool) {
      onSelectTool(toolId);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto mt-6" id="interactive-hero-animation-container">
      {/* 1. Interactive Preset Selector Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap mb-4" role="tablist" aria-label="Tool workflow presets">
        {PRESETS.map((p, idx) => {
          const isActive = idx === activePresetIndex;
          return (
            <button
              key={p.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => triggerAnimationCycle(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 border shadow-xs ${
                isActive 
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700 shadow-md shadow-blue-500/15 scale-105 ring-2 ring-blue-500/20'
                  : 'bg-slate-100/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200/70 dark:border-slate-800/60 hover:bg-white dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-600 dark:bg-blue-400 animate-pulse' : 'bg-slate-400'}`} />
              <span>{p.name}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Main Selected Interactive Hero Demonstration Card (div:nth-of-type(2)) */}
      <div 
        className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-2xl p-5 sm:p-7 transition-all duration-500"
        style={{
          boxShadow: `0 24px 48px -12px ${preset.glowColor}, 0 4px 16px -2px rgba(0,0,0,0.06)`
        }}
      >
        {/* Dynamic Top Gradient Accent Line */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${preset.accentColor}`} />

        {/* User-friendly Top Header with Status & Replay Control */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div className="text-left">
              <div className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-1.5">
                <span>Instant Browser Conversion Preview</span>
                <span className="hidden sm:inline-block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                  Ready in {preset.speed}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {preset.tagline}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerAnimationCycle(activePresetIndex)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Re-run transformation preview"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Replay Demo</span>
            </button>
            <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>0% Cloud Upload</span>
            </span>
          </div>
        </div>

        {/* 3-Step Visual Transformation Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 sm:gap-4 items-center">
          
          {/* STEP 1: Input Document Node */}
          <motion.div 
            key={`source-${preset.id}`}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            onClick={() => handleLaunchTool(preset.toolId)}
            className="md:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 p-4 text-left relative group hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 inline-flex items-center justify-center font-bold text-[10px]">1</span>
                Your Original File
              </span>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                Click to open <MousePointer className="w-2.5 h-2.5" />
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs group-hover:scale-105 transition-transform">
                {preset.sourceIcon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {preset.sourceName}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {preset.sourceType}
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="text-[11px] font-semibold font-mono px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {preset.sourceSize}
                  </span>
                  <span className="text-[10px] text-slate-400">Ready to convert</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* STEP 2: Instant Client Engine Hub */}
          <div className="md:col-span-3 flex flex-col items-center justify-center py-2 px-1 relative">
            <div className="w-full relative flex items-center justify-center">
              {/* Pulsing Core Ring */}
              <motion.div 
                animate={{ 
                  scale: isProcessing ? [1, 1.15, 1] : 1,
                  rotate: isProcessing ? 360 : 0 
                }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
                className="w-13 h-13 rounded-2xl border-2 border-dashed border-blue-500/50 dark:border-blue-400/50 flex items-center justify-center bg-blue-50 dark:bg-blue-950/40 shadow-inner z-10"
              >
                <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-pulse fill-blue-600/20" />
              </motion.div>

              {/* Connecting Laser Beam Line */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 -z-0 overflow-hidden rounded-full">
                <motion.div 
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                  className={`w-2/3 h-full bg-gradient-to-r ${preset.accentColor}`}
                />
              </div>
            </div>

            <div className="mt-2.5 text-center">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100/60 dark:bg-blue-900/50 text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                <Sparkles className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                <span>{isProcessing ? `Processing ${progress}%` : 'Instant Conversion'}</span>
              </div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                Zero Cloud Uploads • Private
              </div>
            </div>
          </div>

          {/* STEP 3: Converted Output Node */}
          <motion.div 
            key={`output-${preset.id}`}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            onClick={() => handleLaunchTool(preset.toolId)}
            className="md:col-span-4 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/60 dark:bg-blue-950/30 p-4 text-left relative group hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 inline-flex items-center justify-center font-bold text-[10px]">3</span>
                Download Ready
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {preset.savings}
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 shadow-xs group-hover:scale-105 transition-transform">
                {preset.outputIcon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {preset.outputName}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {preset.outputType}
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                    {preset.outputSize}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> High Quality
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Dock: Friendly Call To Action Buttons & Trust Features */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Key User-Friendly Value Guarantees */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-slate-500 dark:text-slate-400 text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>100% Private (Runs in Browser)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Check className="w-4 h-4 text-blue-500" />
              <span>No Watermarks</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Check className="w-4 h-4 text-indigo-500" />
              <span>Unlimited Free Use</span>
            </span>
          </div>

          {/* Prominent, Tactile Action Button */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => handleLaunchTool(preset.toolId)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all cursor-pointer group active:scale-95"
            >
              <span>Open {preset.name} Tool</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
