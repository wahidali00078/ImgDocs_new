/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, ArrowUpRight, Scale, Heart } from 'lucide-react';
import Logo from './Logo';

interface FooterProps {
  onChangeTab: (tab: string) => void;
}

export default function Footer({ onChangeTab }: FooterProps) {
  
  const handleNav = (tab: string) => {
    onChangeTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12 mt-12 px-6 text-slate-500 text-sm" id="app-footer">
      <div className="mx-auto max-w-7xl space-y-12">
        
        {/* Footer Top Links Grid */}
        <div className="grid gap-8 grid-cols-2 md:grid-cols-4 lg:grid-cols-5" id="footer-links-grid">
          
          {/* Brand block */}
          <div className="col-span-2 space-y-4">
            <button
              onClick={() => handleNav('home')}
              className="flex items-center gap-2 text-left bg-transparent border-none p-0 focus:outline-none cursor-pointer"
            >
              <Logo className="h-10 w-10 shrink-0" />
              <span className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Img<span className="text-primary">Docs</span>
              </span>
            </button>
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed max-w-sm">
              ImgDocs is a professional-grade office utility designed to deliver instant file operations locally in your browser. We protect sensitive workflows from server-side security vulnerabilities.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-widest bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full px-3 py-1 self-start inline-flex">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Zero-Storage Active Policy</span>
            </div>
          </div>

          {/* Core tools column */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Popular Tools</h4>
            <ul className="space-y-2 text-xs font-bold text-slate-600 dark:text-slate-400">
              <li><button onClick={() => handleNav('jpg_to_pdf')} className="hover:text-primary cursor-pointer">JPG to PDF</button></li>
              <li><button onClick={() => handleNav('pdf_to_jpg')} className="hover:text-primary cursor-pointer">PDF to JPG</button></li>
              <li><button onClick={() => handleNav('compress')} className="hover:text-primary cursor-pointer">Compress PDF</button></li>
              <li><button onClick={() => handleNav('esign-pdf')} className="hover:text-primary cursor-pointer">eSign PDF</button></li>
              <li><button onClick={() => handleNav('protect-pdf')} className="hover:text-primary cursor-pointer">Protect PDF</button></li>
            </ul>
          </div>

          {/* Resources & Company */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Company & Resources</h4>
            <ul className="space-y-2 text-xs font-bold text-slate-600 dark:text-slate-400">
              <li><button onClick={() => handleNav('about')} className="hover:text-primary cursor-pointer">About Us</button></li>
              <li><button onClick={() => handleNav('contact')} className="hover:text-primary cursor-pointer">Contact Us</button></li>
              <li><button onClick={() => handleNav('blog')} className="hover:text-primary cursor-pointer">Guides & Tutorials</button></li>
              <li><button onClick={() => handleNav('tools')} className="hover:text-primary cursor-pointer">All Tools Directory</button></li>
              <li><button onClick={() => handleNav('security')} className="hover:text-primary cursor-pointer">Security & Architecture</button></li>
              <li><button onClick={() => handleNav('reviews')} className="hover:text-primary cursor-pointer">Customer Reviews</button></li>
              <li><button onClick={() => handleNav('help')} className="hover:text-primary cursor-pointer">Help Center</button></li>
              <li><button onClick={() => handleNav('html-sitemap')} className="hover:text-primary cursor-pointer">HTML Sitemap</button></li>
            </ul>
          </div>

          {/* Legal columns & Direct Contact */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Legal Compliance</h4>
            <ul className="space-y-2 text-xs font-bold text-slate-600 dark:text-slate-400">
              <li><button onClick={() => handleNav('privacy')} className="hover:text-primary cursor-pointer">Privacy Policy</button></li>
              <li><button onClick={() => handleNav('terms')} className="hover:text-primary cursor-pointer">Terms of Service</button></li>
              <li><button onClick={() => handleNav('disclaimer')} className="hover:text-primary cursor-pointer">Disclaimer Notice</button></li>
              <li><button onClick={() => handleNav('cookie')} className="hover:text-primary cursor-pointer">Cookie Policy</button></li>
              <li><button onClick={() => handleNav('refund-policy')} className="hover:text-primary cursor-pointer">Refund Policy</button></li>
              <li><button onClick={() => handleNav('dmca')} className="hover:text-primary cursor-pointer">DMCA Compliance</button></li>
            </ul>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-900 text-xs text-slate-500">
              <span className="block text-[10px] font-bold uppercase text-slate-400">Official Support</span>
              <a href="mailto:support@imgdocs.me" className="text-primary font-bold hover:underline">support@imgdocs.me</a>
            </div>
          </div>

        </div>

        {/* Security & Data Retention Notice */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-900/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span><strong>Data Retention Policy:</strong> Files are processed securely in your browser. Server-assisted conversion files are deleted automatically after 1 hour.</span>
          </div>
          <span className="shrink-0 text-[11px] font-bold text-slate-400">Zero Permanent Storage</span>
        </div>

        {/* Bottom copyright segment */}
        <div className="border-t border-slate-100 dark:border-slate-900 pt-6 flex flex-col items-center justify-between gap-4 sm:flex-row text-xs text-slate-400 dark:text-slate-500">
          <p className="font-semibold flex items-center gap-1.5">
            © {new Date().getFullYear()} ImgDocs Technologies.
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="font-normal text-[10px] uppercase tracking-wider">Singapore Admin Headlands</span>
          </p>

          <p className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9px] text-slate-300 dark:text-slate-700">
            <Heart className="h-3.5 w-3.5 text-rose-500 shrink-0" />
            <span>Built Locally for Universal Security</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
