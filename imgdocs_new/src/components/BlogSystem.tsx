/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { blogPosts, BlogPost } from '../data/blogData';
import { Search, Calendar, Clock, ArrowLeft, ArrowRight, BookOpen, User, Tag, Share2 } from 'lucide-react';

interface BlogSystemProps {
  activeSlug: string | null;
  onSelectPost: (slug: string | null) => void;
}

export function BlogDirectory({ onSelectPost }: { onSelectPost: (slug: string | null) => void }) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All');

  const categories = ['All', 'PDF Guides', 'Security & Privacy', 'Office Productivity', 'Advanced Workflows'];

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 py-4" id="blog-directory-container">
      {/* Search & Category Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" />
            ImgDocs Library & Blog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Read original, technical guides and tips on document workflow security, compression, and conversions.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search tutorials & guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-primary shadow-xs"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5" id="blog-categories-pills">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-primary text-white shadow-md'
                : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid listing */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-sm text-slate-500">No blog posts found matching your search. Try searching general phrases like "compress" or "Word".</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" id="blog-posts-grid">
          {filteredPosts.map((post) => (
            <article
              key={post.slug}
              onClick={() => {
                onSelectPost(post.slug);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-xs hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer"
            >
              <div className="space-y-3">
                <span className="inline-flex items-center rounded-md bg-red-50 dark:bg-red-950/30 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wide">
                  {post.category}
                </span>
                
                <h2 className="text-base font-extrabold font-display text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {post.summary}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-900/50 flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {post.readTime}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export function BlogPostReader({ activeSlug, onSelectPost }: BlogSystemProps) {
  const post = blogPosts.find((p) => p.slug === activeSlug);

  if (!post) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-sm text-slate-500">Post not found.</p>
        <button onClick={() => onSelectPost(null)} className="text-xs text-primary font-bold hover:underline">Back to blog index</button>
      </div>
    );
  }

  // Find related posts (same category, different slug)
  const related = blogPosts
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3);

  return (
    <div className="space-y-8 py-4 max-w-4xl mx-auto" id={`blog-post-view-${post.slug}`}>
      {/* Back to Blog Button */}
      <button
        onClick={() => onSelectPost(null)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm transition-all cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 text-slate-500" />
        <span>Back to Blog Library</span>
      </button>

      {/* Article Header Card */}
      <header className="space-y-4 border-b border-slate-100 dark:border-slate-900 pb-6">
        <span className="inline-flex items-center rounded bg-red-50 dark:bg-red-950/30 px-2.5 py-1 text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wide">
          {post.category}
        </span>
        
        <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-900 dark:text-white tracking-tight leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4 text-slate-400" />
            ImgDocs Editorial Team
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-slate-400" />
            {post.date}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-400" />
            {post.readTime}
          </span>
        </div>
      </header>

      {/* Main Copy Area */}
      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-6 leading-relaxed text-sm md:text-base">
        <div className="font-medium text-slate-600 dark:text-slate-400 italic border-l-4 border-primary pl-4 py-2 bg-slate-50 dark:bg-slate-900/40 rounded-r-xl text-sm md:text-base leading-relaxed">
          {post.summary}
        </div>
        
        {/* Render paragraphs semantically to maintain clean headings, lists, and FAQs */}
        <div className="space-y-4">
          {post.content.split('\n\n').map((block, idx) => {
            const trimmed = block.trim();
            if (trimmed.startsWith('### ')) {
              return (
                <h2 key={idx} className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white pt-6 pb-1 border-b border-slate-100 dark:border-slate-800">
                  {trimmed.replace('### ', '')}
                </h2>
              );
            }
            if (trimmed.startsWith('#### ')) {
              return (
                <h3 key={idx} className="text-lg font-bold font-display text-slate-800 dark:text-slate-100 pt-3">
                  {trimmed.replace('#### ', '')}
                </h3>
              );
            }
            if (trimmed.startsWith('Q: ')) {
              const [q, ...rest] = trimmed.split('\nA: ');
              return (
                <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/30 space-y-1 my-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-primary font-mono">Q.</span>
                    {q.replace('Q: ', '')}
                  </h4>
                  {rest.length > 0 && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-5 leading-relaxed">
                      {rest.join('\nA: ')}
                    </p>
                  )}
                </div>
              );
            }
            if (trimmed.startsWith('- ') || trimmed.startsWith('1. ') || trimmed.startsWith('2. ') || trimmed.startsWith('3. ') || trimmed.startsWith('4. ')) {
              const lines = trimmed.split('\n');
              return (
                <ul key={idx} className="space-y-2 pl-5 list-disc text-xs sm:text-sm text-slate-600 dark:text-slate-400 my-2">
                  {lines.map((line, lIdx) => (
                    <li key={lIdx} className="leading-relaxed">
                      {line.replace(/^-\s+/, '').replace(/^\d+\.\s+/, '')}
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={idx} className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {trimmed}
              </p>
            );
          })}
        </div>
      </div>

      {/* Security Disclaimer bottom block */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-900/40 flex items-start gap-4">
        <BookOpen className="h-6 w-6 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Browser Memory Notice</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            All tools referenced in this guide are implemented directly inside your web browser session using modern JavaScript and WebAssembly layers. ImgDocs never records or transmits your files.
          </p>
        </div>
      </div>

      {/* Social Share Callout */}
      <div className="flex items-center justify-between border-t border-b border-slate-100 dark:border-slate-900 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
        <span>Helpful Article? Share with teams</span>
        <button className="flex items-center gap-1.5 text-primary hover:underline cursor-pointer">
          <Share2 className="h-4 w-4" /> Share Link
        </button>
      </div>

      {/* Recommended Related Posts */}
      {related.length > 0 && (
        <section className="space-y-4 pt-4">
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Recommended Reading
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            {related.map((p) => (
              <div
                key={p.slug}
                onClick={() => {
                  onSelectPost(p.slug);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer space-y-2.5"
              >
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">{p.category}</span>
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-white line-clamp-2 leading-snug">{p.title}</h4>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-semibold">
                  <span>{p.date}</span>
                  <span>{p.readTime}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
