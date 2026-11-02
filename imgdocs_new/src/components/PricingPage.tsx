/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Check, ArrowRight, ShieldCheck, Zap, Heart, Sparkles, FileText, Lock
} from 'lucide-react';
import { toolsList } from '../data/toolsData';

interface PricingPageProps {
  user?: any;
  isPremium?: boolean;
  activePlan?: string;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
  onSelectPlan?: (planId: 'free' | 'pro_monthly' | 'pro_yearly' | 'business_monthly' | 'business_yearly') => void;
  onNavigateHome: () => void;
}

export default function PricingPage({ onNavigateHome }: PricingPageProps) {
  const freePerks = [
    {
      title: 'Unlimited File Operations',
      desc: 'No daily limits or artificial counters. Convert, merge, split, and compress as many files as you need.',
      icon: Zap
    },
    {
      title: '100% Private & Client-Side',
      desc: 'All processing occurs locally in your browser with WebAssembly. Your files never touch external servers.',
      icon: ShieldCheck
    },
    {
      title: 'All 24+ Tools Fully Unlocked',
      desc: 'Full access to eSign, OCR Text Extractor, AES-256 PDF encryption, Page Reordering, and Watermarking.',
      icon: Sparkles
    },
    {
      title: 'Zero Ads or Paywalls',
      desc: 'A clean, distraction-free environment built for individuals, students, developers, and enterprises.',
      icon: Heart
    }
  ];

  return (
    <div className="space-y-16 py-12 px-4 max-w-6xl mx-auto animate-fade-in" id="free-suite-showcase">
      {/* 1. Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest border border-emerald-200 dark:border-emerald-900/40">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>100% Free Forever · No Subscription Needed</span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-black font-display text-slate-900 dark:text-white tracking-tight leading-tight">
          All Tools Are Completely Free & Unrestricted
        </h1>
        
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          We believe document utilities should be accessible, private, and unlimited. Every single feature on ImgDocs is completely unlocked for all users worldwide with zero subscription fees or credit cards required.
        </p>

        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-primary-hover transition-all cursor-pointer"
          >
            <span>Explore All 24+ Tools</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* 2. Perks Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {freePerks.map((perk, idx) => {
          const Icon = perk.icon;
          return (
            <div 
              key={idx}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-primary flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {perk.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {perk.desc}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <Check className="h-3.5 w-3.5" />
                <span>Always Included Free</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Catalog Overview */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-900 pb-5">
          <div>
            <h2 className="text-lg font-black font-display text-slate-900 dark:text-white">
              Every Administrative Tool at Your Fingertips
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant local compilation directly in your browser with zero data uploads.
            </p>
          </div>
          <button
            onClick={onNavigateHome}
            className="rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            Launch Tools Workspace
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
          {toolsList.map(tool => (
            <div 
              key={tool.id} 
              className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 font-medium"
            >
              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">{tool.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
