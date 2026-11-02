/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Image as ImageIcon, Layers, FileDown, ArrowRight, FileText, Lock, ShieldCheck, HelpCircle, PenTool, CheckCircle } from 'lucide-react';
import { toolsList } from '../data/toolsData';

interface BottomToolsSwitcherProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
}

export default function BottomToolsSwitcher({
  activeTab,
  onChangeTab
}: BottomToolsSwitcherProps) {
  
  // Highlighting the main popular ones
  const popularToolIds = ['jpg-to-pdf', 'pdf-to-jpg', 'compress-pdf'];

  const getToolColor = (category: string) => {
    switch (category) {
      case 'Convert to PDF': return 'from-red-500 to-rose-600';
      case 'Convert from PDF': return 'from-blue-500 to-cyan-600';
      case 'Optimize & Edit': return 'from-emerald-500 to-teal-600';
      case 'Security & Sign': return 'from-slate-700 to-slate-900';
      default: return 'from-primary to-rose-500';
    }
  };

  const getToolBg = (category: string) => {
    switch (category) {
      case 'Convert to PDF': return 'bg-red-50/50 hover:bg-red-100/70 dark:bg-slate-900/30';
      case 'Convert from PDF': return 'bg-blue-50/50 hover:bg-blue-100/70 dark:bg-slate-900/30';
      case 'Optimize & Edit': return 'bg-emerald-50/50 hover:bg-emerald-100/70 dark:bg-slate-900/30';
      case 'Security & Sign': return 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/30';
      default: return 'bg-slate-50 dark:bg-slate-900/30';
    }
  };

  const getToolText = (category: string) => {
    switch (category) {
      case 'Convert to PDF': return 'text-rose-700 dark:text-rose-400';
      case 'Convert from PDF': return 'text-blue-700 dark:text-blue-400';
      case 'Optimize & Edit': return 'text-emerald-700 dark:text-emerald-400';
      case 'Security & Sign': return 'text-slate-700 dark:text-slate-300';
      default: return 'text-primary';
    }
  };

  // Group other tools by category
  const categories = Array.from(new Set(toolsList.map(t => t.category)));

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 md:p-8 shadow-sm space-y-8" id="bottom-tools-switcher">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-slate-900 pb-4">
        <div>
          <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Explore More PDF & Image Tools
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Switch between our fast browser-native utilities with one click.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full px-3 py-1 self-start md:self-auto">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          Local Browser Sandbox
        </div>
      </div>

      {/* Categories Micro-Grids */}
      <div className="space-y-6" id="categorized-utilities">
        {categories.map((cat) => {
          const catTools = toolsList.filter(t => t.category === cat);
          return (
            <div key={cat} className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {cat} Utilities
              </h4>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {catTools.map((tool) => {
                  const isActive = activeTab === tool.id || (tool.id === 'jpg-to-pdf' && activeTab === 'jpg_to_pdf') || (tool.id === 'pdf-to-jpg' && activeTab === 'pdf_to_jpg') || (tool.id === 'compress-pdf' && activeTab === 'compress') || (tool.id === 'crop-image' && (activeTab === 'crop-image' || activeTab === 'crop_image'));
                  
                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        // Standardize ID names for backward compatibility
                        let targetId = tool.id;
                        if (tool.id === 'jpg-to-pdf') targetId = 'jpg_to_pdf';
                        if (tool.id === 'pdf-to-jpg') targetId = 'pdf_to_jpg';
                        if (tool.id === 'compress-pdf') targetId = 'compress';

                        onChangeTab(targetId);
                        // Scroll smoothly back to top viewport
                        document.getElementById('app-header')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`group flex items-center gap-2.5 text-left rounded-xl border p-3.5 transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'border-slate-900 dark:border-slate-200 bg-slate-950 text-white shadow-xs scale-[1.01]'
                          : `${getToolBg(tool.category)} border-slate-100 dark:border-slate-900 text-slate-800 dark:text-slate-300 hover:shadow-xs`
                      }`}
                      id={`switcher-btn-${tool.id}`}
                    >
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${getToolColor(tool.category)} text-white shadow-xs`}>
                        {tool.id === 'esign-pdf' ? <PenTool className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                      </div>
                      <div className="truncate flex-1">
                        <span className="font-bold text-xs tracking-tight block truncate">
                          {tool.title.replace(' with Password', '').replace(' Text Extractor', '')}
                        </span>
                        {isActive && (
                          <span className="text-[8px] font-extrabold uppercase tracking-widest text-emerald-400 mt-0.5 block">Active</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
