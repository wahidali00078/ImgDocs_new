/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ShieldCheck, ArrowRight, Zap, CloudOff, FileCheck, 
  CheckCircle2, Star, BookOpen, HelpCircle, Users, 
  BarChart3, Lock, FileText, ChevronDown, Search, X, Heart,
  Mail, Sparkles, Activity, FileCode, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toolsList } from '../data/toolsData';
import { blogPosts } from '../data/blogData';
import { trackToolUsage, getRecommendedTools, getToolUsageMap } from '../lib/toolTracker';
import InteractiveHeroAnimation from './InteractiveHeroAnimation';

interface HomepageProps {
  onSelectTool: (toolId: string) => void;
  onNavigateBlog: (slug: string | null) => void;
}

export default function Homepage({ onSelectTool, onNavigateBlog }: HomepageProps) {
  const [faqOpen, setFaqOpen] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [newsletterEmail, setNewsletterEmail] = React.useState('');
  const [isSubscribed, setIsSubscribed] = React.useState(() => {
    try {
      return localStorage.getItem('imgdocs_newsletter_subscribed') === 'true';
    } catch {
      return false;
    }
  });

  const [favorites, setFavorites] = React.useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('imgdocs_favorite_tools');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleToolClick = (toolId: string) => {
    trackToolUsage(toolId);
    onSelectTool(toolId);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    try {
      localStorage.setItem('imgdocs_newsletter_subscribed', 'true');
      localStorage.setItem('imgdocs_newsletter_email', newsletterEmail.trim());
    } catch (err) {
      console.error('Failed to save newsletter subscription:', err);
    }
    setIsSubscribed(true);
  };

  const recommendedData = React.useMemo(() => {
    return getRecommendedTools();
  }, []);

  const toolUsageMap = React.useMemo(() => {
    return getToolUsageMap();
  }, []);

  const toggleFavorite = (e: React.MouseEvent, toolId: string) => {
    e.stopPropagation(); // Avoid triggering onSelectTool
    setFavorites(prev => {
      const next = prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId];
      try {
        localStorage.setItem('imgdocs_favorite_tools', JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save favorites to localStorage:', err);
      }
      return next;
    });
  };

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  // Group tools by category
  const filteredTools = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return toolsList;
    return toolsList.filter(tool => 
      tool.title.toLowerCase().includes(query) || 
      tool.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const favoriteTools = React.useMemo(() => {
    return filteredTools.filter(t => favorites.includes(t.id));
  }, [filteredTools, favorites]);

  const categories = React.useMemo(() => {
    return Array.from(new Set(filteredTools.map(t => t.category)));
  }, [filteredTools]);

  // Popular Tools List
  const popularTools = toolsList.filter(t => 
    ['jpg-to-pdf', 'pdf-to-jpg', 'compress-pdf', 'crop-image', 'esign-pdf', 'protect-pdf'].includes(t.id)
  );

  // Take the first 3 blog posts for preview
  const recentBlogs = blogPosts.slice(0, 3);

  const testimonials = [
    {
      quote: "ImgDocs has completely changed how our team manages document edits. Knowing that no files are ever sent to an external server gives us total peace of mind for client data.",
      author: "Sarah Jenkins",
      role: "Operations Director, Apex Legal Group",
      stars: 5
    },
    {
      quote: "The compress and signing tools are incredibly fast. Conversions happen instantly in the browser window, with absolutely zero quality loss.",
      author: "Marcus Chen",
      role: "Lead Creative Designer",
      stars: 5
    },
    {
      quote: "Simple, private, and incredibly reliable. Our finance department uses the PDF tools daily for tax receipt organization without risking confidential records.",
      author: "Elena Rostova",
      role: "Senior Accountant, FinTech Solutions",
      stars: 5
    }
  ];

  const faqs = [
    {
      q: 'How does ImgDocs process PDF files without uploading them to cloud servers?',
      a: 'Unlike traditional conversion websites that transmit your private files to remote cloud storage clusters, ImgDocs executes document transformations locally within your browser sandbox. By leveraging modern WebAssembly (Wasm) runtimes, HTML5 Canvas, and client-side binary compilers, our tools compute conversions using your device CPU and RAM. Your document text, metadata, and images never leave your local computer or phone.'
    },
    {
      q: 'What is your strict data retention and 1-hour file deletion policy?',
      a: 'We operate under a strict zero-knowledge architecture. For standard client-side conversions, your documents are processed exclusively in temporary browser memory buffers and cleared instantly when you close the tab. In rare scenarios where server-assisted fallback pipelines are utilized (such as legacy OCR on dense photocopies), files transmit across encrypted TLS 1.3 channels to ephemeral partitions and are permanently purged automatically after exactly 1 hour. We never inspect, store, or monetize your documents.'
    },
    {
      q: 'Are there file size limits, artificial queues, or hidden paywalls?',
      a: 'ImgDocs is 100% free to use for everyday document workflows. Most tools support file sizes up to 100MB per document and batch operations of up to 25 images simultaneously. Because computation runs on your local hardware rather than expensive server farms, you experience zero artificial queue delays, zero forced countdown timers, and zero intrusive watermarks stamped onto your finished files.'
    },
    {
      q: 'Is ImgDocs compliant with corporate data security standards including GDPR and HIPAA?',
      a: 'Yes. Enterprise legal and compliance teams frequently prohibit employees from uploading proprietary documents to public online converters due to data leakage risks. Because ImgDocs operates client-side without third-party data transmission, it satisfies strict regulatory mandates under the General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), and Health Insurance Portability and Accountability Act (HIPAA).'
    },
    {
      q: 'Can I convert, compress, and sign documents on smartphones and tablets?',
      a: 'Yes! ImgDocs is engineered with a mobile-first responsive architecture that functions seamlessly across Apple iOS (iPhone/iPad Safari) and Android (Chrome, Edge, Samsung Internet). You can photograph paper documents with your phone camera, convert them directly into standardized A4/Letter PDFs, eSign contracts with your fingertip on touchscreens, and download compiled files without installing native App Store downloads.'
    }
  ];

  return (
    <div className="space-y-16 py-6" id="landing-page-root">
      {/* JSON-LD FAQ Schema for Search Engine Optimization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
              "@type": "Question",
              "name": faq.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
              }
            }))
          })
        }}
      />
      
      {/* 1. Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6 px-4" id="hero-section">
        {/* Animated Gradient Background Accents */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-blue-500/15 to-indigo-500/15 rounded-full blur-3xl -z-10 animate-pulse-glow" />
        <div className="absolute top-1/4 left-10 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl -z-10 animate-float-slow" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-emerald-400/10 rounded-full blur-2xl -z-10 animate-float-reverse" />
        
        {/* Hero badge */}
        <motion.div 
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 px-3.5 py-1 text-xs font-bold text-primary dark:text-blue-400 uppercase tracking-wider border border-blue-100/50 dark:border-blue-900/40 shadow-xs shimmer-badge"
        >
          <ShieldCheck className="h-4 w-4 text-primary animate-pulse" />
          <span>Private Client-Side Processing</span>
        </motion.div>

        {/* Hero title */}
        <motion.h1 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-black font-display text-slate-900 dark:text-white tracking-tight leading-tight"
        >
          Professional PDF & Image Tools <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 animate-gradient-shift">
            Without Server Uploads
          </span>
        </motion.h1>

        {/* Hero subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed"
        >
          Convert, merge, split, compress, protect, and sign documents locally. Absolute confidentiality, instant conversions, and zero tracking. Fully compliant with standard data protection guidelines.
        </motion.p>

        {/* Hero CTA buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3.5 pt-2"
        >
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              const el = document.getElementById('tools-dashboard');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-primary-hover transition-all cursor-pointer"
          >
            <span>Launch Tools Dashboard</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigateBlog(null)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer shadow-xs"
          >
            <BookOpen className="h-4.5 w-4.5 text-indigo-500" />
            <span>Browse Guides & Tutorials</span>
          </motion.button>
        </motion.div>

        {/* Live Transformation Interactive Animation Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <InteractiveHeroAnimation onSelectTool={handleToolClick} />
        </motion.div>

        {/* Feature badges */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-8 border-t border-slate-100 dark:border-slate-900"
        >
          <motion.div 
            whileHover={{ y: -3, scale: 1.03 }}
            className="flex flex-col items-center p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100/80 dark:border-slate-800/60 shadow-2xs transition-all"
          >
            <CloudOff className="h-4.5 w-4.5 text-red-500 mb-1" />
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Offline-Capable</span>
          </motion.div>
          <motion.div 
            whileHover={{ y: -3, scale: 1.03 }}
            className="flex flex-col items-center p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100/80 dark:border-slate-800/60 shadow-2xs transition-all"
          >
            <Lock className="h-4.5 w-4.5 text-blue-500 mb-1" />
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">AES-256 Security</span>
          </motion.div>
          <motion.div 
            whileHover={{ y: -3, scale: 1.03 }}
            className="flex flex-col items-center p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100/80 dark:border-slate-800/60 shadow-2xs transition-all"
          >
            <Zap className="h-4.5 w-4.5 text-emerald-500 mb-1" />
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Instant Execution</span>
          </motion.div>
          <motion.div 
            whileHover={{ y: -3, scale: 1.03 }}
            className="flex flex-col items-center p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100/80 dark:border-slate-800/60 shadow-2xs transition-all"
          >
            <FileCheck className="h-4.5 w-4.5 text-amber-500 mb-1" />
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">No Watermarks</span>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. Recommended Tools Section (Based on usage history) */}
      <section className="max-w-7xl mx-auto px-4 space-y-6" id="recommended-tools-section">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 px-3.5 py-1 text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40">
            <Sparkles className="h-3.5 w-3.5 fill-amber-500 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
            <span>{recommendedData.hasUsageHistory ? 'Frequently Used Tools' : 'Recommended For You'}</span>
          </div>
          <h2 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
            Recommended Tools
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {recommendedData.hasUsageHistory 
              ? 'Quickly access the utilities you use most often in your browser.' 
              : 'Our top recommended client-side PDF tools to get started.'}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {recommendedData.tools.map((tool) => {
            const count = toolUsageMap[tool.id] || toolUsageMap[tool.id.replace('-', '_')] || 0;
            return (
              <motion.div
                key={tool.id}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                onClick={() => handleToolClick(tool.id)}
                className="neon-glow-card group relative rounded-2xl border border-blue-100 dark:border-slate-800 bg-gradient-to-b from-blue-50/40 via-white to-white dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950 p-6 shadow-xs hover:border-primary/50 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-100/80 dark:bg-blue-950/80 px-2 py-0.5 text-[9px] font-bold text-primary dark:text-blue-300 uppercase tracking-wide">
                      {tool.category}
                    </span>
                    {count > 0 && (
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-full">
                        <Activity className="h-3 w-3 text-emerald-500 shrink-0" /> {count} {count === 1 ? 'use' : 'uses'}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold font-display text-slate-900 dark:text-white tracking-tight group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {tool.shortDescription}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between text-xs font-bold text-primary">
                  <span>Launch Tool</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3. Popular Quick-Access Tools */}
      <section className="max-w-7xl mx-auto px-4 space-y-6" id="popular-tools-section">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Fast & Secure</span>
          <h2 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight mt-1">Popular Utility Tools</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {popularTools.map((tool) => (
            <motion.div
              key={tool.id}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              onClick={() => handleToolClick(tool.id)}
              className="neon-glow-card group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                  Private Conversion
                </span>
                
                <h3 className="text-base font-extrabold font-display text-slate-900 dark:text-white tracking-tight leading-tight group-hover:text-primary transition-colors">
                  {tool.title}
                </h3>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {tool.shortDescription}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-900/50 flex items-center justify-between text-xs font-bold text-primary">
                <span>Launch Client Tool</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Comprehensive Interactive Dashboard Grid */}
      <section className="max-w-7xl mx-auto px-4 space-y-8 scroll-mt-24" id="tools-dashboard">
        <div className="text-center max-w-xl mx-auto space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">All 24 Utilities</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight mt-1">Complete Document Toolbox</h2>
            <p className="text-xs text-slate-500">All options are grouped by functional workflow layers.</p>
          </div>

          {/* Search Input Bar */}
          <div className="relative max-w-md mx-auto pt-2">
            <div className="pointer-events-none absolute inset-y-0 left-4 top-2.5 flex items-center pl-0.5">
              <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            </div>
            <input
              id="homepage-search-input"
              type="text"
              placeholder="Search tools by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-3 pl-11 pr-16 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs"
            />
            {!searchQuery && (
              <div className="pointer-events-none absolute inset-y-0 right-3.5 top-2.5 flex items-center">
                <kbd className="hidden sm:inline-block rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:text-slate-500 shadow-2xs">
                  /
                </kbd>
              </div>
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-4 top-2.5 flex items-center pr-0.5 hover:text-slate-600 dark:hover:text-slate-300 text-slate-400 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
            <Search className="h-8 w-8 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No PDF utilities found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              No tools matched your search query "{searchQuery}". Try searching for categories like "convert", "optimize", or keywords like "jpg", "compress".
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 text-xs font-bold transition-all cursor-pointer"
            >
              Clear Search Query
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* 'My Favorites' section rendered above category grids if there's any favorited tools */}
            {favoriteTools.length > 0 && (
              <div className="space-y-4">
                <div className="border-b border-rose-100 dark:border-rose-950 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4.5 w-4.5 text-rose-500 fill-rose-500 animate-pulse" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-rose-500 dark:text-rose-400 font-display">
                      My Favorites ({favoriteTools.length})
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Quick Access</span>
                </div>

                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.05 }
                    }
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                >
                  {favoriteTools.map((tool) => (
                    <motion.div
                      key={`fav-${tool.id}`}
                      variants={{
                        hidden: { opacity: 0, y: 12 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: {
                            type: 'spring',
                            stiffness: 110,
                            damping: 14,
                          },
                        },
                      }}
                      whileHover={{
                        scale: 1.03,
                        y: -5,
                        transition: { duration: 0.2, ease: "easeOut" }
                      }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleToolClick(tool.id)}
                      className="neon-glow-card group relative flex flex-col justify-between py-5 px-4.5 sm:py-4.5 sm:px-4.5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer min-h-[140px]"
                      id={`fav-bento-${tool.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1.5 flex-1">
                          <h4 className="text-xs font-extrabold font-display text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                            {tool.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                            {tool.shortDescription}
                          </p>
                        </div>
                        <button
                          onClick={(e) => toggleFavorite(e, tool.id)}
                          className="p-2.5 -mt-2 -mr-2.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-900/50 text-rose-500 hover:text-slate-400 transition-colors flex items-center justify-center min-w-[44px] min-h-[44px] shrink-0 cursor-pointer"
                          aria-label="Remove from favorites"
                        >
                          <Heart className="h-4.5 w-4.5 fill-rose-500 text-rose-500 scale-110" />
                        </button>
                      </div>

                      <div className="mt-3.5 pt-3 border-t border-slate-50 dark:border-slate-900/50 flex items-center justify-between text-[10px] font-bold text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200">
                        <span>Open Editor</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}

            {categories.map((cat) => {
              const catTools = filteredTools.filter(t => t.category === cat);
              
              // Animation variants for staggered grid
              const containerVariants = {
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.04,
                  },
                },
              };

              const cardVariants = {
                hidden: { opacity: 0, y: 10 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: 'spring',
                    stiffness: 120,
                    damping: 15,
                  },
                },
              };

              return (
                <div key={cat} className="space-y-4">
                  <div className="border-b border-slate-100 dark:border-slate-900 pb-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-display">
                      {cat} Group
                    </h3>
                  </div>

                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-30px" }}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                  >
                    {catTools.map((tool) => (
                      <motion.div
                        key={tool.id}
                        variants={cardVariants}
                        whileHover={{
                          scale: 1.03,
                          y: -5,
                          transition: { duration: 0.2, ease: "easeOut" }
                        }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleToolClick(tool.id)}
                        className="neon-glow-card group flex flex-col justify-between py-5 px-4.5 sm:py-4.5 sm:px-4.5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer min-h-[140px]"
                        id={`bento-${tool.id}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1.5 flex-1">
                            <h4 className="text-xs font-extrabold font-display text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                              {tool.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                              {tool.shortDescription}
                            </p>
                          </div>
                          <button
                            onClick={(e) => toggleFavorite(e, tool.id)}
                            className="p-2.5 -mt-2 -mr-2.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-900/50 text-slate-400 hover:text-rose-500 transition-colors flex items-center justify-center min-w-[44px] min-h-[44px] shrink-0 cursor-pointer"
                            aria-label={favorites.includes(tool.id) ? "Remove from favorites" : "Add to favorites"}
                          >
                            <Heart className={`h-4.5 w-4.5 transition-all ${favorites.includes(tool.id) ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-400 dark:text-slate-500 group-hover:text-rose-400'}`} />
                          </button>
                        </div>

                        <div className="mt-3.5 pt-3 border-t border-slate-50 dark:border-slate-900/50 flex items-center justify-between text-[10px] font-bold text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200">
                          <span>Open Editor</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Why Choose Us / Security */}
      <section className="bg-slate-50 dark:bg-slate-900/30 border-y border-slate-100 dark:border-slate-900 py-12" id="why-choose-us">
        <div className="max-w-7xl mx-auto px-4 grid gap-8 md:grid-cols-2 items-center">
          <div className="space-y-5">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Local File Execution</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
              Absolute In-Browser Conversion <br />
              Is Our Core Standard.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Traditional conversion websites operate by uploading your private spreadsheets, scans, signatures, and reports directly to remote cloud servers. Once uploaded, your files can reside on unsecured caches or hard disks. <br /><br />
              ImgDocs removes this risk entirely. All processing code compiles inside your web browser using client CPUs. This architecture ensures complete peace of mind, no data transfer lag, and maximum security compliance.
            </p>

            <div className="space-y-2.5 pt-1">
              <motion.div whileHover={{ x: 4 }} className="flex items-start gap-2.5 transition-transform">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Auto-Delete Memory: Allocated browser buffers clear automatically on tab close.</span>
              </motion.div>
              <motion.div whileHover={{ x: 4 }} className="flex items-start gap-2.5 transition-transform">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">HIPAA & GDPR Compliant: Zero tracking, no data storage, perfect for confidential legal files.</span>
              </motion.div>
              <motion.div whileHover={{ x: 4 }} className="flex items-start gap-2.5 transition-transform">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">High Resolution Preserved: Zero quality compression unless specified by you.</span>
              </motion.div>
            </div>
          </div>

          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 sm:p-8 shadow-lg relative overflow-hidden space-y-6"
          >
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest border-b border-slate-100 dark:border-slate-900 pb-3">
              <Lock className="h-4 w-4 text-primary animate-pulse" /> Security Matrix Policy
            </div>
            
            <div className="space-y-3 font-mono text-[10px] text-slate-500">
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-900/50 pb-1.5">
                <span>SOURCE FILE STREAM</span>
                <span className="text-emerald-500 font-bold">CLIENT BUFFER ONLY</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-900/50 pb-1.5">
                <span>ENCRYPTION ALGORITHM</span>
                <span className="text-slate-800 dark:text-white font-bold">AES-256 BIT KEY</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-900/50 pb-1.5">
                <span>CLOUD FILE ARCHIVAL</span>
                <span className="text-rose-500 font-bold">DISABLED (0% BYTES SAVED)</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-900/50 pb-1.5">
                <span>TRACKING COOKIES</span>
                <span className="text-slate-800 dark:text-white font-bold">DEACTIVATED</span>
              </div>
              <div className="flex justify-between">
                <span>OCR RECOGNITION RUNS</span>
                <span className="text-emerald-500 font-bold">UNLIMITED LOCAL RUNS</span>
              </div>
            </div>

            <div className="absolute bottom-3 right-4 text-[8px] font-extrabold uppercase text-slate-300 dark:text-slate-800 tracking-widest">
              SYSTEM SECURE Matrix
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. Customer Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 space-y-6" id="testimonials-section">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">User Reviews</span>
          <h2 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight mt-1">Trusted globally by professionals</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -4, scale: 1.015 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              className="p-5.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs hover:shadow-md flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-950 flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.author}</span>
                <span className="text-[10px] text-slate-400">{t.role}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. Statistics & Figures */}
      <section className="max-w-7xl mx-auto px-4" id="stats-section">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <motion.div whileHover={{ y: -4, scale: 1.03 }} className="p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 shadow-xs hover:shadow-md transition-all space-y-0.5">
            <Users className="h-5 w-5 text-primary mx-auto mb-1.5" />
            <span className="block text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white">4.8M+</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Global Files Converted</span>
          </motion.div>
          <motion.div whileHover={{ y: -4, scale: 1.03 }} className="p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 shadow-xs hover:shadow-md transition-all space-y-0.5">
            <CloudOff className="h-5 w-5 text-emerald-500 mx-auto mb-1.5" />
            <span className="block text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white">100%</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Local Executions</span>
          </motion.div>
          <motion.div whileHover={{ y: -4, scale: 1.03 }} className="p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 shadow-xs hover:shadow-md transition-all space-y-0.5">
            <BarChart3 className="h-5 w-5 text-blue-500 mx-auto mb-1.5" />
            <span className="block text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white">0 Bytes</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Stored on Servers</span>
          </motion.div>
          <motion.div whileHover={{ y: -4, scale: 1.03 }} className="p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 shadow-xs hover:shadow-md transition-all space-y-0.5">
            <Zap className="h-5 w-5 text-amber-500 mx-auto mb-1.5" />
            <span className="block text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white">&lt; 1.2s</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Average Build Time</span>
          </motion.div>
        </div>
      </section>

      {/* 7. Recent Blog Guides Preview */}
      <section className="max-w-7xl mx-auto px-4 space-y-5" id="home-blog-preview">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Learn workflows</span>
            <h2 className="text-xl sm:text-2xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight mt-0.5">Recent Library Guides</h2>
          </div>
          <button
            onClick={() => onNavigateBlog(null)}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Read All Guides</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {recentBlogs.map((post) => (
            <motion.article
              key={post.slug}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              onClick={() => onNavigateBlog(post.slug)}
              className="group rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950 p-5.5 shadow-xs hover:shadow-lg transition-all cursor-pointer space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="inline-flex items-center rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  {post.category}
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {post.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-50 dark:border-slate-900 flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span>{post.date}</span>
                <span>{post.readTime}</span>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Comprehensive Architectural Overview & Privacy Promise (400+ words) */}
      <section className="max-w-4xl mx-auto px-4 space-y-8" id="about-platform-deep-dive">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-8 sm:p-10 shadow-xs backdrop-blur-sm space-y-6">
          <div className="border-b border-slate-150 dark:border-slate-800 pb-5">
            <span className="text-[10px] font-black tracking-widest text-primary uppercase">The Privacy-First Document Standard</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">What ImgDocs Offers to Modern Professionals</h2>
          </div>
          
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
            <p>
              ImgDocs is a unified, high-performance digital document workstation built to replace obsolete desktop software and privacy-invasive cloud upload services. Our platform equips individuals, legal teams, healthcare professionals, accountants, and enterprises with 21 dedicated tools designed to convert, compress, edit, merge, split, rotate, watermark, protect, and electronically sign PDF and image documents.
            </p>
            <p>
              Whether you need to convert multi-page smartphone receipts into an expense-ready PDF, shrink a 60MB design portfolio down to an email-compliant attachment under 15MB, extract tabular figures from an encrypted PDF into an editable Excel spreadsheet, or permanently delete confidential pages from a legal contract, ImgDocs delivers institutional-grade document processing with zero software installation and zero subscription fees.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 pt-2">
            <div className="rounded-2xl border border-slate-150 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-5 space-y-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                Why Choose Client-Side Execution?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Traditional online converters transmit your confidential files across the open internet to shared cloud servers where they sit on temporary hard drives. ImgDocs fundamentally shifts document computation to the client side. By executing conversions directly within your browser runtime using WebAssembly and hardware-accelerated memory buffers, your sensitive legal contracts, medical records, tax forms, and proprietary plans never leave your machine.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-150 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-5 space-y-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />
                How the Local Technology Works
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                When you drag a document onto ImgDocs, our local engine allocates an isolated memory heap inside your browser. High-performance WebAssembly runtimes parse internal PDF object catalogs, rasterize vector coordinate matrices, compress high-DPI image assets, or inject military-grade AES-256 encryption keys on your local CPU. When conversion finishes, you download the compiled binary immediately and all temporary heap allocations are wiped from RAM.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-100 dark:border-indigo-950/80 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 dark:from-indigo-950/30 dark:to-blue-950/30 p-5 space-y-2">
            <h3 className="font-bold text-sm text-indigo-950 dark:text-indigo-200">Our Uncompromising Privacy & File-Purge Guarantee</h3>
            <p className="text-xs text-indigo-900/80 dark:text-indigo-300/80 leading-relaxed">
              We operate under an absolute zero-knowledge principle. For core client-side tools, 100% of processing happens in your device memory; zero bytes of document data ever reach our servers. For specialized server-assisted fallback utilities (such as legacy optical character recognition on scanned photocopies), files transmit exclusively over encrypted TLS 1.3 channels to sandboxed memory partitions and are permanently deleted automatically after 1 hour. We never inspect, retain, archive, or monetize your intellectual property.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Detailed FAQs with Smooth Collapsible Animation */}
      <section className="max-w-3xl mx-auto px-4 space-y-5" id="home-faq">
        <div className="text-center max-w-xl mx-auto">
          <HelpCircle className="h-6.5 w-6.5 text-primary mx-auto mb-1" />
          <h2 className="text-xl sm:text-2xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-500 mt-1">Get precise details on browser compliance and architectures.</p>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = faqOpen === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-4.5 text-left font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors focus:outline-none cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-4.5 pb-4.5 pt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-900/50">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. Trust CTA Section */}
      <motion.section 
        whileHover={{ scale: 1.005 }}
        className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-6 sm:p-10 text-center text-white relative overflow-hidden shadow-2xl" 
        id="trust-banner"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.2),transparent)] pointer-events-none" />
        
        <div className="space-y-3.5 max-w-2xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-blue-300 shimmer-badge">
            Enterprise Compliant
          </span>
          <h2 className="font-display text-xl sm:text-3xl font-black tracking-tight leading-tight">
            Protect Your Confidential Data From Cloud Leakage
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
            Corporate security audits reject online converters that harvest files. Join millions of developers, accountants, lawyers, and writers using ImgDocs to convert files securely inside the browser window.
          </p>

          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              const el = document.getElementById('tools-dashboard');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 px-6 py-3 text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <span>Launch Free ImgDocs Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      </motion.section>

      {/* 10. Newsletter Subscription Section */}
      <section className="mx-auto max-w-5xl rounded-3xl border border-blue-100 dark:border-blue-950/60 bg-gradient-to-br from-blue-50/60 via-white to-slate-50 dark:from-slate-900/90 dark:via-slate-950 dark:to-blue-950/30 p-8 sm:p-10 shadow-xs relative overflow-hidden" id="newsletter-section">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary dark:text-blue-400 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
              <Mail className="h-3.5 w-3.5" /> Product Updates & Privacy Tips
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Stay ahead with new PDF utilities, browser performance updates, and privacy-first document tips delivered directly to your inbox. No spam ever.
            </p>
          </div>

          {isSubscribed ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 text-emerald-800 dark:text-emerald-300 text-xs font-bold w-full md:w-auto"
            >
              <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
              <div>
                <p className="font-extrabold text-emerald-900 dark:text-emerald-200 text-sm">You're Subscribed!</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-normal mt-0.5">We'll email you whenever new local PDF tools launch.</p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="w-full md:w-auto min-w-[320px] space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs"
                />
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="shrink-0 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold px-5 py-3 text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </motion.button>
              </div>
              <p className="text-[10px] text-slate-400 text-center md:text-left font-medium">
                🔒 100% private. We respect your privacy & zero-spam promise.
              </p>
            </form>
          )}
        </div>
      </section>

    </div>
  );
}
