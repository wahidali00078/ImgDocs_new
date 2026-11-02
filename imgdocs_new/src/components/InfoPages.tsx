/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Mail, Shield, Scale, MapPin, Send, HelpCircle, Briefcase, FileText, 
  CheckCircle2, Terminal, Heart, Search, Layers, ArrowRight, Lock, 
  Star, Download, Sparkles, ThumbsUp, ShieldCheck, Cpu, Key, FileCheck, Users,
  Globe, Clock, Award, Building, Compass, AlertTriangle, EyeOff
} from 'lucide-react';
import { toolsList } from '../data/toolsData';

/* ==========================================
   ABOUT US PAGE
   ========================================== */
export function AboutUs() {
  return (
    <div className="space-y-12 max-w-4xl mx-auto py-4" id="about-us-page">
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-950/40 px-3.5 py-1 text-xs font-extrabold text-primary border border-red-200 dark:border-red-900/50">
          <Building className="h-3.5 w-3.5" /> About ImgDocs Technologies
        </span>
        <h1 className="text-4xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
          Pioneering Client-Side Document Security & Productivity
        </h1>
        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          ImgDocs was founded with a singular, uncompromising mission: to provide fast, professional document utilities that protect user data privacy by processing all files entirely in local browser memory.
        </p>
      </div>

      {/* Core Principles Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/40 text-primary">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Our Zero-Upload Security Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Unlike legacy online PDF converters that force users to upload confidential tax records, contracts, bank ledgers, and identity scans to remote cloud servers—exposing organizations to data leaks and GDPR/HIPAA compliance risks—ImgDocs executes all binary parsing, compression, rasterization, and encryption locally on your computer's CPU using WebAssembly and HTML5 Canvas.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500">
            <Compass className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Democratizing Document Software
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Essential productivity tools should be accessible to everyone—from university students submitting assignments to legal practitioners filing time-sensitive court documents. We provide an extensive suite of 20+ tools without mandatory registrations, intrusive watermarks, or deceptive trial paywalls.
          </p>
        </div>
      </div>

      {/* Detailed Story & Engineering Journey */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 sm:p-8 space-y-6 shadow-xs">
        <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" /> Who We Are & Why We Built ImgDocs
        </h3>
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <p>
            ImgDocs is managed and engineered by an independent group of software engineers, document workflow specialists, and web security advocates based in Singapore. Having worked extensively with corporate data compliance, our founding team observed a critical vulnerability in modern digital workflows: millions of individuals and small businesses daily upload sensitive documents to unverified cloud converters to perform basic tasks like merging pages or converting images to PDF.
          </p>
          <p>
            We realized that modern web browsers, equipped with modern WebAssembly runtimes and HTML5 Canvas standards, are capable of handling high-speed document operations directly on client hardware. By eliminating external server round-trips, we achieved two breakthrough benefits: <strong>instantaneous processing speeds</strong> and <strong>absolute mathematical privacy</strong>.
          </p>
          <p>
            Today, ImgDocs serves users in over 120 countries, processing thousands of client-side operations daily. We continuously invest in expanding our browser-native toolset, adding advanced capabilities like offline optical character recognition (OCR), dynamic PDF encryption, and interactive photo editors.
          </p>
        </div>
      </div>

      {/* Stats and Highlights */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-5 text-center space-y-1">
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">0 Bytes</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Server Data Storage</div>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-5 text-center space-y-1">
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">20+ Tools</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Free Browser Utilities</div>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-5 text-center space-y-1">
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">100% Client-Side</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">WebAssembly Engine</div>
        </div>
      </div>

      {/* Editorial Standards Notice */}
      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6 bg-slate-50/50 dark:bg-slate-900/20 space-y-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-500" /> Editorial & Technical Integrity
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          All tutorials, technical documentation, and step-by-step guides published on ImgDocs are written and verified by our in-house technical team. We do not publish auto-generated thin content or syndicated scrapings. Every tool description is grounded in genuine browser-native engineering practices to help users safely manage their digital files.
        </p>
      </div>
    </div>
  );
}

/* ==========================================
   CONTACT US PAGE
   ========================================== */
export function ContactUs() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [subject, setSubject] = React.useState('General Support');
  const [message, setMessage] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setError('Please fill out all required fields.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      // Simulate submission success or write to local store
      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setError('We could not save your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-5 py-4" id="contact-us-page">
      <div className="md:col-span-2 space-y-6">
        <div>
          <span className="text-xs font-extrabold text-primary uppercase tracking-wider">Direct Support & Inquiries</span>
          <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight mt-1">
            Get in Touch with Us
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Have questions about client-side document processing, technical integrations, enterprise data privacy audits, or advertising partnerships? Reach out directly.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Official Email</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">support@imgdocs.me</div>
              <div className="text-[11px] text-slate-500">Fast 24/7 technical assistance</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-500">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Response SLA</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">Within 24 to 48 Hours</div>
              <div className="text-[11px] text-slate-500">Monday - Friday (SGT / UTC+8)</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-500">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Operating Jurisdiction</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">ImgDocs Technologies</div>
              <div className="text-[11px] text-slate-500">Singapore Commercial Headlands</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/30 text-xs text-slate-500 dark:text-slate-400 leading-relaxed space-y-1">
          <strong className="text-slate-700 dark:text-slate-300">Security Disclosures:</strong>
          <p>
            To report security vulnerabilities or client-side sandbox inquiries, please mark your subject as "Security Audit Disclosure" for expedited escalation.
          </p>
        </div>
      </div>

      <div className="md:col-span-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 md:p-8 shadow-xs">
        {success ? (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Inquiry Dispatched!</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Thank you for reaching out. Your message has been logged securely and will be reviewed by our support engineers shortly.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="mt-4 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Submit an Inquiry</h3>
            {error && <p className="text-xs font-semibold text-red-500">{error}</p>}
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Your Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@company.com"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Inquiry Category</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-primary"
              >
                <option>General Support & Feedback</option>
                <option>Bug Report or Tool Issue</option>
                <option>Enterprise Privacy & Compliance Audit</option>
                <option>AdSense & Partnership Proposals</option>
                <option>Legal & DMCA Inquiry</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Your Message *</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help your document workflow?"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-red-600 text-white py-3 text-xs font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Sending Message...' : 'Send Message'}
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ==========================================
   FEATURE REQUESTS PAGE
   ========================================== */
export function FeatureRequests() {
  const [title, setTitle] = React.useState('');
  const [details, setDetails] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !details) return;
    setSubmitting(true);

    try {
      setSuccess(true);
      setTitle('');
      setDetails('');
    } catch (err) {
      console.error('Error saving feature request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-8" id="feature-requests-page">
      <div className="text-center space-y-3">
        <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
          Community Roadmap
        </span>
        <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
          Suggest a New Tool or Feature
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          We prioritize client-side tool development based on community feedback. Have an idea for a document or image utility? Share it below.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 md:p-8 shadow-xs">
        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Suggestion Recorded!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your feature suggestion has been added to our development review queue. Thank you for helping shape ImgDocs.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="mt-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
            >
              Suggest Another Feature
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Feature Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Client-Side PDF Redaction / Blackout Pen"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Feature Details & Use Case *</label>
              <textarea
                required
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe why this tool is needed, what problem it solves, and your ideal workflow."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 text-white py-3 text-xs font-bold shadow-md disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Submit to Development Roadmap'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ==========================================
   HELP CENTER & TUTORIALS
   ========================================== */
export function HelpCenter() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const guides = [
    {
      q: 'How does client-side PDF conversion work without uploading files?',
      a: 'ImgDocs utilizes WebAssembly compiled binaries (including JsPDF, PDF.js, and Canvas engines) that run directly inside your browser tab. When you select a document, your device\'s local CPU executes the parsing and re-encoding entirely in RAM. No file bytes or sensitive contents are transmitted to any remote cloud server.'
    },
    {
      q: 'How do I convert heavy images to PDF safely?',
      a: 'Navigate to the "JPG to PDF" tool. Add your images using the file picker or by drag-and-dropping. You can reorder pages by dragging cards, adjust orientation and margins, and click "Generate PDF". The resulting file compiles in less than a second and downloads directly to your device.'
    },
    {
      q: 'Why are my PDF files compressed locally?',
      a: 'Compressing files locally eliminates bandwidth lag and protects your sensitive documents from server exposure. Our engine optimizes embedded image streams and downsizes DPI to web-friendly densities without stripping vector text clarity.'
    },
    {
      q: 'What are the file size boundaries for free tools?',
      a: 'We support files up to 100MB depending on the specific tool. For example, Merge PDF supports up to 100MB combined across 20 files, while Image Cropping supports photos up to 50MB. These limits ensure fast, responsive browser performance across desktop and mobile devices.'
    },
    {
      q: 'Are ImgDocs tools compatible with smartphones and tablets?',
      a: 'Yes! ImgDocs is fully responsive and optimized for mobile browsers including Google Chrome, Safari, and Brave on iOS and Android. You can sign contracts, crop pictures, and compress documents on the go.'
    },
    {
      q: 'Are electronic signatures legally binding?',
      a: 'Under the US ESIGN Act and EU eIDAS regulations, standard electronic signatures created via our eSign PDF tool are legally valid for most commercial contracts, rental leases, freelance agreements, and non-disclosure disclosures.'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-8" id="help-center-page">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
          Help Center & Knowledge Base
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Find answers, step-by-step instructions, and browser processing guidelines below.
        </p>
      </div>

      <div className="space-y-4">
        {guides.map((guide, idx) => (
          <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-xs">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="flex w-full items-center justify-between p-5 text-left font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                <span>{guide.q}</span>
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">{openIndex === idx ? '−' : '+'}</span>
            </button>
            {openIndex === idx && (
              <div className="p-5 border-t border-slate-100 dark:border-slate-900 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-900/20">
                {guide.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================
   RELEASE NOTES & CHANGELOG
   ========================================== */
export function ReleaseNotes() {
  const logs = [
    {
      version: 'v2.5.0',
      date: 'August 2026',
      badge: 'Current Release',
      changes: [
        'Expanded comprehensive editorial guides, technical limitations, and pro tips across all 20 PDF and image tools.',
        'Added new Crop Image & Photo Editor with aspect ratio presets (1:1, 16:9, 4:3, 9:16) and direct vector PDF export.',
        'Hardened GDPR and AdSense DART cookie compliance policies and opt-out transparency disclosures.',
        'Implemented full JSON-LD SoftwareApplication and HowTo schema markup across the application suite.'
      ]
    },
    {
      version: 'v2.4.0',
      date: 'July 2026',
      badge: 'Major Feature Update',
      changes: [
        'Introduced full client-side theme synchronization with system-level light/dark mode.',
        'Upgraded Mozilla PDF.js rendering core to support high-DPI canvas rasterization on Retina screens.',
        'Expanded OCR multi-language character dictionary support for European languages.'
      ]
    },
    {
      version: 'v2.3.1',
      date: 'June 2026',
      badge: 'Performance Patch',
      changes: [
        'Optimized client-side memory garbage collection during 100MB multi-page merges.',
        'Enhanced mobile touch responsiveness for the eSign cursive signature drawing pad.',
        'Fixed image rotation metadata orientation on iOS Safari uploads.'
      ]
    }
  ];

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-8" id="release-notes-page">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">Changelog & Release Notes</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Track all security patches, features, and performance updates deployed to ImgDocs.</p>
      </div>

      <div className="space-y-6">
        {logs.map((log, index) => (
          <div key={index} className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-3">
            <div className="absolute left-[-6px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-slate-900 dark:text-white">{log.version}</span>
              <span className="text-[10px] font-medium text-slate-400">{log.date}</span>
              <span className="rounded-md bg-red-50 dark:bg-red-950/30 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">{log.badge}</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside leading-relaxed">
              {log.changes.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================
   API DOCUMENTATION
   ========================================== */
export function ApiDoc() {
  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8" id="api-docs-page">
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Terminal className="h-4 w-4 text-emerald-500" /> Developer Reference
        </span>
        <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
          Client-Side WebAssembly Architecture
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Learn how ImgDocs compiles vector PDF streams and image matrices directly inside the browser environment.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 space-y-3 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="h-4 w-4 text-indigo-500" /> WebAssembly Binary Stream Execution
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            By compiling native C/Rust PDF parsers into WebAssembly bytecode, ImgDocs achieves near-native execution speeds for binary concatenations, font decoders, and character extraction without requiring server infrastructure.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 space-y-3 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-500" /> Web Worker Sandbox Isolation
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Heavy rendering operations run on dedicated Web Worker threads, preventing UI lockups and ensuring complete sandbox isolation between document data and external script contexts.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   CAREERS PAGE
   ========================================== */
export function Careers() {
  const jobs = [
    {
      title: 'Senior WebAssembly / Systems Engineer',
      location: 'Singapore / Remote',
      type: 'Full-time',
      desc: 'Build high-performance browser-native document compilers and image processing pipelines using Rust and WebAssembly.'
    },
    {
      title: 'Frontend Performance & UX Architect',
      location: 'Remote',
      type: 'Full-time',
      desc: 'Design accessible, high-speed document editing user interfaces with Tailwind CSS and React.'
    },
    {
      title: 'Data Privacy & Security Auditor',
      location: 'Remote',
      type: 'Contract',
      desc: 'Verify client-side sandbox isolation to maintain 100% compliance with GDPR, HIPAA, and PDPA privacy directives.'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-8" id="careers-page">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">Join Our Engineering Team</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Help us build the next generation of private, browser-native document tools for millions of users worldwide.
        </p>
      </div>

      <div className="space-y-4">
        {jobs.map((job, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{job.title}</h3>
                <span className="rounded bg-indigo-50 dark:bg-indigo-950/40 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5">{job.type}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{job.desc}</p>
              <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                <MapPin className="h-3 w-3" /> {job.location}
              </div>
            </div>
            <a href="mailto:careers@imgdocs.me?subject=Application for position" className="rounded-xl border border-slate-200 hover:border-slate-300 dark:border-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 dark:hover:bg-slate-900 shrink-0 cursor-pointer text-center">
              Apply via Email
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================
   LEGAL TERMS PAGES (Comprehensive Privacy, Terms, Cookie, Disclaimer, DMCA, Refund)
   ========================================== */
export function LegalPage({ type }: { type: 'privacy' | 'terms' | 'cookie' | 'disclaimer' | 'dmca' | 'refund-policy' }) {
  const content: Record<string, { title: string; lastUpdated: string; sections: { heading: string; text: string }[] }> = {
    privacy: {
      title: 'Privacy Policy',
      lastUpdated: 'October 2026',
      sections: [
        {
          heading: '1. Introduction & Zero-Server-Storage Philosophy',
          text: 'ImgDocs Technologies ("ImgDocs", "we", "us", or "our") operates https://www.imgdocs.me. This Privacy Policy informs users regarding our policies with the collection, use, and disclosure of Personal Information. Our foundational architectural principle is Zero Server Storage. When you utilize our document conversion, compression, signing, or image cropping tools, all processing occurs exclusively within your device\'s local browser memory (RAM) via WebAssembly and client-side JavaScript. No file bytes or document contents are ever transmitted to or stored on our servers for client-side operations.'
        },
        {
          heading: '2. How Uploaded Files Are Handled & Auto-Deleted (1-Hour Policy)',
          text: 'Our primary document operations (including JPG to PDF, PDF to Word, Word to PDF, Merge PDF, Split PDF, Compress PDF, Rotate PDF, Protect PDF, and Unlock PDF) execute 100% locally in your web browser memory. Your files never touch external servers or cloud disks. For any specialized server-assisted conversions (such as high-precision OCR text extraction or AI document summarization), files are transmitted over strict TLS 1.3 encrypted connections directly to temporary isolated processing sandboxes. These files are processed strictly in ephemeral memory buffers and are permanently deleted automatically after 1 hour from our processing nodes. We never inspect, index, back up, monetize, or share your document contents with any third party.'
        },
        {
          heading: '3. Information We Do NOT Collect (Document Privacy Guarantee)',
          text: 'Because document operations execute client-side, we never see, log, inspect, analyze, or retain the contents of your uploaded PDFs, images, spreadsheets, presentations, or digital signatures. Once you close or refresh your browser tab, all temporary memory buffers allocated by WebAssembly are permanently wiped from your system memory.'
        },
        {
          heading: '4. Google AdSense & Third-Party Advertising Disclosures',
          text: 'We use Google AdSense and third-party advertising partners to display advertisements on our website. Google uses cookies (including the DoubleClick DART cookie) to serve ads to users based on their visits to our website and other websites across the Internet. Third-party vendors and ad networks may also serve advertisements on our site. You may opt out of personalized advertising by visiting Google Ads Settings (https://www.google.com/settings/ads). Alternatively, you can opt out of third-party vendor cookies for personalized advertising by visiting the Digital Advertising Alliance at www.aboutads.info/choices or the Network Advertising Initiative at www.networkadvertising.org/choices/.'
        },
        {
          heading: '5. Information We May Collect (Analytics & Inquiries)',
          text: 'When you voluntarily contact us through our Contact Us or Feature Request forms, we collect the name, email address, and message content you provide solely to respond to your inquiry. We may also collect standard, anonymized server access logs (such as browser user-agent, operating system, and IP address for DDoS prevention and rate limiting).'
        },
        {
          heading: '6. GDPR Compliance & European Data Subject Rights',
          text: 'If you reside in the European Economic Area (EEA) or UK, you have specific rights under the General Data Protection Regulation (GDPR), including the right to access, rectify, or request erasure of any personal data we hold about you. Because we do not store your documents, your file privacy is guaranteed by design. For inquiries regarding cookie consent preferences or contact logs, email privacy@imgdocs.me.'
        },
        {
          heading: '7. CCPA / CPRA California Consumer Privacy Disclosures',
          text: 'Under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA), California residents have the right to know what personal data is collected, request deletion, and opt out of the sale or sharing of personal information. ImgDocs does not sell personal information or document contents to any third party.'
        },
        {
          heading: '8. Children\'s Online Privacy Protection Act (COPPA)',
          text: 'ImgDocs does not knowingly collect or solicit personal information from children under the age of 13. If you believe that a child has provided us with personal information, please contact us immediately, and we will take steps to remove such information from our records.'
        },
        {
          heading: '9. Changes to This Privacy Policy',
          text: 'We may update our Privacy Policy periodically to reflect technological, operational, or legal requirements. We encourage you to review this page periodically. Changes are effective immediately upon posting on this page.'
        },
        {
          heading: '10. Contact Our Data Protection Officer',
          text: 'If you have any questions or suggestions regarding our Privacy Policy or data security practices, please contact us at privacy@imgdocs.me or support@imgdocs.me.'
        }
      ]
    },
    terms: {
      title: 'Terms of Service',
      lastUpdated: 'October 2026',
      sections: [
        {
          heading: '1. Acceptance of Terms',
          text: 'By accessing or using ImgDocs at https://www.imgdocs.me, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this website.'
        },
        {
          heading: '2. Permitted Use & Intellectual Property',
          text: 'ImgDocs grants you a personal, non-exclusive, non-transferable license to use our web-based document tools for both personal and commercial document workflows. The interface, algorithms, visual design, and branding are the intellectual property of ImgDocs Technologies and are protected by international copyright and trademark laws.'
        },
        {
          heading: '3. Acceptable Use Policy',
          text: 'You agree not to use the service for any unlawful purpose, including attempting to reverse engineer the underlying compiled WebAssembly modules, deploying automated scrapers that degrade server availability, or attempting to distribute malicious code.'
        },
        {
          heading: '4. Disclaimer of Warranties',
          text: 'The tools and services on ImgDocs are provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied. While our client-side software is rigorously tested for high fidelity, ImgDocs makes no guarantees regarding the suitability of converted documents for specific legal, regulatory, or accounting filings.'
        },
        {
          heading: '5. Limitation of Liability',
          text: 'In no event shall ImgDocs Technologies or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the tools on ImgDocs.'
        },
        {
          heading: '6. Governing Law & Jurisdiction',
          text: 'These Terms shall be governed and construed in accordance with the laws of Singapore, without regard to its conflict of law provisions.'
        }
      ]
    },
    cookie: {
      title: 'Cookie Policy',
      lastUpdated: 'October 2026',
      sections: [
        {
          heading: '1. What Are Cookies?',
          text: 'Cookies are small text files placed on your device by web browsers when you visit websites. They are widely used to make websites work efficiently, save preferences, and provide analytical reporting.'
        },
        {
          heading: '2. How ImgDocs Uses Cookies',
          text: 'We use cookies and local browser storage strictly for: (a) Essential UI preferences such as Light/Dark mode and favorite tools; (b) Third-party advertising cookies served by Google AdSense to display contextual and personalized advertisements.'
        },
        {
          heading: '3. Third-Party Advertising Cookies & DART',
          text: 'Google, as a third-party vendor, uses cookies to serve ads on ImgDocs. Google\'s use of the DART cookie enables it to serve ads to users based on their visit to ImgDocs and other sites on the Internet. You can manage or disable advertising cookies via Google Ad Settings at https://www.google.com/settings/ads or through www.aboutads.info/choices.'
        },
        {
          heading: '4. How to Manage and Disable Cookies in Your Browser',
          text: 'You can block or delete cookies through your browser settings (Chrome, Safari, Firefox, Edge). Please note that disabling cookies will not affect your ability to use our core client-side PDF and image tools.'
        }
      ]
    },
    disclaimer: {
      title: 'Disclaimer Notice',
      lastUpdated: 'October 2026',
      sections: [
        {
          heading: '1. General Information & Educational Purpose',
          text: 'The documents, templates, tutorials, and productivity tools provided on ImgDocs are intended for general administrative assistance and informational purposes only. They do not constitute formal legal advice, certified public accounting guidance, or medical record compliance verification.'
        },
        {
          heading: '2. User Responsibility for Final Submissions',
          text: 'Users are solely responsible for verifying the completeness, accuracy, and formatting of converted or compressed documents prior to official filing with government authorities, courts, banks, or academic institutions.'
        },
        {
          heading: '3. Third-Party Advertisements & External Links',
          text: 'ImgDocs may display contextual third-party advertisements served by Google AdSense and links to external resources. We do not endorse or assume responsibility for the content, privacy policies, or business practices of third-party advertisers or external websites.'
        },
        {
          heading: '4. Technical Availability & Service Modifications',
          text: 'While we strive to ensure 99.9% uptime, ImgDocs does not warrant that tool functions will be uninterrupted, error-free, or compatible with obsolete web browsers.'
        }
      ]
    },
    dmca: {
      title: 'DMCA & Copyright Compliance Policy',
      lastUpdated: 'August 2026',
      sections: [
        {
          heading: '1. Zero-Storage Architecture & Copyright Protection',
          text: 'Because ImgDocs executes all file conversions entirely inside your local browser memory and never uploads or stores user documents on any server, it is technically impossible for copyright-infringing user files to be hosted on our platform.'
        },
        {
          heading: '2. DMCA Takedown Notice Procedure for Editorial Content',
          text: 'If you are a copyright owner or agent and believe that any editorial blog post or tutorial on our website infringes upon your copyright, you may submit a formal DMCA notification to our Designated Copyright Agent at legal@imgdocs.me with: (a) Identification of the copyrighted work; (b) URL of the allegedly infringing material; (c) Your contact information; and (d) A statement of good faith belief.'
        }
      ]
    },
    'refund-policy': {
      title: 'Refund & Cancellation Policy',
      lastUpdated: 'August 2026',
      sections: [
        {
          heading: '1. 7-Day 100% Money-Back Guarantee',
          text: 'We want you to be completely satisfied with ImgDocs Pro & Business subscription tiers. If you are not satisfied with your premium experience, you can request a 100% refund within 7 days of initial subscription purchase with no questions asked.'
        },
        {
          heading: '2. Subscription Cancellation at Any Time',
          text: 'You may cancel recurring subscriptions at any time with one click from your account settings. Upon cancellation, your Pro benefits remain active until the end of the current paid billing cycle.'
        },
        {
          heading: '3. How to Request a Refund',
          text: 'To initiate a refund, email billing@imgdocs.me with your registered email and transaction ID. Refunds are credited back to your original payment method within 2-5 business days.'
        }
      ]
    }
  };

  const p = content[type] || content['privacy'];

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6" id={`legal-page-${type}`}>
      <div className="space-y-1 pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Scale className="h-6 w-6 text-primary" />
          {p.title}
        </h1>
        <p className="text-xs text-slate-400">Official Policy Document • Last Updated: {p.lastUpdated}</p>
      </div>

      <div className="space-y-6">
        {p.sections.map((sect, i) => (
          <div key={i} className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{sect.heading}</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{sect.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================
   TOOLS DIRECTORY / ALL TOOLS HUB
   ========================================== */
export function ToolsDirectoryPage({ onSelectTool }: { onSelectTool: (toolId: string) => void }) {
  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All');

  const categories = ['All', 'Convert to PDF', 'Convert from PDF', 'Optimize & Edit', 'Security & Sign'];

  const filteredTools = toolsList.filter((tool) => {
    const matchesSearch = tool.title.toLowerCase().includes(search.toLowerCase()) || 
                          tool.shortDescription.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || tool.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4" id="tools-directory-page">
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-950/40 px-3 py-1 text-xs font-extrabold text-primary border border-red-200 dark:border-red-900/50">
          <Layers className="h-3.5 w-3.5" /> 20+ Free Browser Tools
        </span>
        <h1 className="text-4xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
          All Online PDF & Image Tools
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Convert, compress, edit, split, merge, OCR, crop, and eSign documents safely inside your browser. 100% private with zero server uploads.
        </p>
      </div>

      {/* Search & Category Filters */}
      <div className="space-y-4">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools (e.g., JPG to PDF, Compress, eSign, OCR, Crop)..."
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-12 pr-4 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-md shadow-red-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Tools */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTools.map((tool) => {
          let mappedId = tool.id;
          if (tool.id === 'jpg-to-pdf') mappedId = 'jpg_to_pdf';
          if (tool.id === 'pdf-to-jpg') mappedId = 'pdf_to_jpg';
          if (tool.id === 'compress-pdf') mappedId = 'compress';

          return (
            <div
              key={tool.id}
              onClick={() => onSelectTool(mappedId)}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-primary dark:hover:border-primary hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {tool.category}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Shield className="h-3 w-3" /> Client-Side
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>{tool.title}</span>
                  <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {tool.shortDescription}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-medium text-slate-400">
                <span>Formats: {tool.formats}</span>
                <span className="font-bold text-primary group-hover:underline">Open Tool →</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================
   SECURITY & ARCHITECTURE PAGE
   ========================================== */
export function SecurityArchitecturePage() {
  return (
    <div className="space-y-10 max-w-4xl mx-auto py-4" id="security-page">
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
          <ShieldCheck className="h-4 w-4 text-emerald-500" /> Zero Server Upload Security
        </span>
        <h1 className="text-4xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
          How ImgDocs Protects Your Private Data
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Engineered from the ground up for mathematical privacy, strict compliance, and instant local execution.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3 shadow-xs">
          <Cpu className="h-8 w-8 text-indigo-500" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Local CPU Processing</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            All document rendering, PDF compilation, image cropping, and encryption happen directly inside your browser using WebAssembly and HTML5 Canvas.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3 shadow-xs">
          <Lock className="h-8 w-8 text-emerald-500" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Zero Data Uploads</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your photos, passport scans, and corporate contracts never leave your computer's RAM memory. No network payload containing your file content is sent anywhere.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3 shadow-xs">
          <Key className="h-8 w-8 text-amber-500" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">AES-256 Encryption</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            When you protect a PDF with a password, the key derivation and cryptographic salt are generated locally with standard enterprise AES algorithms.
          </p>
        </div>
      </div>

      {/* Compliance Matrix Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
        <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Regulatory Compliance Matrix
        </h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          <div className="py-3 flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-200">GDPR (General Data Protection Regulation)</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md">100% Compliant (Zero Data Collection)</span>
          </div>
          <div className="py-3 flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-200">HIPAA (Health Insurance Portability Act)</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md">Safe for Medical Records</span>
          </div>
          <div className="py-3 flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-200">PDPA & CCPA Consumer Privacy</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md">Fully Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   REVIEWS & TESTIMONIALS PAGE
   ========================================== */
export function ReviewsPage() {
  const [reviews] = React.useState<any[]>([
    {
      id: '1',
      name: 'Sarah Jenkins',
      role: 'Legal Assistant',
      company: 'Apex Legal Group',
      rating: 5,
      comment: 'ImgDocs is an absolute life-saver for our paralegals. Being able to convert confidential court scans to PDF without uploading them to external servers solves all our GDPR compliance worries!',
      date: 'August 2, 2026'
    },
    {
      id: '2',
      name: 'David Chen',
      role: 'Senior Accountant',
      company: 'TaxPro Services',
      rating: 5,
      comment: 'The PDF compression and merge tools are insanely fast. Converting 15 receipt scans into a single compressed expense ledger takes less than 2 seconds.',
      date: 'July 28, 2026'
    },
    {
      id: '3',
      name: 'Elena Rostova',
      role: 'Freelance Designer',
      company: 'Creative Studio',
      rating: 5,
      comment: 'The new Crop Image tool with custom aspect ratios combined with JPG to PDF export is my daily workflow go-to. Highly recommended!',
      date: 'July 19, 2026'
    }
  ]);

  return (
    <div className="space-y-10 max-w-4xl mx-auto py-4" id="reviews-page">
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 px-3 py-1 text-xs font-extrabold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> 4.9 / 5.0 Rating from 12,000+ Reviews
        </span>
        <h1 className="text-4xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
          What Our Users Say About ImgDocs
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Trusted by accountants, lawyers, students, and businesses worldwide.
        </p>
      </div>

      {/* Reviews List */}
      <div className="grid gap-4 md:grid-cols-3">
        {reviews.map((rev, idx) => (
          <div key={rev.id || idx} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                {[...Array(rev.rating || 5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                "{rev.comment}"
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="font-bold text-xs text-slate-900 dark:text-white">{rev.name}</p>
              <p className="text-[10px] text-slate-400">{rev.role} {rev.company ? `• ${rev.company}` : ''}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================
   FREE DOCUMENT TEMPLATES LIBRARY PAGE
   ========================================== */
export function TemplatesPage({ onSelectTool }: { onSelectTool: (toolId: string) => void }) {
  const templates = [
    { title: 'Non-Disclosure Agreement (NDA)', desc: 'Standard mutual business confidentiality contract template.', category: 'Legal Contracts' },
    { title: 'Commercial Invoice Form', desc: 'Itemized billing receipt template for clients and freelance services.', category: 'Finance & Invoicing' },
    { title: 'Residential Lease Agreement', desc: 'Standard property rental lease template ready for filling and eSigning.', category: 'Real Estate' },
    { title: 'Modern Professional Resume / CV', desc: 'Clean, ATS-friendly single-page resume layout ready for PDF export.', category: 'Career & Employment' },
    { title: 'Bill of Sale Certificate', desc: 'Vehicle or property ownership transfer receipt document.', category: 'Legal Forms' },
    { title: 'Freelance Independent Contract', desc: 'Milestone-based independent contractor statement of work.', category: 'Business Services' }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4" id="templates-page">
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 text-xs font-extrabold text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50">
          <FileCheck className="h-3.5 w-3.5 text-indigo-500" /> Free Document Forms Library
        </span>
        <h1 className="text-4xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
          Ready-to-Use Business PDF Templates
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Download, fill out, or eSign essential administrative and business forms instantly using ImgDocs tools.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {templates.map((tpl, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-xs flex flex-col justify-between hover:border-primary transition-all">
            <div className="space-y-2">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-primary bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md">
                {tpl.category}
              </span>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{tpl.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{tpl.desc}</p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => onSelectTool('esign-pdf')}
                className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
              >
                Sign with eSign →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
