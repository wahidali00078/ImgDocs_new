/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, Home, ChevronRight, Grid, Sparkles } from 'lucide-react';
import { toolsList } from '../data/toolsData';
import { blogPosts } from '../data/blogData';

interface PageNavigationProps {
  activeTab: string;
  activeBlogSlug?: string | null;
  onNavigate: (pathOrTab: string) => void;
  onGoBack?: () => void;
  className?: string;
}

export default function PageNavigation({
  activeTab,
  activeBlogSlug,
  onNavigate,
  onGoBack,
  className = ''
}: PageNavigationProps) {
  // Determine user-friendly title and category breadcrumb
  let categoryLabel = 'Tools';
  let categoryPath = '/tools';
  let pageTitle = 'Tool';

  const normalizedToolId = activeTab === 'jpg_to_pdf' ? 'jpg-to-pdf'
    : activeTab === 'pdf_to_jpg' ? 'pdf-to-jpg'
    : activeTab === 'compress' ? 'compress-pdf'
    : activeTab;

  const matchedTool = toolsList.find(t => t.id === normalizedToolId);

  if (matchedTool) {
    categoryLabel = 'PDF Tools';
    categoryPath = '/tools';
    pageTitle = matchedTool.title;
  } else if (activeTab === 'blog') {
    categoryLabel = 'Resources';
    categoryPath = '/blog';
    pageTitle = 'Blog & Editorial Guides';
  } else if (activeTab === 'blog-post') {
    categoryLabel = 'Blog';
    categoryPath = '/blog';
    const post = blogPosts.find(p => p.slug === activeBlogSlug);
    pageTitle = post ? post.title : 'Article';
  } else if (['privacy', 'terms', 'cookie', 'disclaimer', 'dmca', 'refund-policy'].includes(activeTab)) {
    categoryLabel = 'Legal & Compliance';
    categoryPath = '/privacy-policy';
    const legalTitles: Record<string, string> = {
      'privacy': 'Privacy Policy',
      'terms': 'Terms of Service',
      'cookie': 'Cookie Policy',
      'disclaimer': 'Disclaimer & Security',
      'dmca': 'DMCA Copyright Policy',
      'refund-policy': 'Refund & Cancellation Policy'
    };
    pageTitle = legalTitles[activeTab] || 'Legal Policy';
  } else if (['about', 'contact', 'help', 'releases', 'api', 'careers', 'feature-requests', 'security', 'reviews', 'templates'].includes(activeTab)) {
    categoryLabel = 'Company';
    categoryPath = '/about';
    const staticTitles: Record<string, string> = {
      'about': 'About ImgDocs',
      'contact': 'Contact Support',
      'help': 'Help Center & Knowledgebase',
      'releases': 'Release Notes & Changelog',
      'api': 'Developer API Reference',
      'careers': 'Careers & Opportunities',
      'feature-requests': 'Feature Requests',
      'security': 'Security & Zero-Upload Architecture',
      'reviews': 'User Reviews & Ratings',
      'templates': 'Document Templates'
    };
    pageTitle = staticTitles[activeTab] || 'Page';
  } else if (activeTab === 'pricing') {
    categoryLabel = 'Subscription';
    categoryPath = '/pricing';
    pageTitle = 'Pricing & Upgrade Plans';
  } else if (activeTab === 'dashboard') {
    categoryLabel = 'Account';
    categoryPath = '/dashboard';
    pageTitle = 'User Workspace Dashboard';
  } else if (activeTab === 'html-sitemap') {
    categoryLabel = 'Directory';
    categoryPath = '/html-sitemap';
    pageTitle = 'HTML Site Index';
  } else if (activeTab === 'tools') {
    categoryLabel = 'Workspace';
    categoryPath = '/tools';
    pageTitle = 'All 24+ PDF & Document Utilities';
  } else if (activeTab === '404') {
    categoryLabel = 'System';
    categoryPath = '/';
    pageTitle = 'Page Not Found (404)';
  } else {
    pageTitle = activeTab.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  const handleBackClick = () => {
    if (onGoBack) {
      onGoBack();
      return;
    }
    // Safe browser back with fallback to homepage
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      onNavigate('home');
    }
  };

  return (
    <nav
      aria-label="Breadcrumb and Back Navigation"
      className={`sticky top-[56px] md:top-[64px] z-30 w-full rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 px-4 py-2.5 shadow-sm transition-all ${className}`}
      id="page-navigation-bar"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: Back Button + Home Quick Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBackClick}
            className="group flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/40 border border-slate-200/60 dark:border-slate-700/60 hover:border-red-200 dark:hover:border-red-900/60 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 transition-all active:scale-[0.98] cursor-pointer shadow-xs"
            id="page-nav-back-button"
            title="Go back to the previous view"
          >
            <ArrowLeft className="h-4 w-4 text-slate-500 group-hover:text-red-600 dark:text-slate-400 dark:group-hover:text-red-400 transition-transform group-hover:-translate-x-0.5" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 px-2.5 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            id="page-nav-home-button"
            title="Go to Homepage"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Home</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          {/* Breadcrumb Path */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px] sm:max-w-md md:max-w-xl">
            <button
              type="button"
              onClick={() => onNavigate(categoryPath)}
              className="hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors cursor-pointer truncate"
            >
              {categoryLabel}
            </button>
            <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600 shrink-0" />
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate" title={pageTitle}>
              {pageTitle}
            </span>
          </div>
        </div>

        {/* Right Side: Quick Action / Browse Tools shortcut */}
        <div className="flex items-center gap-2 ml-auto">
          {activeTab !== 'tools' && (
            <button
              type="button"
              onClick={() => onNavigate('tools')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-slate-700/60 transition-all cursor-pointer"
              id="page-nav-all-tools-btn"
            >
              <Grid className="h-3.5 w-3.5 text-red-500" />
              <span className="hidden md:inline">Browse All Tools</span>
              <span className="md:hidden">Tools</span>
            </button>
          )}

          {activeTab !== 'pricing' && (
            <button
              type="button"
              onClick={() => onNavigate('pricing')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
              id="page-nav-pro-badge"
            >
              <Sparkles className="h-3 w-3" />
              <span>Pro</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
