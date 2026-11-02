/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { toolsList } from '../data/toolsData';
import { 
  ChevronRight, CheckCircle2, HelpCircle, 
  ChevronDown, ArrowRight, ShieldCheck, FileText,
  Lightbulb, Briefcase, AlertCircle, Info, Sparkles
} from 'lucide-react';
import SocialShare from './SocialShare';

interface ToolSEOContentProps {
  toolId: string;
  onNavigateTool: (id: string) => void;
}

const toolHeaderSEO: Record<string, { howTo: string; benefits: string; about: string; useCases: string; proTips: string }> = {
  'jpg-to-pdf': {
    howTo: 'How to Convert JPG to PDF Online Instantly - 100% Secure & Free',
    benefits: 'Why Choose ImgDocs Secure Client-Side Image to PDF Converter',
    about: 'About JPG to PDF Converter: Professional Local Document Assembly Without Server Uploads',
    useCases: 'Real-World Use Cases for JPG to PDF Conversion',
    proTips: 'Pro Tips & Best Practices for Image Compilation'
  },
  'pdf-to-jpg': {
    howTo: 'How to Convert PDF to JPG Instantly - High-Resolution Browser Rasterizer',
    benefits: 'Why Choose ImgDocs Safe Offline PDF to JPG Page Extractor',
    about: 'About PDF to JPG Extractor: Decompile PDF Documents to High-Quality Image Formats Locally',
    useCases: 'Common Applications & Extraction Scenarios',
    proTips: 'Pro Tips for Crisp Image Extraction'
  },
  'compress-pdf': {
    howTo: 'How to Compress PDF and Image File Sizes Without Quality Loss',
    benefits: 'Why Choose ImgDocs Secure Document and Image Compressor',
    about: 'About PDF Compressor: Dynamic Bitrate Optimization for Clean and Lightweight Files',
    useCases: 'When & Where to Use Document Compression',
    proTips: 'Pro Tips for Optimal Byte Reduction'
  },
  'pdf-to-word': {
    howTo: 'How to Convert PDF to Editable Word DOCX Online',
    benefits: 'Why Choose ImgDocs Client-Side PDF to Word Converter',
    about: 'About PDF to Word Converter: Smart Layout Mapping and Table Reconstruction',
    useCases: 'When to Convert PDF to DOCX',
    proTips: 'Pro Tips for Perfect Word Formatting'
  },
  'word-to-pdf': {
    howTo: 'How to Convert Microsoft Word DOCX to Secure PDF',
    benefits: 'Why Choose ImgDocs Local Word to PDF Compilation Suite',
    about: 'About Word to PDF Converter: Preserving Document Formats, Fonts, and Layout Borders',
    useCases: 'Professional Use Cases for Word to PDF Conversion',
    proTips: 'Pro Tips for Flawless PDF Export'
  },
  'merge-pdf': {
    howTo: 'How to Merge Multiple PDF Files Into One Organized Document',
    benefits: 'Why Choose ImgDocs Drag-and-Drop Local PDF Merger',
    about: 'About Merge PDF: Combine, Order, and Interweave PDF Sheets Instantly',
    useCases: 'Everyday Scenarios for Merging PDF Files',
    proTips: 'Pro Tips for Clean Document Stacking'
  },
  'split-pdf': {
    howTo: 'How to Split PDF Pages or Extract Custom Page Ranges',
    benefits: 'Why Choose ImgDocs Dynamic Offline PDF Splitter',
    about: 'About Split PDF: Deconstruct Multi-Page PDF Documents into Separate Files Safely',
    useCases: 'When to Split Large PDF Files',
    proTips: 'Pro Tips for Selective Page Extraction'
  },
  'protect-pdf': {
    howTo: 'How to Protect PDF With Password Using AES-256 Encryption',
    benefits: 'Why Choose ImgDocs Client-Side Document Security Wrapper',
    about: 'About Protect PDF: Secure Legal Files and Financial Records From Unauthorized Copying',
    useCases: 'When to Password-Protect Documents',
    proTips: 'Pro Tips for Bulletproof PDF Encryption'
  },
  'unlock-pdf': {
    howTo: 'How to Unlock PDF and Remove Password Protections Permanently',
    benefits: 'Why Choose ImgDocs Local PDF Decrypter & Owner Permission Restorer',
    about: 'About Unlock PDF: Securely Remove Restrictions to Enable Easy Printing and Content Copying',
    useCases: 'Authorized Scenarios for PDF Decryption',
    proTips: 'Pro Tips for Password Management'
  },
  'rotate-pdf': {
    howTo: 'How to Rotate PDF Pages Permanently Online',
    benefits: 'Why Choose ImgDocs Clockwise and Counter-Clockwise Page Aligner',
    about: 'About Rotate PDF: Fix Misaligned Scans and Sideways Documents Locally',
    useCases: 'When to Rotate PDF Pages',
    proTips: 'Pro Tips for Aligning Scanned Sheets'
  },
  'organize-pdf': {
    howTo: 'How to Organize, Shuffle, and Rearrange PDF Pages Visually',
    benefits: 'Why Choose ImgDocs Draggable PDF Storyboard Editor',
    about: 'About Organize PDF: Delete Unwanted Sheets and Shuffle Chapters Instantly',
    useCases: 'Key Applications for Document Organization',
    proTips: 'Pro Tips for Storyboard Arranging'
  },
  'add-watermark': {
    howTo: 'How to Add Transparent Text or Image Watermark to PDF',
    benefits: 'Why Choose ImgDocs Anti-Plagiarism PDF Branding Stamper',
    about: 'About Add Watermark to PDF: Secure Your Intellectual Property and Layout Drafts',
    useCases: 'When to Watermark Your Documents',
    proTips: 'Pro Tips for Watermark Visibility & Placement'
  },
  'remove-pages': {
    howTo: 'How to Remove and Delete Unwanted Pages from PDF',
    benefits: 'Why Choose ImgDocs High-Speed Local PDF Page Pruning Tool',
    about: 'About Remove Pages from PDF: Shrink File Sizes by Discarding Extra Sheets Safely',
    useCases: 'Common Situations for Page Removal',
    proTips: 'Pro Tips for Clean File Pruning'
  },
  'ocr-pdf': {
    howTo: 'How to Extract Text from Scanned PDF or Image Using Offline OCR',
    benefits: 'Why Choose ImgDocs Secure Browser-Native Optical Character Recognition',
    about: 'About OCR PDF Text Extractor: Optical Character Scanning to Turn Paper into Editable Files',
    useCases: 'Where Optical Character Recognition Excels',
    proTips: 'Pro Tips for High-Accuracy Character Extraction'
  },
  'html-to-pdf': {
    howTo: 'How to Convert HTML Snippets or URLs into PDF Documents',
    benefits: 'Why Choose ImgDocs Safe Webpage Archival Tool',
    about: 'About HTML to PDF: Transform Web Layouts, Styles, and Code Pages to Vector PDF Format',
    useCases: 'When to Convert Webpages and Code to PDF',
    proTips: 'Pro Tips for Perfect Web Page Printing'
  },
  'excel-to-pdf': {
    howTo: 'How to Convert Excel Spreadsheets XLSX to PDF Sheets',
    benefits: 'Why Choose ImgDocs Local Excel to PDF Converter',
    about: 'About Excel to PDF: Fit Wide Spreadsheet Grids and Lock Formulas Safely',
    useCases: 'When to Convert Spreadsheets to PDF',
    proTips: 'Pro Tips for Fitting Tables onto Pages'
  },
  'powerpoint-to-pdf': {
    howTo: 'How to Convert PowerPoint Slides PPTX to PDF Presentation',
    benefits: 'Why Choose ImgDocs Local Slide Deck to PDF Converter',
    about: 'About PowerPoint to PDF: Maintain exact layout and vector graphics of slide decks',
    useCases: 'When to Convert Slide Decks to PDF',
    proTips: 'Pro Tips for High-Impact Presentations'
  },
  'esign-pdf': {
    howTo: 'How to eSign PDF and Stamp Digital Signatures to Contracts',
    benefits: 'Why Choose ImgDocs Interactive Cursive Signature Pad',
    about: 'About eSign PDF: Paperless PDF Signature Management Flattened Locally',
    useCases: 'Everyday Scenarios for Digital Signatures',
    proTips: 'Pro Tips for Clean Electronic Signatures'
  },
  'crop-image': {
    howTo: 'How to Crop Photos & Images Online with Preset Aspect Ratios',
    benefits: 'Why Choose ImgDocs Offline-First Browser Photo Editor',
    about: 'About Crop Image: Frame Avatars, Banners, and Social Media Graphics Instantly',
    useCases: 'Where & When to Use Image Cropping',
    proTips: 'Pro Tips for Precise Image Framing'
  }
};

