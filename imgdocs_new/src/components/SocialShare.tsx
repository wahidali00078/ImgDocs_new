/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Share2, Check, Copy, MessageCircle } from 'lucide-react';

interface SocialShareProps {
  toolTitle?: string;
  toolDescription?: string;
  className?: string;
}

export default function SocialShare({ toolTitle = 'ImgDocs PDF Tools', toolDescription = 'Secure client-side PDF tools running 100% locally in your browser memory.', className = '' }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://imgdocs.com';
  const shareText = `Check out ${toolTitle} on ImgDocs! ${toolDescription} 100% private & fast:`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = currentUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}&via=imgdocs`;
    window.open(url, '_blank', 'width=600,height=400,noopener,noreferrer');
  };

  const shareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=500,noopener,noreferrer');
  };

  const shareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=500,noopener,noreferrer');
  };

  const shareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=500,noopener,noreferrer');
  };

  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 p-5 space-y-3.5 ${className}`} id="social-share-widget">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-primary/10 text-primary dark:text-blue-400">
            <Share2 className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-xs font-black font-display text-slate-800 dark:text-slate-100 tracking-tight">
              Share This Tool With Your Network
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Help your colleagues & friends process PDF files securely without cloud uploads.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Twitter / X */}
        <button
          type="button"
          onClick={shareTwitter}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          title="Share on Twitter / X"
        >
          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span>Twitter / X</span>
        </button>

        {/* LinkedIn */}
        <button
          type="button"
          onClick={shareLinkedIn}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B66C2] hover:bg-[#084e96] text-white px-3.5 py-2 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          title="Share on LinkedIn"
        >
          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.72a1.49 1.49 0 1 0 0 2.98 1.49 1.49 0 0 0 0-2.98z" />
          </svg>
          <span>LinkedIn</span>
        </button>

        {/* Facebook */}
        <button
          type="button"
          onClick={shareFacebook}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#1877F2] hover:bg-[#0d65d9] text-white px-3.5 py-2 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          title="Share on Facebook"
        >
          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7.5v-3H10V9.5C10 7.01 11.49 5.65 13.75 5.65c1.08 0 2.21.19 2.21.19v2.43h-1.25c-1.23 0-1.61.77-1.61 1.56V12h2.74l-.44 3h-2.3v6.8c4.56-.93 8-4.96 8-9.8z" />
          </svg>
          <span>Facebook</span>
        </button>

        {/* WhatsApp */}
        <button
          type="button"
          onClick={shareWhatsApp}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#1fbd59] text-white px-3.5 py-2 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          title="Share via WhatsApp"
        >
          <MessageCircle className="h-3.5 w-3.5 fill-current" />
          <span>WhatsApp</span>
        </button>

        {/* Copy Direct Link */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer shadow-2xs ml-auto"
          title="Copy Tool Link"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-slate-500" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
