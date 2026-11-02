/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FileQuestion, Home, Wrench, Search, ArrowRight } from 'lucide-react';
import { toolsList } from '../data/toolsData';
import { getPathFromTab } from '../lib/routes';

interface NotFoundProps {
  onNavigate: (path: string) => void;
}

export default function NotFound({ onNavigate }: NotFoundProps) {
  const popularTools = toolsList.slice(0, 6);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    onNavigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center space-y-10">
      <div className="inline-flex p-6 rounded-full bg-red-50 dark:bg-red-950/40 text-red-500 border border-red-200 dark:border-red-900/50 shadow-inner">
        <FileQuestion className="h-16 w-16 animate-bounce" />
      </div>

      <div className="space-y-3">
        <span className="text-xs font-black uppercase tracking-widest text-red-500">404 Error • Page Not Found</span>
        <h1 className="text-3xl md:text-5xl font-black font-display text-slate-900 dark:text-white">
          The Requested Tool or Page Does Not Exist
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
          The URL you accessed might have been renamed or moved. All client-side PDF tools on ImgDocs run 100% locally in your browser.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <a
          href="/"
          onClick={(e) => handleLinkClick(e, '/')}
          className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <Home className="h-4 w-4" /> Go to Homepage
        </a>
        <a
          href="/html-sitemap"
          onClick={(e) => handleLinkClick(e, '/html-sitemap')}
          className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-all flex items-center gap-2"
        >
          <Search className="h-4 w-4" /> Browse Full Site Index
        </a>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm text-left space-y-4">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-lg">
          <Wrench className="h-5 w-5 text-red-500" />
          <span>Or Explore Popular PDF Tools directly:</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {popularTools.map(tool => {
            const path = getPathFromTab(tool.id);
            return (
              <a
                key={tool.id}
                href={path}
                onClick={(e) => handleLinkClick(e, path)}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-red-500/40 bg-slate-50/50 dark:bg-slate-950/50 transition-all group flex items-center justify-between"
              >
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-red-500">
                  {tool.title}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-red-500 transition-colors" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