export default function ToolSEOContent({ toolId, onNavigateTool }: ToolSEOContentProps) {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // Normalize kebab/snake casing to find the tool
  const normalizedId = toolId.replace('_', '-');
  const tool = toolsList.find(t => t.id === toolId || t.id === normalizedId);

  // Inject relevant Schema Markup (JSON-LD) dynamically in ToolSEOContent
  useEffect(() => {
    if (!tool) return;

    const siteUrl = 'https://www.imgdocs.me';
    const canonical = `${siteUrl}/${tool.id}`;

    // 1. SoftwareApplication Schema
    const softwareSchema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': tool.title,
      'applicationCategory': 'BusinessApplication',
      'operatingSystem': 'Web, Windows, macOS, Android, iOS',
      'description': tool.shortDescription,
      'browserRequirements': 'Requires HTML5, WebAssembly and modern browser support.',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      }
    };

    // 2. HowTo Schema
    const howToSchema = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      'name': `How to use ${tool.title} | ImgDocs Step-by-Step Guide`,
      'description': `Follow our easy, 100% secure client-side guide to run ${tool.title.toLowerCase()} inside your web browser. No uploads required.`,
      'step': tool.stepByStep.map((step, idx) => ({
        '@type': 'HowToStep',
        'position': idx + 1,
        'url': `${canonical}#step-${idx + 1}`,
        'name': `Step ${idx + 1}: Process`,
        'text': step
      }))
    };

    // 3. FAQ Schema
    const faqSchema = tool.faqs && tool.faqs.length > 0 ? {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': tool.faqs.map(faq => ({
        '@type': 'Question',
        'name': faq.q,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.a
        }
      }))
    } : null;

    // Append to document head
    const schemas: any[] = [softwareSchema, howToSchema];
    if (faqSchema) {
      schemas.push(faqSchema);
    }

    const scriptIdPrefix = `tool-seo-schema-${tool.id}`;
    
    // Remove old ones first to prevent duplicates
    const existing = document.querySelectorAll(`script[id^="${scriptIdPrefix}"]`);
    existing.forEach(el => el.remove());

    schemas.forEach((schema, idx) => {
      const script = document.createElement('script');
      script.id = `${scriptIdPrefix}-${idx}`;
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      const cleanup = document.querySelectorAll(`script[id^="${scriptIdPrefix}"]`);
      cleanup.forEach(el => el.remove());
    };
  }, [tool]);

  if (!tool) return null;

  // Find 3 related tools in the same category or overall
  const relatedTools = toolsList
    .filter(t => t.id !== tool.id && (t.category === tool.category || t.category === 'Optimize & Edit'))
    .slice(0, 3);

  const toggleFaq = (idx: number) => {
    setFaqOpen(faqOpen === idx ? null : idx);
  };

  const seoHeaders = toolHeaderSEO[tool.id] || {
    howTo: `How to use ${tool.title}`,
    benefits: 'Key Benefits & Privacy Features',
    about: `About ${tool.title}`,
    useCases: 'Practical Use Cases & When to Use',
    proTips: 'Pro Tips & Best Practices'
  };

  return (
    <div className="mx-auto max-w-4xl space-y-12 pt-12 border-t border-slate-200 dark:border-slate-800" id="tool-seo-container">
      
      {/* 1. Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider" aria-label="Breadcrumb" id="tool-breadcrumb">
        <button 
          onClick={() => onNavigateTool('home')}
          className="hover:text-primary transition-colors cursor-pointer"
        >
          Home
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-500">{tool.category}</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-800 dark:text-white font-black">{tool.title}</span>
      </nav>

      {/* 2. When to Use & Overview Notice */}
      {tool.whenToUse && (
        <section className="p-6 rounded-2xl border border-primary/20 bg-primary-light/30 dark:bg-primary-light/10 space-y-2" id="tool-when-to-use">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Info className="h-4 w-4 shrink-0" />
            <span>When & Why to Use This Tool</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {tool.whenToUse}
          </p>
        </section>
      )}

      {/* 3. Step-by-Step Guide Section */}
      <section className="space-y-6" id="tool-steps-section">
        <div className="border-l-4 border-primary pl-4">
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {seoHeaders.howTo}
          </h2>
          <p className="text-xs text-slate-500 mt-1">Get instant results in simple, easy steps.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {tool.stepByStep.map((step, idx) => (
            <div 
              key={idx} 
              className="relative p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-light text-primary font-mono text-xs font-bold mb-3">
                  0{idx + 1}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                  {step}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Practical Real-World Use Cases */}
      {tool.useCases && tool.useCases.length > 0 && (
        <section className="space-y-6" id="tool-use-cases-section">
          <div className="border-l-4 border-primary pl-4">
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {seoHeaders.useCases || 'Real-World Use Cases'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">Discover how students, lawyers, accountants, and freelancers streamline their workflows.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tool.useCases.map((useCase, idx) => {
              const [title, details] = useCase.includes(': ') ? useCase.split(': ') : [`Application ${idx + 1}`, useCase];
              return (
                <div 
                  key={idx}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary shrink-0" />
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                      {title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {details}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. Benefits Grid */}
      <section className="space-y-6" id="tool-benefits-section">
        <div className="border-l-4 border-primary pl-4">
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {seoHeaders.benefits}
          </h2>
          <p className="text-xs text-slate-500 mt-1">Why professional teams choose our offline-first browser editor.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {tool.benefits.map((benefit, idx) => {
            const [headline, detail] = benefit.includes(': ') ? benefit.split(': ') : [benefit, ''];
            return (
              <div 
                key={idx}
                className="flex items-start gap-3.5 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                    {headline}
                  </h4>
                  {detail && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Pro Tips & Best Practices */}
      {tool.proTips && tool.proTips.length > 0 && (
        <section className="space-y-6" id="tool-protips-section">
          <div className="border-l-4 border-amber-500 pl-4">
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {seoHeaders.proTips || 'Pro Tips & Best Practices'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">Expert recommendations to get the best visual fidelity and smallest file sizes.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {tool.proTips.map((tip, idx) => (
              <div 
                key={idx} 
                className="flex items-start gap-3 p-4 rounded-xl border border-amber-200/50 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/20 text-xs text-slate-700 dark:text-slate-300"
              >
                <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{tip}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Limitations & Technical Boundaries */}
      {tool.limitations && tool.limitations.length > 0 && (
        <section className="space-y-4" id="tool-limitations-section">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <AlertCircle className="h-4 w-4 text-slate-400" />
            <span>Technical Guidelines & Boundaries</span>
          </div>
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 space-y-2">
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 list-disc pl-4 leading-relaxed">
              {tool.limitations.map((limitation, idx) => (
                <li key={idx}>
                  <strong className="text-slate-700 dark:text-slate-300 font-semibold">{limitation}</strong>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 8. Deep Editorial / In-Depth Technical Guide */}
      <section className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-6" id="tool-editorial-content">
        <div className="border-l-4 border-primary pl-4 mb-4">
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight m-0">
            {seoHeaders.about}
          </h2>
          <p className="text-xs text-slate-500 mt-1">Deep analysis, technical specs, and enterprise data protection compliance guides.</p>
        </div>

        <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
          {tool.description.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={index} className="text-base sm:text-lg font-black font-display text-slate-800 dark:text-white tracking-tight pt-3">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('- ')) {
              return (
                <ul key={index} className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {paragraph.split('\n').map((li, liIdx) => (
                    <li key={liIdx} className="leading-relaxed">
                      {li.replace('- ', '')}
                    </li>
                  ))}
                </ul>
              );
            }
            if (paragraph.match(/^\d\.\s/)) {
              return (
                <div key={index} className="space-y-1.5 pl-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  {paragraph.split('\n').map((ol, olIdx) => (
                    <p key={olIdx} className="leading-relaxed">
                      {ol}
                    </p>
                  ))}
                </div>
              );
            }
            return (
              <p key={index} className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {paragraph}
              </p>
            );
          })}
        </div>
      </section>

      {/* 9. Tool Specific FAQs */}
      <section className="space-y-6" id="tool-faq-section">
        <div className="border-l-4 border-primary pl-4">
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500 mt-1">Get answers regarding secure browser processing parameters.</p>
        </div>

        <div className="space-y-3">
          {tool.faqs.map((faq, idx) => {
            const isOpen = faqOpen === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-4.5 text-left font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="h-4.5 w-4.5 text-primary shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-900/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. Related Tools / Internal Link Matrix */}
      <section className="space-y-6" id="tool-related-section">
        <div className="border-l-4 border-primary pl-4">
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Related Document Utilities
          </h2>
          <p className="text-xs text-slate-500 mt-1">Continue workflow operations securely inside your browser session.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {relatedTools.map((rel) => (
            <div 
              key={rel.id}
              onClick={() => {
                let targetId = rel.id;
                if (rel.id === 'jpg-to-pdf') targetId = 'jpg_to_pdf';
                if (rel.id === 'pdf-to-jpg') targetId = 'pdf_to_jpg';
                if (rel.id === 'compress-pdf') targetId = 'compress';
                onNavigateTool(targetId);
              }}
              className="group flex flex-col justify-between p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer"
            >
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide group-hover:text-primary transition-colors">
                  {rel.title}
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                  {rel.shortDescription}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-900/50 flex items-center justify-between text-[10px] font-bold text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200">
                <span>Launch Tool</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 11. Social Sharing Section */}
      <SocialShare toolTitle={tool?.title} toolDescription={tool?.shortDescription} />

    </div>
  );
}
