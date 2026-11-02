/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { toolsList } from '../data/toolsData';
import { blogPosts } from '../data/blogData';
import { FileText, Wrench, BookOpen, ShieldCheck, HelpCircle, ArrowRight } from 'lucide-react';
import { getPathFromTab } from '../lib/routes';

interface HtmlSitemapProps {
  onNavigate: (path: string) => void;
}

export default function HtmlSitemap({ onNavigate }: HtmlSitemapProps) {
  const categories = Array.from(new Set(toolsList.map(t => t.category)));

  const mainPages = [
    { title: 'Home', path: '/' },
    { title: 'All Tools Directory', path: '/tools' },
    { title: 'Security & Architecture', path: '/security' },
    { title: 'Customer Reviews', path: '/reviews' },
    { title: 'Free Form Templates', path: '/templates' },
    { title: 'About Us', path: '/about' },
    { title: 'Contact Support', path: '/contact' },
    { title: 'Pricing & Plans', path: '/pricing' },
    { title: 'Blog & Tutorials', path: '/blog' },
    { title: 'Help Center', path: '/help' },
    { title: 'Changelog / Release Notes', path: '/releases' },
    { title: 'API Documentation', path: '/api' },
    { title: 'Careers', path: '/careers' },
    { title: 'Feature Requests', path: '/feature-requests' },
    { title: 'HTML Sitemap', path: '/html-sitemap' }
  ];

  const legalPages = [
    { title: 'Privacy Policy', path: '/privacy-policy' },
    { title: 'Terms of Service', path: '/terms' },
    { title: 'Refund Policy', path: '/refund-policy' },
    { title: 'Cookie Policy', path: '/cookie-policy' },
    { title: 'Disclaimer Notice', path: '/disclaimer' },
    { title: 'DMCA Policy', path: '/dmca' }
  ];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    onNavigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-12">
      {/* Header Banner */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-800 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
          <FileText className="h-3.5 w-3.5" /> HTML Site Index
        </div>
        <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white">
          ImgDocs Complete Page Directory
        </h1>
        <p className="text-slate-400 text-base md:text-lg max-w-3xl leading-relaxed">
          Navigate all secure client-side PDF tools, technical documentation, privacy policies, and document workflow guides available across ImgDocs.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* 1. Core Web Pages */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">Main Company Pages</h2>
          </div>
          <ul className="space-y-2.5 text-sm font-medium">
            {mainPages.map(page => (
              <li key={page.path}>
                <a
                  href={page.path}
                  onClick={(e) => handleClick(e, page.path)}
                  className="flex items-center justify-between text-slate-700 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition-colors py-1 group"
                >
                  <span>{page.title}</span>
                  <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* 2. Legal & Compliance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">Legal & Compliance</h2>
          </div>
          <ul className="space-y-2.5 text-sm font-medium">
            {legalPages.map(page => (
              <li key={page.path}>
                <a
                  href={page.path}
                  onClick={(e) => handleClick(e, page.path)}
                  className="flex items-center justify-between text-slate-700 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition-colors py-1 group"
                >
                  <span>{page.title}</span>
                  <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Tools by Category */}
        {categories.map(category => {
          const categoryTools = toolsList.filter(t => t.category === category);
          return (
            <div key={category} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="p-2.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                  <Wrench className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">{category}</h2>
              </div>
              <ul className="space-y-2.5 text-sm font-medium">
                {categoryTools.map(tool => {
                  const path = getPathFromTab(tool.id);
                  return (
                    <li key={tool.id}>
                      <a
                        href={path}
                        onClick={(e) => handleClick(e, path)}
                        className="flex items-center justify-between text-slate-700 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition-colors py-1 group"
                      >
                        <span>{tool.title}</span>
                        <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* 4. Blog Guides & Articles */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">PDF & Document Guides Directory</h2>
            <p className="text-xs text-slate-500">Comprehensive technical tutorials and privacy instructions ({blogPosts.length} Articles)</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map(post => {
            const path = `/blog/${post.slug}`;
            return (
              <a
                key={post.slug}
                href={path}
                onClick={(e) => handleClick(e, path)}
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-red-500/40 dark:hover:border-red-500/40 bg-slate-50/50 dark:bg-slate-950/50 transition-all group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-full inline-block">
                    {post.category}
                  </span>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-red-500 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                </div>
                <div className="flex items-center justify-between pt-3 text-[11px] text-slate-400">
                  <span>{post.readTime}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
