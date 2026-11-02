/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, ExternalLink, Sparkles, CheckCircle2, 
  Crown, Zap, Clock, ShieldCheck, ChevronDown, ChevronUp,
  Image as ImageIcon, FileText, Minimize2, Crop, Layers, Scissors, Lock, Unlock,
  RotateCw, Grid, Stamp, Trash2, ScanText, Globe, Table, Presentation, PenTool,
  HelpCircle, Mail, BookOpen, Code, UserCheck
} from 'lucide-react';
import { ToolCatalogItem } from '../lib/toolCatalog';

interface ChatToolActionCardProps {
  tool: ToolCatalogItem;
  isAutoRedirect?: boolean;
  onNavigate?: (pathOrTab: string) => void;
  onInChatConvert?: (tool: ToolCatalogItem) => void;
}

export default function ChatToolActionCard({
  tool,
  isAutoRedirect = false,
  onNavigate,
  onInChatConvert
}: ChatToolActionCardProps) {
  const [countdown, setCountdown] = useState<number | null>(isAutoRedirect ? 3 : null);
  const [isCancelled, setIsCancelled] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    if (countdown === null || isCancelled || !onNavigate) return;

    if (countdown <= 0) {
      handleLaunch();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, isCancelled, onNavigate]);

  const handleLaunch = () => {
    setIsLaunching(true);
    if (onNavigate) {
      onNavigate(tool.path || tool.tabId);
    }
  };

  const handleCancelRedirect = () => {
    setIsCancelled(true);
    setCountdown(null);
  };

  const renderIcon = () => {
    const props = { className: "h-5 w-5 text-indigo-600 dark:text-indigo-400" };
    switch (tool.iconName) {
      case 'Image':
      case 'FileImage': return <ImageIcon {...props} />;
      case 'Minimize2': return <Minimize2 {...props} />;
      case 'Crop': return <Crop {...props} />;
      case 'FileText':
      case 'FileCheck': return <FileText {...props} />;
      case 'Layers': return <Layers {...props} />;
      case 'Scissors': return <Scissors {...props} />;
      case 'Lock': return <Lock {...props} />;
      case 'Unlock': return <Unlock {...props} />;
      case 'RotateCw': return <RotateCw {...props} />;
      case 'Grid': return <Grid {...props} />;
      case 'Stamp': return <Stamp {...props} />;
      case 'Trash2': return <Trash2 {...props} />;
      case 'ScanText': return <ScanText {...props} />;
      case 'Globe': return <Globe {...props} />;
      case 'Table': return <Table {...props} />;
      case 'Presentation': return <Presentation {...props} />;
      case 'PenTool': return <PenTool {...props} />;
      case 'Crown': return <Crown {...props} />;
      case 'UserCheck': return <UserCheck {...props} />;
      case 'HelpCircle': return <HelpCircle {...props} />;
      case 'Mail': return <Mail {...props} />;
      case 'BookOpen': return <BookOpen {...props} />;
      case 'Code': return <Code {...props} />;
      default: return <Sparkles {...props} />;
    }
  };

  return (
    <div className="mt-2.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-white to-indigo-50/40 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 p-3.5 shadow-sm text-slate-800 dark:text-slate-100 transition-all">
      {/* Auto-redirect banner countdown */}
      {countdown !== null && !isCancelled && (
        <div className="mb-2.5 p-2 rounded-xl bg-indigo-600 text-white flex items-center justify-between text-xs font-bold shadow-xs animate-pulse">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 animate-spin" />
            <span>Redirecting to {tool.name} in {countdown}s...</span>
          </div>
          <button
            type="button"
            onClick={handleCancelRedirect}
            className="px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 text-[10px] uppercase tracking-wider font-extrabold transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Header Info */}
      <div className="flex items-start gap-2.5">
        <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-2xs border border-indigo-100 dark:border-indigo-900/40 shrink-0">
          {renderIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
              {tool.name}
            </h4>
            {tool.isPremium ? (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[9px] font-black uppercase">
                <Crown className="h-2.5 w-2.5 fill-amber-500 text-amber-500" /> Pro
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px] font-black uppercase">
                <Zap className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500" /> 100% Free
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
            {tool.shortDesc}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3 pt-2.5 border-t border-indigo-100/80 dark:border-indigo-900/40 flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={handleLaunch}
          disabled={isLaunching}
          className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-black shadow-md hover:shadow-indigo-500/25 transition-all cursor-pointer"
        >
          <span>Open {tool.name.split(' ')[0]} Now</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>

        {tool.steps && tool.steps.length > 0 && (
          <button
            type="button"
            onClick={() => setShowSteps(!showSteps)}
            className="px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
            title="Show step-by-step guidance"
          >
            <span>Steps</span>
            {showSteps ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
      </div>

      {/* Expandable Step-by-Step Guidance */}
      {showSteps && tool.steps && (
        <div className="mt-2.5 pt-2 border-t border-indigo-100 dark:border-indigo-900/40 space-y-1.5 animate-fade-in text-[10px] text-slate-600 dark:text-slate-300">
          <p className="font-bold text-slate-800 dark:text-slate-200 text-[10px]">How to use:</p>
          <ol className="list-decimal list-inside space-y-1 pl-1">
            {tool.steps.map((step, idx) => (
              <li key={idx} className="leading-tight">
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
