/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { toolsList, ToolItem } from '../data/toolsData';
import { blogPosts, BlogPost } from '../data/blogData';
import { resolveRoute, SITE_URL, TOOL_PATH_MAP, BLOG_SLUG_ALIASES } from './routes';

export interface SsrResult {
  type: 'html' | 'redirect';
  status: number;
  url?: string;
  html?: string;
}

// Convert markdown to clean semantic HTML string
function markdownToHtml(md: string): string {
  if (!md) return '';
  const lines = md.split('\n');
  const out: string[] = [];
  let inList = false;

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      continue;
    }

    if (trimmed.startsWith('### ')) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<h3>${escapeHtml(trimmed.slice(4))}</h3>`);
    } else if (trimmed.startsWith('## ')) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<h2>${escapeHtml(trimmed.slice(3))}</h2>`);
    } else if (trimmed.startsWith('# ')) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<h2>${escapeHtml(trimmed.slice(2))}</h2>`);
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        out.push('<ul>');
        inList = true;
      }
      out.push(`<li>${formatInline(trimmed.slice(2))}</li>`);
    } else if (/^\d+\.\s/.test(trimmed)) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<li>${formatInline(trimmed.replace(/^\d+\.\s/, ''))}</li>`);
    } else {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<p>${formatInline(trimmed)}</p>`);
    }
  }

  if (inList) {
    out.push('</ul>');
  }

  return out.join('\n');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatInline(text: string): string {
  let res = escapeHtml(text);
  // Bold
  res = res.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic
  res = res.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Inline code
  res = res.replace(/`(.*?)`/g, '<code>$1</code>');
  return res;
}

// Tool SEO mapping (<60 char titles, <160 char descriptions, target keywords)
const toolMetaOverrides: Record<string, { title: string; description: string; keywords: string }> = {
  'pdf-to-word': {
    title: 'Free PDF to Word Converter Online | ImgDocs',
    description: 'Convert PDF files to editable DOCX Word documents without losing formatting. 100% private in-browser conversion, no file size limit.',
    keywords: 'pdf to word converter free, convert pdf to word, pdf to docx, editable word document, pdf converter'
  },
  'word-to-pdf': {
    title: 'Word to PDF Converter: Convert DOCX to PDF Free | ImgDocs',
    description: 'Convert Microsoft Word DOC and DOCX files into high-resolution PDF documents online. Fast, secure, preserving fonts and original layout.',
    keywords: 'word to pdf converter, docx to pdf, convert word document to pdf, doc to pdf free'
  },
  'jpg-to-pdf': {
    title: 'JPG to PDF Converter: Images to PDF Online Free | ImgDocs',
    description: 'Convert JPG, PNG, and WebP images to high-quality PDF files instantly. Free online image to PDF tool with custom margins and orientation.',
    keywords: 'jpg to pdf, convert jpg to pdf, image to pdf converter, photo to pdf free, png to pdf'
  },
  'pdf-to-jpg': {
    title: 'PDF to JPG Converter: Extract High-Res Images | ImgDocs',
    description: 'Convert PDF pages to high-quality JPG or PNG images. Extract embedded pictures or turn full PDF pages into crisp images locally.',
    keywords: 'pdf to jpg, convert pdf to images, pdf to png, extract images from pdf, free pdf to image'
  },
  'compress-pdf': {
    title: 'Compress PDF Online: Reduce File Size for Free | ImgDocs',
    description: 'Compress PDF files online while preserving maximum visual quality. Reduce file size for email attachments and web upload limits instantly.',
    keywords: 'compress pdf online, reduce pdf size, pdf compressor free, shrink pdf for email, compress pdf without losing quality'
  },
  'merge-pdf': {
    title: 'Merge PDF Online: Combine Multiple PDFs Free | ImgDocs',
    description: 'Merge multiple PDF files into one single document in seconds. Easy drag-and-drop page reordering with 100% client-side privacy.',
    keywords: 'merge pdf online, combine pdf files free, join pdfs into one, merge documents online'
  },
  'split-pdf': {
    title: 'Split PDF Online: Extract Pages from PDF Free | ImgDocs',
    description: 'Split large PDF documents into individual pages or custom page ranges. Fast, free, and secure PDF page separator without cloud uploads.',
    keywords: 'split pdf, extract pages from pdf, separate pdf pages online, pdf cutter free'
  },
  'rotate-pdf': {
    title: 'Rotate PDF Online: Permanently Rotate Pages Free | ImgDocs',
    description: 'Rotate PDF pages 90, 180, or 270 degrees clockwise or counterclockwise. Save permanently oriented PDF files directly in your browser.',
    keywords: 'rotate pdf, rotate pdf pages online, change pdf orientation, turn pdf 90 degrees'
  },
  'protect-pdf': {
    title: 'Protect PDF Online: Encrypt PDF with Password | ImgDocs',
    description: 'Add military-grade AES-256 encryption and password protection to PDF documents. Restrict unauthorized opening, copying, and printing.',
    keywords: 'protect pdf, password protect pdf, encrypt pdf online, secure pdf file with password'
  },
  'unlock-pdf': {
    title: 'Unlock PDF Online: Remove Password from PDF Free | ImgDocs',
    description: 'Remove password restrictions and security permissions from your protected PDF documents instantly in your browser session.',
    keywords: 'unlock pdf, remove password from pdf, decrypt pdf online, remove pdf security'
  },
  'pdf-to-excel': {
    title: 'Free PDF to Excel Converter Online | ImgDocs',
    description: 'Convert PDF tables into editable Excel XLSX and CSV spreadsheets. Preserve row-column structure with 100% private in-browser conversion.',
    keywords: 'pdf to excel converter free, convert pdf to excel, pdf to xlsx, extract tables from pdf, pdf to spreadsheet'
  },
  'pdf-to-powerpoint': {
    title: 'PDF to PowerPoint Converter: Convert PDF to PPTX | ImgDocs',
    description: 'Convert PDF slides into editable Microsoft PowerPoint PPTX presentations. Retain layout, text frames, and slides with full privacy.',
    keywords: 'pdf to powerpoint converter, convert pdf to pptx, pdf to presentation, pdf to slides free'
  },
  'excel-to-pdf': {
    title: 'Excel to PDF Converter: Convert XLSX to PDF Free | ImgDocs',
    description: 'Convert Microsoft Excel XLS and XLSX spreadsheets to polished PDF files. Retain column widths, tables, and page boundaries cleanly.',
    keywords: 'excel to pdf converter, xlsx to pdf, convert excel sheet to pdf free'
  },
  'powerpoint-to-pdf': {
    title: 'PowerPoint to PDF Converter: Convert PPTX to PDF | ImgDocs',
    description: 'Convert Microsoft PowerPoint PPT and PPTX slide decks to high-resolution PDF documents. Ideal for handouts and printable slide distribution.',
    keywords: 'powerpoint to pdf, pptx to pdf, convert presentation to pdf, ppt to pdf free'
  },
  'ocr-pdf': {
    title: 'OCR PDF Online: Convert Scanned PDF to Text Free | ImgDocs',
    description: 'Extract searchable, editable text from scanned PDFs and photos using browser-based Optical Character Recognition (OCR) technology.',
    keywords: 'ocr pdf online, scanned pdf to text, optical character recognition pdf, extract text from scanned pdf'
  },
  'esign-pdf': {
    title: 'eSign PDF Online: Sign Documents Digitally Free | ImgDocs',
    description: 'Create handwritten digital signatures, draw or type your signature, and sign PDF contracts securely in your browser.',
    keywords: 'esign pdf online, sign pdf digitally free, electronic signature pdf, digital document signer'
  },
  'organize-pdf': {
    title: 'Organize PDF Pages: Rearrange & Delete Pages | ImgDocs',
    description: 'Reorder, rotate, duplicate, and remove individual PDF pages with an intuitive visual grid organizer. 100% private in-browser tool.',
    keywords: 'organize pdf, rearrange pdf pages, sort pdf pages online, reorder pages in pdf'
  },
  'add-watermark': {
    title: 'Add Watermark to PDF: Stamp Text or Images Free | ImgDocs',
    description: 'Stamp customized text or image watermarks onto PDF documents. Configure font size, transparency, rotation angle, and repeat grid pattern.',
    keywords: 'add watermark to pdf, watermark pdf online, stamp pdf document, brand pdf files'
  },
  'remove-pages': {
    title: 'Remove Pages from PDF: Delete PDF Pages Free | ImgDocs',
    description: 'Delete unnecessary or blank pages from your PDF document. Select individual pages or custom ranges and export an updated clean file.',
    keywords: 'remove pages from pdf, delete pdf pages online, eliminate pages in pdf file'
  },
  'crop-image': {
    title: 'Crop Image Online: Crop JPG, PNG & WebP Free | ImgDocs',
    description: 'Crop images with precision pixel bounding boxes and preset aspect ratios (16:9, 4:3, 1:1). 100% private local image cropping tool.',
    keywords: 'crop image online, photo cropper free, crop jpg png webp, resize photo boundary'
  }
};

export function renderSsrPage(pathname: string, templateHtml: string): SsrResult {
  const cleanPath = pathname.replace(/\/$/, '') || '/';
  const route = resolveRoute(cleanPath);

  // Check 301 Redirect
  if (route.redirectPath && route.redirectPath !== cleanPath) {
    return {
      type: 'redirect',
      status: 301,
      url: route.redirectPath
    };
  }

  // Base Site Metas
  let title = 'ImgDocs | Secure Client-Side PDF Tools & Free Converter';
  let description = 'Free high-quality PDF tools running entirely in your browser session. Compress, merge, split, and convert files safely without cloud uploads.';
  let keywords = 'pdf converter, local pdf tools, secure pdf editor, client-side pdf, convert pdf to jpg, compress pdf, browser ocr, esign pdf, split pdf, merge pdf';
  let canonical = `${SITE_URL}${cleanPath === '/' ? '' : cleanPath}`;
  let ogType = 'website';
  let jsonLdSchemas: any[] = [];
  let bodyHtml = '';
  const status = route.isNotFound ? 404 : 200;

  // Global Schemas
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    'name': 'ImgDocs Technologies',
    'url': SITE_URL,
    'logo': `${SITE_URL}/logo.png`,
    'contactPoint': {
      '@type': 'ContactPoint',
      'email': 'support@imgdocs.me',
      'contactType': 'Customer Support'
    }
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    'name': 'ImgDocs',
    'url': SITE_URL
  };

  jsonLdSchemas.push(orgSchema, websiteSchema);

  // Navigation HTML
  const headerHtml = `
    <header style="background: rgba(15,23,42,0.9); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 1rem 1.5rem; position: sticky; top: 0; z-index: 50; backdrop-filter: blur(12px);">
      <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <a href="/" style="display: flex; align-items: center; gap: 0.5rem; text-decoration: none; color: #fff; font-weight: 700; font-size: 1.25rem;">
          <span style="background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 8px; width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; color: white;">📄</span>
          <span>ImgDocs</span>
        </a>
        <nav style="display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap;">
          <a href="/" style="color: #cbd5e1; text-decoration: none; font-size: 0.95rem;">Home</a>
          <a href="/tools" style="color: #cbd5e1; text-decoration: none; font-size: 0.95rem;">All Tools</a>
          <a href="/blog" style="color: #cbd5e1; text-decoration: none; font-size: 0.95rem;">Blog</a>
          <a href="/pricing" style="color: #cbd5e1; text-decoration: none; font-size: 0.95rem;">Pricing</a>
          <a href="/about" style="color: #cbd5e1; text-decoration: none; font-size: 0.95rem;">About</a>
          <a href="/contact" style="color: #cbd5e1; text-decoration: none; font-size: 0.95rem;">Contact</a>
        </nav>
      </div>
    </header>
  `;

  // Footer HTML with all required legal links and 1-hour deletion note
  const footerHtml = `
    <footer style="background: #090d16; border-top: 1px solid rgba(255,255,255,0.08); padding: 3rem 1.5rem 2rem; color: #94a3b8; font-size: 0.9rem; margin-top: 4rem;">
      <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
        <div>
          <h3 style="color: #fff; font-size: 1.1rem; margin-bottom: 0.75rem;">ImgDocs</h3>
          <p style="font-size: 0.85rem; line-height: 1.6; color: #64748b;">
            Privacy-first PDF and document conversion suite. Process files securely in your browser without sensitive data exposure.
          </p>
          <p style="margin-top: 0.75rem; font-size: 0.85rem; color: #a5b4fc;">
            Official Support: <a href="mailto:support@imgdocs.me" style="color: #818cf8; text-decoration: underline;">support@imgdocs.me</a>
          </p>
        </div>
        <div>
          <h4 style="color: #fff; font-size: 0.95rem; margin-bottom: 0.75rem;">Popular Tools</h4>
          <ul style="list-style: none; padding: 0; margin: 0; line-height: 2;">
            <li><a href="/pdf-to-word" style="color: #94a3b8; text-decoration: none;">PDF to Word</a></li>
            <li><a href="/compress-pdf" style="color: #94a3b8; text-decoration: none;">Compress PDF</a></li>
            <li><a href="/merge-pdf" style="color: #94a3b8; text-decoration: none;">Merge PDF</a></li>
            <li><a href="/split-pdf" style="color: #94a3b8; text-decoration: none;">Split PDF</a></li>
            <li><a href="/jpg-to-pdf" style="color: #94a3b8; text-decoration: none;">JPG to PDF</a></li>
            <li><a href="/pdf-to-excel" style="color: #94a3b8; text-decoration: none;">PDF to Excel</a></li>
          </ul>
        </div>
        <div>
          <h4 style="color: #fff; font-size: 0.95rem; margin-bottom: 0.75rem;">Company & Help</h4>
          <ul style="list-style: none; padding: 0; margin: 0; line-height: 2;">
            <li><a href="/about" style="color: #94a3b8; text-decoration: none;">About Us</a></li>
            <li><a href="/contact" style="color: #94a3b8; text-decoration: none;">Contact Support</a></li>
            <li><a href="/blog" style="color: #94a3b8; text-decoration: none;">Productivity Blog</a></li>
            <li><a href="/pricing" style="color: #94a3b8; text-decoration: none;">Pricing Plans</a></li>
            <li><a href="/security" style="color: #94a3b8; text-decoration: none;">Security Architecture</a></li>
            <li><a href="/help" style="color: #94a3b8; text-decoration: none;">Help & FAQ</a></li>
          </ul>
        </div>
        <div>
          <h4 style="color: #fff; font-size: 0.95rem; margin-bottom: 0.75rem;">Legal & Compliance</h4>
          <ul style="list-style: none; padding: 0; margin: 0; line-height: 2;">
            <li><a href="/privacy-policy" style="color: #94a3b8; text-decoration: none;">Privacy Policy</a></li>
            <li><a href="/terms" style="color: #94a3b8; text-decoration: none;">Terms of Service</a></li>
            <li><a href="/disclaimer" style="color: #94a3b8; text-decoration: none;">Disclaimer</a></li>
            <li><a href="/cookie-policy" style="color: #94a3b8; text-decoration: none;">Cookie Policy</a></li>
            <li><a href="/refund-policy" style="color: #94a3b8; text-decoration: none;">Refund Policy</a></li>
            <li><a href="/dmca" style="color: #94a3b8; text-decoration: none;">DMCA Notice</a></li>
          </ul>
        </div>
      </div>
      
      <div style="background: rgba(30,41,59,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 1rem; text-align: center; margin-bottom: 1.5rem;">
        <span style="color: #38bdf8; font-weight: 600;">🔒 Data Retention Notice:</span>
        <span style="color: #cbd5e1; margin-left: 0.5rem;">Files are processed securely in your browser. Server-assisted conversion files are deleted automatically after 1 hour.</span>
      </div>

      <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1.5rem; text-align: center; color: #64748b; font-size: 0.8rem;">
        &copy; 2026 ImgDocs Technologies. All rights reserved. Google and Google AdSense are trademarks of Google LLC.
      </div>
    </footer>
  `;

  // Route Handling
  if (route.isNotFound) {
    title = '404 - Page Not Found | ImgDocs';
    description = 'The page you requested could not be found on ImgDocs. Discover our full suite of free, private, client-side PDF converters and document utilities.';
    bodyHtml = `
      ${headerHtml}
      <main style="max-width: 800px; margin: 4rem auto; padding: 2rem 1.5rem; text-align: center;">
        <h1 style="font-size: 3rem; font-weight: 800; color: #f87171; margin-bottom: 1rem;">404 - Page Not Found</h1>
        <p style="font-size: 1.2rem; color: #cbd5e1; margin-bottom: 2rem; line-height: 1.6;">
          We could not find the page you are looking for. It may have been moved, renamed, or temporarily unavailable.
        </p>
        <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
          <a href="/" style="background: #4f46e5; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 600;">Return to Homepage</a>
          <a href="/tools" style="background: #1e293b; color: white; border: 1px solid rgba(255,255,255,0.1); padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 600;">Browse All Tools</a>
        </div>
      </main>
      ${footerHtml}
    `;
  } else if (route.activeTab === 'home') {
    title = 'ImgDocs | 100% Free Client-Side PDF Tools & Secure Converter';
    description = 'Free high-quality PDF tools running entirely in your browser session. Compress, merge, split, and convert files safely without cloud uploads.';
    keywords = 'pdf converter, local pdf tools, secure pdf editor, client-side pdf, convert pdf to jpg, compress pdf, browser ocr, esign pdf, split pdf, merge pdf';

    const homeFaqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'How does ImgDocs process PDF files without uploading them to cloud servers?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Unlike traditional conversion websites that transmit your private files to remote cloud storage clusters, ImgDocs executes document transformations locally within your browser sandbox. By leveraging modern WebAssembly (Wasm) runtimes, HTML5 Canvas, and client-side binary compilers, our tools compute conversions using your device CPU and RAM. Your document text, metadata, and images never leave your local computer or phone.'
          }
        },
        {
          '@type': 'Question',
          'name': 'What is your strict data retention and 1-hour file deletion policy?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'We operate under a strict zero-knowledge architecture. For standard client-side conversions, your documents are processed exclusively in temporary browser memory buffers and cleared instantly when you close the tab. In rare scenarios where server-assisted fallback pipelines are utilized, files are permanently purged automatically after exactly 1 hour.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Are there file size limits, artificial queues, or hidden paywalls?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'ImgDocs is 100% free to use for everyday document workflows. Most tools support file sizes up to 100MB per document and batch operations of up to 25 images simultaneously with zero queues and zero forced countdowns.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Is ImgDocs compliant with corporate data security standards including GDPR and HIPAA?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes. Because ImgDocs operates client-side without third-party data transmission, it satisfies strict regulatory mandates under the General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), and Health Insurance Portability and Accountability Act (HIPAA).'
          }
        },
        {
          '@type': 'Question',
          'name': 'Can I convert, compress, and sign documents on smartphones and tablets?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes! ImgDocs is engineered with a mobile-first responsive architecture that functions seamlessly across Apple iOS (iPhone/iPad Safari) and Android (Chrome, Edge, Samsung Internet).'
          }
        }
      ]
    };
    jsonLdSchemas.push(homeFaqSchema);

    bodyHtml = `
      ${headerHtml}
      <main style="max-width: 1200px; margin: 2rem auto; padding: 0 1.5rem;">
        <section style="text-align: center; padding: 3rem 1rem 2rem;">
          <h1 style="font-size: 2.75rem; font-weight: 800; color: #fff; margin-bottom: 1rem; line-height: 1.2;">
            Free Client-Side PDF Tools & Secure Document Suite
          </h1>
          <p style="font-size: 1.2rem; color: #94a3b8; max-width: 800px; margin: 0 auto 2rem; line-height: 1.6;">
            Convert, compress, edit, merge, split, and sign PDF documents directly in your browser. Complete privacy with zero cloud file storage.
          </p>
          <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
            <a href="/pdf-to-word" style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 0.85rem 1.75rem; border-radius: 8px; text-decoration: none; font-weight: 600;">Convert PDF to Word</a>
            <a href="/compress-pdf" style="background: #1e293b; border: 1px solid rgba(255,255,255,0.15); color: white; padding: 0.85rem 1.75rem; border-radius: 8px; text-decoration: none; font-weight: 600;">Compress PDF</a>
            <a href="/merge-pdf" style="background: #1e293b; border: 1px solid rgba(255,255,255,0.15); color: white; padding: 0.85rem 1.75rem; border-radius: 8px; text-decoration: none; font-weight: 600;">Merge PDFs</a>
          </div>
        </section>

        <section style="margin: 3rem 0;">
          <h2 style="font-size: 1.8rem; font-weight: 700; color: #fff; margin-bottom: 1.5rem; text-align: center;">All PDF & Document Converters</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem;">
            ${toolsList.map(tool => `
              <a href="/${tool.id}" style="background: rgba(30,41,59,0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem; text-decoration: none; color: inherit; display: block; transition: transform 0.2s;">
                <h3 style="color: #fff; font-size: 1.15rem; margin-bottom: 0.5rem;">${tool.title}</h3>
                <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.5;">${tool.shortDescription}</p>
                <span style="color: #818cf8; font-size: 0.85rem; font-weight: 600; margin-top: 0.75rem; display: inline-block;">Open Tool &rarr;</span>
              </a>
            `).join('')}
          </div>
        </section>

        <!-- Comprehensive Platform Overview & Privacy Architecture (400+ words) -->
        <section style="background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 2.5rem; margin: 3rem 0; color: #cbd5e1; line-height: 1.8;">
          <header style="border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1rem; margin-bottom: 1.5rem;">
            <span style="color: #818cf8; font-size: 0.85rem; font-weight: 700; text-transform: uppercase;">The Privacy-First Document Standard</span>
            <h2 style="font-size: 2rem; color: #fff; margin: 0.5rem 0 0;">What ImgDocs Offers to Modern Professionals</h2>
          </header>

          <p style="margin-bottom: 1rem;">
            ImgDocs is a unified, high-performance digital document workstation built to replace obsolete desktop software and privacy-invasive cloud upload services. Our platform equips individuals, legal teams, healthcare professionals, accountants, and enterprises with 21 dedicated tools designed to convert, compress, edit, merge, split, rotate, watermark, protect, and electronically sign PDF and image documents.
          </p>
          <p style="margin-bottom: 2rem;">
            Whether you need to convert multi-page smartphone receipts into an expense-ready PDF, shrink a 60MB design portfolio down to an email-compliant attachment under 15MB, extract tabular figures from an encrypted PDF into an editable Excel spreadsheet, or permanently delete confidential pages from a legal contract, ImgDocs delivers institutional-grade document processing with zero software installation and zero subscription fees.
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
            <div style="background: rgba(30,41,59,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 1.5rem;">
              <h3 style="color: #fff; font-size: 1.15rem; margin-bottom: 0.75rem;">Why Choose Client-Side Execution?</h3>
              <p style="font-size: 0.95rem; color: #94a3b8; margin: 0;">
                Traditional online converters transmit your confidential files across the open internet to shared cloud servers where they sit on temporary hard drives. ImgDocs fundamentally shifts document computation to the client side. By executing conversions directly within your browser runtime using WebAssembly and hardware-accelerated memory buffers, your sensitive legal contracts, medical records, tax forms, and proprietary plans never leave your machine.
              </p>
            </div>

            <div style="background: rgba(30,41,59,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 1.5rem;">
              <h3 style="color: #fff; font-size: 1.15rem; margin-bottom: 0.75rem;">How the Local Technology Works</h3>
              <p style="font-size: 0.95rem; color: #94a3b8; margin: 0;">
                When you drag a document onto ImgDocs, our local engine allocates an isolated memory heap inside your browser. High-performance WebAssembly runtimes parse internal PDF object catalogs, rasterize vector coordinate matrices, compress high-DPI image assets, or inject military-grade AES-256 encryption keys on your local CPU. When conversion finishes, you download the compiled binary immediately and all temporary heap allocations are wiped from RAM.
              </p>
            </div>
          </div>

          <div style="background: rgba(49,46,129,0.25); border: 1px solid rgba(99,102,241,0.2); border-radius: 12px; padding: 1.5rem;">
            <h3 style="color: #a5b4fc; font-size: 1.15rem; margin-bottom: 0.5rem;">Our Uncompromising Privacy & File-Purge Guarantee</h3>
            <p style="font-size: 0.95rem; color: #cbd5e1; margin: 0;">
              We operate under an absolute zero-knowledge principle. For core client-side tools, 100% of processing happens in your device memory; zero bytes of document data ever reach our servers. For specialized server-assisted fallback utilities (such as legacy optical character recognition on scanned photocopies), files transmit exclusively over encrypted TLS 1.3 channels to sandboxed memory partitions and are permanently deleted automatically after 1 hour. We never inspect, retain, archive, or monetize your intellectual property.
            </p>
          </div>
        </section>

        <!-- Homepage FAQ Section -->
        <section style="margin: 3rem 0;">
          <h2 style="font-size: 1.8rem; font-weight: 700; color: #fff; margin-bottom: 1.5rem; text-align: center;">Frequently Asked Questions</h2>
          <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 900px; margin: 0 auto;">
            <div style="background: rgba(30,41,59,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 1.25rem;">
              <h3 style="color: #fff; font-size: 1.1rem; margin-bottom: 0.5rem;">How does ImgDocs process PDF files without uploading them to cloud servers?</h3>
              <p style="color: #94a3b8; font-size: 0.95rem; margin: 0; line-height: 1.6;">Unlike traditional conversion websites that transmit your private files to remote cloud storage clusters, ImgDocs executes document transformations locally within your browser sandbox. By leveraging modern WebAssembly (Wasm) runtimes, HTML5 Canvas, and client-side binary compilers, our tools compute conversions using your device CPU and RAM. Your document text, metadata, and images never leave your local computer or phone.</p>
            </div>
            <div style="background: rgba(30,41,59,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 1.25rem;">
              <h3 style="color: #fff; font-size: 1.1rem; margin-bottom: 0.5rem;">What is your strict data retention and 1-hour file deletion policy?</h3>
              <p style="color: #94a3b8; font-size: 0.95rem; margin: 0; line-height: 1.6;">We operate under a strict zero-knowledge architecture. For standard client-side conversions, your documents are processed exclusively in temporary browser memory buffers and cleared instantly when you close the tab. In rare scenarios where server-assisted fallback pipelines are utilized (such as legacy OCR on dense photocopies), files transmit across encrypted TLS 1.3 channels to ephemeral partitions and are permanently purged automatically after exactly 1 hour. We never inspect, store, or monetize your documents.</p>
            </div>
            <div style="background: rgba(30,41,59,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 1.25rem;">
              <h3 style="color: #fff; font-size: 1.1rem; margin-bottom: 0.5rem;">Are there file size limits, artificial queues, or hidden paywalls?</h3>
              <p style="color: #94a3b8; font-size: 0.95rem; margin: 0; line-height: 1.6;">ImgDocs is 100% free to use for everyday document workflows. Most tools support file sizes up to 100MB per document and batch operations of up to 25 images simultaneously. Because computation runs on your local hardware rather than expensive server farms, you experience zero artificial queue delays, zero forced countdown timers, and zero intrusive watermarks stamped onto your finished files.</p>
            </div>
            <div style="background: rgba(30,41,59,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 1.25rem;">
              <h3 style="color: #fff; font-size: 1.1rem; margin-bottom: 0.5rem;">Is ImgDocs compliant with corporate data security standards including GDPR and HIPAA?</h3>
              <p style="color: #94a3b8; font-size: 0.95rem; margin: 0; line-height: 1.6;">Yes. Enterprise legal and compliance teams frequently prohibit employees from uploading proprietary documents to public online converters due to data leakage risks. Because ImgDocs operates client-side without third-party data transmission, it satisfies strict regulatory mandates under the General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), and Health Insurance Portability and Accountability Act (HIPAA).</p>
            </div>
            <div style="background: rgba(30,41,59,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 1.25rem;">
              <h3 style="color: #fff; font-size: 1.1rem; margin-bottom: 0.5rem;">Can I convert, compress, and sign documents on smartphones and tablets?</h3>
              <p style="color: #94a3b8; font-size: 0.95rem; margin: 0; line-height: 1.6;">Yes! ImgDocs is engineered with a mobile-first responsive architecture that functions seamlessly across Apple iOS (iPhone/iPad Safari) and Android (Chrome, Edge, Samsung Internet). You can photograph paper documents with your phone camera, convert them directly into standardized A4/Letter PDFs, eSign contracts with your fingertip on touchscreens, and download compiled files without installing native App Store downloads.</p>
            </div>
          </div>
        </section>
      </main>
      ${footerHtml}
    `;
  } else if (route.activeTab === 'blog') {
    title = 'ImgDocs Blog | Expert PDF & Document Productivity Tutorials';
    description = 'Read comprehensive step-by-step guides, privacy instructions, and expert tips on document compression, encryption standards, and digital workflows.';
    keywords = 'pdf blog, pdf tutorials, document productivity, pdf tips, how to compress pdf, how to merge pdf';

    bodyHtml = `
      ${headerHtml}
      <main style="max-width: 1100px; margin: 3rem auto; padding: 0 1.5rem;">
        <header style="text-align: center; margin-bottom: 3rem;">
          <h1 style="font-size: 2.5rem; font-weight: 800; color: #fff; margin-bottom: 0.75rem;">ImgDocs Productivity Blog</h1>
          <p style="font-size: 1.1rem; color: #94a3b8; max-width: 700px; margin: 0 auto;">
            Actionable technical tutorials, security breakdowns, and in-depth guides for managing digital documents safely and efficiently.
          </p>
        </header>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem;">
          ${blogPosts.map(post => `
            <article style="background: rgba(30,41,59,0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.75rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <span style="color: #818cf8; font-size: 0.8rem; font-weight: 700; text-transform: uppercase;">${post.category} &bull; ${post.readTime}</span>
                <h2 style="color: #fff; font-size: 1.3rem; margin: 0.75rem 0; line-height: 1.4;">
                  <a href="/blog/${post.slug}" style="color: inherit; text-decoration: none;">${post.title}</a>
                </h2>
                <p style="color: #94a3b8; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem;">${post.excerpt}</p>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 1rem; font-size: 0.85rem; color: #64748b;">
                <span>By ${post.author}</span>
                <a href="/blog/${post.slug}" style="color: #a5b4fc; font-weight: 600; text-decoration: none;">Read Article &rarr;</a>
              </div>
            </article>
          `).join('')}
        </div>
      </main>
      ${footerHtml}
    `;
  } else if (route.activeTab === 'blog-post' && route.activeBlogSlug) {
    const post = blogPosts.find(b => b.slug === route.activeBlogSlug);
    if (!post) {
      return renderSsrPage('/404', templateHtml);
    }

    title = post.title.length > 55 ? `${post.title.slice(0, 52)}... | ImgDocs` : `${post.title} | ImgDocs`;
    description = post.metaDescription || post.excerpt;
    keywords = post.keywords ? post.keywords.join(', ') : 'pdf tutorial, document guide, imgdocs blog';
    ogType = 'article';

    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': post.title,
      'description': description,
      'author': {
        '@type': 'Person',
        'name': post.author
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'ImgDocs Technologies',
        'logo': {
          '@type': 'ImageObject',
          'url': `${SITE_URL}/logo.png`
        }
      },
      'datePublished': post.date,
      'dateModified': post.date,
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/blog/${post.slug}`
      }
    };

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_URL },
        { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': `${SITE_URL}/blog` },
        { '@type': 'ListItem', 'position': 3, 'name': post.title, 'item': `${SITE_URL}/blog/${post.slug}` }
      ]
    };

    jsonLdSchemas.push(articleSchema, breadcrumbSchema);

    const relatedPosts = blogPosts.filter(b => b.slug !== post.slug).slice(0, 3);
    const parsedArticleContent = markdownToHtml(post.content);

    bodyHtml = `
      ${headerHtml}
      <main style="max-width: 860px; margin: 2rem auto; padding: 0 1.5rem;">
        <nav aria-label="Breadcrumb" style="font-size: 0.85rem; color: #64748b; margin-bottom: 1.5rem;">
          <a href="/" style="color: #94a3b8; text-decoration: none;">Home</a> &gt; 
          <a href="/blog" style="color: #94a3b8; text-decoration: none;">Blog</a> &gt; 
          <span style="color: #cbd5e1;">${post.title}</span>
        </nav>

        <header style="margin-bottom: 2.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 2rem;">
          <span style="color: #818cf8; font-size: 0.85rem; font-weight: 700; text-transform: uppercase;">${post.category}</span>
          <h1 id="article-h1" style="font-size: 2.5rem; font-weight: 800; color: #fff; margin: 0.75rem 0 1rem; line-height: 1.25;">
            ${post.title}
          </h1>
          <div style="display: flex; gap: 1.5rem; font-size: 0.9rem; color: #94a3b8; flex-wrap: wrap;">
            <span>By <strong>${post.author}</strong></span>
            <span>Published: ${post.date}</span>
            <span>Estimated Reading Time: ${post.readTime}</span>
          </div>
        </header>

        <article style="color: #cbd5e1; font-size: 1.1rem; line-height: 1.8;">
          ${parsedArticleContent}
        </article>

        <div style="background: rgba(30,41,59,0.5); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem; margin-top: 3rem;">
          <h3 style="color: #fff; margin-bottom: 0.5rem;">About the Author</h3>
          <p style="color: #94a3b8; font-size: 0.95rem; margin: 0;">
            ${post.author} is a document security and productivity engineer at ImgDocs, writing on cryptographic standards, client-side data privacy, and optimized file compression architectures.
          </p>
        </div>

        <section style="margin-top: 4rem;">
          <h2 style="color: #fff; font-size: 1.5rem; margin-bottom: 1.5rem;">Related Articles</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
            ${relatedPosts.map(rel => `
              <a href="/blog/${rel.slug}" style="background: rgba(30,41,59,0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 1.25rem; text-decoration: none; color: inherit; display: block;">
                <h3 style="color: #fff; font-size: 1.05rem; margin-bottom: 0.5rem; line-height: 1.4;">${rel.title}</h3>
                <span style="color: #818cf8; font-size: 0.85rem; font-weight: 600;">Read guide &rarr;</span>
              </a>
            `).join('')}
          </div>
        </section>
      </main>
      ${footerHtml}
    `;
  } else if (cleanPath === '/about') {
    title = 'About Us | ImgDocs Technologies';
    description = 'Discover the ImgDocs mission: delivering 100% private, client-side document utilities and high-performance PDF converters with zero server tracking.';
    keywords = 'about imgdocs, private pdf converter, client-side document processing, local file tools';

    bodyHtml = `
      ${headerHtml}
      <main style="max-width: 900px; margin: 3rem auto; padding: 0 1.5rem; color: #cbd5e1; line-height: 1.8;">
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #fff; margin-bottom: 1.5rem;">About ImgDocs</h1>
        <p style="font-size: 1.15rem; color: #a5b4fc; margin-bottom: 2rem;">
          Building the fastest, most private digital document suite on the modern web.
        </p>
        <section style="margin-bottom: 2.5rem;">
          <h2 style="font-size: 1.6rem; color: #fff; margin-bottom: 1rem;">Our Mission: Privacy by Architecture</h2>
          <p>
            ImgDocs was engineered to eliminate unnecessary cloud file uploads. Most traditional PDF converting platforms transmit your confidential contracts, medical records, and financial statements to remote third-party servers. We engineered a comprehensive browser-based processing engine utilizing WebAssembly, modern JavaScript runtimes, and local memory buffers.
          </p>
          <p>
            When you compress a PDF, convert images, or sign a document on ImgDocs, your files are computed directly on your device CPU and GPU. Your data never touches an external database.
          </p>
        </section>
        <section style="margin-bottom: 2.5rem;">
          <h2 style="font-size: 1.6rem; color: #fff; margin-bottom: 1rem;">Core Technology Standards</h2>
          <ul>
            <li><strong>Zero Server Storage:</strong> Conversions execute in browser memory; server-assisted operations auto-delete within 1 hour.</li>
            <li><strong>Cryptographic Security:</strong> AES-256 standard encryption for password-protected files.</li>
            <li><strong>High-Speed Processing:</strong> Multithreaded WebAssembly conversions with zero artificial throttles.</li>
            <li><strong>Universal Accessibility:</strong> 100% free, responsive design that works seamlessly across desktops, tablets, and smartphones.</li>
          </ul>
        </section>
        <section>
          <h2 style="font-size: 1.6rem; color: #fff; margin-bottom: 1rem;">Contact Our Team</h2>
          <p>
            Have questions, feedback, or enterprise inquiries? Reach our engineering team directly at <a href="mailto:support@imgdocs.me" style="color: #818cf8; text-decoration: underline;">support@imgdocs.me</a> or visit our <a href="/contact" style="color: #818cf8; text-decoration: underline;">Contact Page</a>.
          </p>
        </section>
      </main>
      ${footerHtml}
    `;
  } else if (cleanPath === '/contact') {
    title = 'Contact Us | ImgDocs Customer Support';
    description = 'Get in touch with the ImgDocs technical support team. Send inquiries regarding document conversions, bug reports, or feature suggestions.';
    keywords = 'contact imgdocs, customer support, pdf converter help, contact form';

    bodyHtml = `
      ${headerHtml}
      <main style="max-width: 800px; margin: 3rem auto; padding: 0 1.5rem; color: #cbd5e1; line-height: 1.8;">
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #fff; margin-bottom: 1rem;">Contact Customer Support</h1>
        <p style="font-size: 1.1rem; color: #94a3b8; margin-bottom: 2.5rem;">
          We are here to assist you with any questions regarding PDF conversions, privacy policies, or platform feedback.
        </p>

        <div style="background: rgba(30,41,59,0.5); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem; margin-bottom: 2.5rem;">
          <h2 style="color: #fff; font-size: 1.3rem; margin-bottom: 1rem;">Official Communication Channels</h2>
          <p style="margin-bottom: 0.5rem;"><strong>Support Email:</strong> <a href="mailto:support@imgdocs.me" style="color: #818cf8; text-decoration: underline;">support@imgdocs.me</a></p>
          <p style="margin-bottom: 0.5rem;"><strong>Response Window:</strong> Within 24-48 business hours</p>
          <p style="margin-bottom: 0.5rem;"><strong>Platform Location:</strong> ImgDocs Technologies, Digital Operations</p>
        </div>

        <form action="/api/contact" method="POST" style="background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem;">
          <h2 style="color: #fff; font-size: 1.3rem; margin-bottom: 1.5rem;">Send Us a Message</h2>
          <div style="margin-bottom: 1.25rem;">
            <label for="contact-name" style="display: block; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem;">Full Name</label>
            <input id="contact-name" name="name" type="text" required placeholder="John Doe" style="width: 100%; padding: 0.75rem; border-radius: 6px; background: #0f172a; border: 1px solid rgba(255,255,255,0.15); color: #fff;" />
          </div>
          <div style="margin-bottom: 1.25rem;">
            <label for="contact-email" style="display: block; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem;">Email Address</label>
            <input id="contact-email" name="email" type="email" required placeholder="john@example.com" style="width: 100%; padding: 0.75rem; border-radius: 6px; background: #0f172a; border: 1px solid rgba(255,255,255,0.15); color: #fff;" />
          </div>
          <div style="margin-bottom: 1.25rem;">
            <label for="contact-subject" style="display: block; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem;">Subject</label>
            <input id="contact-subject" name="subject" type="text" required placeholder="Inquiry about PDF conversion" style="width: 100%; padding: 0.75rem; border-radius: 6px; background: #0f172a; border: 1px solid rgba(255,255,255,0.15); color: #fff;" />
          </div>
          <div style="margin-bottom: 1.5rem;">
            <label for="contact-message" style="display: block; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem;">Message</label>
            <textarea id="contact-message" name="message" rows="5" required placeholder="Please provide details about your inquiry..." style="width: 100%; padding: 0.75rem; border-radius: 6px; background: #0f172a; border: 1px solid rgba(255,255,255,0.15); color: #fff;"></textarea>
          </div>
          <button type="submit" style="background: #4f46e5; color: white; border: none; padding: 0.85rem 1.75rem; border-radius: 8px; font-weight: 600; cursor: pointer;">
            Send Inquiry
          </button>
        </form>
      </main>
      ${footerHtml}
    `;
  } else if (cleanPath === '/privacy-policy') {
    title = 'Privacy Policy | ImgDocs';
    description = 'Learn how ImgDocs protects user privacy, manages cookies, serves AdSense ads, and automatically deletes files after 1 hour.';
    keywords = 'privacy policy, cookie policy, google adsense cookie, doubleclick dart, file auto deletion, data privacy';

    bodyHtml = `
      ${headerHtml}
      <main style="max-width: 900px; margin: 3rem auto; padding: 0 1.5rem; color: #cbd5e1; line-height: 1.8;">
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #fff; margin-bottom: 1rem;">Privacy Policy</h1>
        <p style="font-size: 0.95rem; color: #94a3b8; margin-bottom: 2.5rem;">Last Updated: November 2, 2026 &bull; Effective Date: November 2, 2026</p>

        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.5rem; color: #fff; margin-bottom: 0.75rem;">1. Introduction & Privacy Philosophy</h2>
          <p>
            At ImgDocs ("we", "us", or "our"), accessible via <strong>https://www.imgdocs.me</strong>, user privacy is our foremost priority. This Privacy Policy outlines the types of information collected, stored, and utilized when you use our client-side document processing suite.
          </p>
        </section>

        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.5rem; color: #fff; margin-bottom: 0.75rem;">2. Document Handling & 1-Hour Auto-Deletion Policy</h2>
          <p>
            The majority of operations on ImgDocs execute entirely inside your local browser memory via WebAssembly and HTML5 client APIs. In scenarios where server-assisted conversion workflows are utilized (such as complex OCR parsing or legacy formatting fallbacks):
          </p>
          <ul>
            <li>Files are transmitted over encrypted TLS 1.3 channels.</li>
            <li>Uploaded documents are processed exclusively in sandboxed temporary file partitions.</li>
            <li><strong>Automatic Deletion:</strong> All uploaded files, intermediate buffers, and converted output documents are permanently deleted automatically after <strong>1 hour</strong>. We do not inspect, retain, archive, or monetize your documents.</li>
          </ul>
        </section>

        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.5rem; color: #fff; margin-bottom: 0.75rem;">3. Cookies, Google AdSense & DoubleClick DART Cookies</h2>
          <p>
            ImgDocs uses cookies to store session preferences and enhance user navigation. Furthermore:
          </p>
          <ul>
            <li>Google, as a third-party vendor, uses cookies to serve ads on ImgDocs.</li>
            <li>Google's use of advertising cookies (including the DoubleClick DART cookie) enables it and its partners to serve ads based on your visit to ImgDocs and/or other sites across the Internet.</li>
            <li>Users may opt out of personalized advertising by visiting the <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style="color: #818cf8; text-decoration: underline;">Google Ad Settings</a> page or the <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer" style="color: #818cf8; text-decoration: underline;">Network Advertising Initiative (NAI) opt-out portal</a>.</li>
          </ul>
        </section>

        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.5rem; color: #fff; margin-bottom: 0.75rem;">4. Log Files & Analytics</h2>
          <p>
            Like most standard website operators, ImgDocs collects non-personally identifiable log information including IP addresses, browser user-agents, referring pages, and timestamps. This data is utilized strictly for system diagnostics, bot prevention, and performance monitoring.
          </p>
        </section>

        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.5rem; color: #fff; margin-bottom: 0.75rem;">5. GDPR & CCPA/CPRA Privacy Rights</h2>
          <p>
            Under the General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA), you have the right to request information on collected data, request erasure, or object to data processing. Because our core tools process files client-side, we do not store customer profiles or document databases.
          </p>
        </section>

        <section>
          <h2 style="font-size: 1.5rem; color: #fff; margin-bottom: 0.75rem;">6. Contact Privacy Team</h2>
          <p>
            For any questions or privacy inquiries, contact our Data Protection Officer at <a href="mailto:support@imgdocs.me" style="color: #818cf8; text-decoration: underline;">support@imgdocs.me</a>.
          </p>
        </section>
      </main>
      ${footerHtml}
    `;
  } else if (cleanPath === '/terms') {
    title = 'Terms of Service | ImgDocs';
    description = 'Review the ImgDocs terms of service, acceptable use guidelines, intellectual property terms, and service disclaimer.';
    keywords = 'terms of service, terms and conditions, legal agreement, acceptable use, imgdocs terms';

    bodyHtml = `
      ${headerHtml}
      <main style="max-width: 900px; margin: 3rem auto; padding: 0 1.5rem; color: #cbd5e1; line-height: 1.8;">
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #fff; margin-bottom: 1rem;">Terms of Service</h1>
        <p style="font-size: 0.95rem; color: #94a3b8; margin-bottom: 2.5rem;">Last Updated: November 2, 2026</p>

        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.5rem; color: #fff; margin-bottom: 0.75rem;">1. Acceptance of Terms</h2>
          <p>
            By accessing or using ImgDocs at https://www.imgdocs.me, you agree to comply with and be bound by these Terms of Service. If you disagree with any portion of these terms, please discontinue using the service immediately.
          </p>
        </section>

        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.5rem; color: #fff; margin-bottom: 0.75rem;">2. Permitted Use & Conduct</h2>
          <p>
            You agree to use ImgDocs exclusively for lawful purposes. You must not upload or process documents containing malicious payloads, virus code, or copyrighted works without explicit legal authorization.
          </p>
        </section>

        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.5rem; color: #fff; margin-bottom: 0.75rem;">3. Intellectual Property</h2>
          <p>
            You retain 100% full ownership, rights, and copyright to all files, graphics, and text processed through ImgDocs. We claim no ownership over your intellectual property.
          </p>
        </section>

        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.5rem; color: #fff; margin-bottom: 0.75rem;">4. Service Availability & Disclaimer of Warranty</h2>
          <p>
            ImgDocs is provided on an "AS IS" and "AS AVAILABLE" basis. While we strive for high uptime and precise conversions, we make no warranties of any kind regarding completeness, fitness for a particular purpose, or error-free execution.
          </p>
        </section>

        <section>
          <h2 style="font-size: 1.5rem; color: #fff; margin-bottom: 0.75rem;">5. Contact Information</h2>
          <p>
            For legal inquiries regarding these terms, email <a href="mailto:support@imgdocs.me" style="color: #818cf8; text-decoration: underline;">support@imgdocs.me</a>.
          </p>
        </section>
      </main>
      ${footerHtml}
    `;
  } else if (cleanPath === '/disclaimer') {
    title = 'Disclaimer | ImgDocs';
    description = 'Official legal disclaimer for ImgDocs document conversion, file integrity, client-side memory safety, and third-party links.';
    keywords = 'disclaimer, legal disclaimer, document conversion disclaimer, file accuracy warranty';

    bodyHtml = `
      ${headerHtml}
      <main style="max-width: 900px; margin: 3rem auto; padding: 0 1.5rem; color: #cbd5e1; line-height: 1.8;">
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #fff; margin-bottom: 1rem;">Disclaimer</h1>
        <p style="font-size: 0.95rem; color: #94a3b8; margin-bottom: 2.5rem;">Last Updated: November 2, 2026</p>

        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.5rem; color: #fff; margin-bottom: 0.75rem;">1. General Informational & Utility Purpose</h2>
          <p>
            The tools, articles, and calculators provided on ImgDocs (https://www.imgdocs.me) are intended solely for general document management, formatting assistance, and educational purposes. Nothing on this website constitutes legal, financial, or certified archival counsel.
          </p>
        </section>

        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.5rem; color: #fff; margin-bottom: 0.75rem;">2. Conversion Fidelity & Document Integrity</h2>
          <p>
            Document conversion involves rendering fonts, vector graphics, image layers, and formatting structures across disparate file specifications. While ImgDocs uses industry-standard rendering engines, we cannot guarantee 100% identical styling, font matching, or pagination across every proprietary software version. Always verify your converted output files before executing critical submissions.
          </p>
        </section>

        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.5rem; color: #fff; margin-bottom: 0.75rem;">3. Client-Side Operations & Local Data Safety</h2>
          <p>
            Because ImgDocs executes document transformations directly within your browser runtime, processing speeds and memory limits depend on your local hardware specifications. We are not responsible for client-side hardware freezes, browser memory terminations, or unsaved local files.
          </p>
        </section>

        <section>
          <h2 style="font-size: 1.5rem; color: #fff; margin-bottom: 0.75rem;">4. Contact Disclaimer Administration</h2>
          <p>
            Questions regarding this disclaimer should be directed to <a href="mailto:support@imgdocs.me" style="color: #818cf8; text-decoration: underline;">support@imgdocs.me</a>.
          </p>
        </section>
      </main>
      ${footerHtml}
    `;
  } else {
    // Check if it's a Tool page!
    const toolId = cleanPath.slice(1);
    const matchedTool = toolsList.find(t => t.id === toolId);

    if (matchedTool) {
      const meta = toolMetaOverrides[matchedTool.id] || {
        title: `${matchedTool.title} | ImgDocs`,
        description: matchedTool.shortDescription,
        keywords: `${matchedTool.title.toLowerCase()}, pdf converter, free document tool`
      };

      title = meta.title;
      description = meta.description;
      keywords = meta.keywords;

      // Related tools
      const relatedTools = toolsList
        .filter(t => t.id !== matchedTool.id && (t.category === matchedTool.category || t.id.includes('pdf')))
        .slice(0, 4);

      // SoftwareApplication Schema
      const softwareAppSchema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': matchedTool.title,
        'applicationCategory': 'UtilitiesApplication',
        'operatingSystem': 'Web Browser (Cross-Platform)',
        'offers': {
          '@type': 'Offer',
          'price': '0.00',
          'priceCurrency': 'USD'
        },
        'description': matchedTool.shortDescription,
        'url': `${SITE_URL}/${matchedTool.id}`
      };

      // FAQPage Schema
      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': matchedTool.faqs.map(faq => ({
          '@type': 'Question',
          'name': faq.q,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.a
          }
        }))
      };

      // BreadcrumbList Schema
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_URL },
          { '@type': 'ListItem', 'position': 2, 'name': 'Tools', 'item': `${SITE_URL}/tools` },
          { '@type': 'ListItem', 'position': 3, 'name': matchedTool.title, 'item': `${SITE_URL}/${matchedTool.id}` }
        ]
      };

      jsonLdSchemas.push(softwareAppSchema, faqSchema, breadcrumbSchema);

      bodyHtml = `
        ${headerHtml}
        <main style="max-width: 1100px; margin: 2rem auto; padding: 0 1.5rem;">
          <nav aria-label="Breadcrumb" style="font-size: 0.85rem; color: #64748b; margin-bottom: 1.5rem;">
            <a href="/" style="color: #94a3b8; text-decoration: none;">Home</a> &gt; 
            <a href="/tools" style="color: #94a3b8; text-decoration: none;">Tools</a> &gt; 
            <span style="color: #cbd5e1;">${matchedTool.title}</span>
          </nav>

          <header style="text-align: center; margin-bottom: 2rem;">
            <span style="background: rgba(99,102,241,0.15); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.3); padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase;">
              ${matchedTool.category}
            </span>
            <h1 id="tool-h1" style="font-size: 2.5rem; font-weight: 800; color: #fff; margin: 0.75rem 0 1rem; line-height: 1.2;">
              ${matchedTool.title}
            </h1>
            <p style="font-size: 1.15rem; color: #94a3b8; max-width: 750px; margin: 0 auto; line-height: 1.6;">
              ${matchedTool.shortDescription}
            </p>
          </header>

          <!-- Working Tool Simulator / Action Zone -->
          <div style="background: rgba(30,41,59,0.7); border: 2px dashed rgba(99,102,241,0.4); border-radius: 16px; padding: 3rem 1.5rem; text-align: center; margin-bottom: 3.5rem;">
            <div style="max-width: 600px; margin: 0 auto;">
              <span style="font-size: 3rem; display: inline-block; margin-bottom: 1rem;">📄</span>
              <h2 style="color: #fff; font-size: 1.5rem; margin-bottom: 0.5rem;">Select or Drop Files to Begin</h2>
              <p style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 1.5rem;">
                Processed 100% locally in your browser session. Zero uploads to external servers.
              </p>
              <div style="display: inline-block; background: #4f46e5; color: white; padding: 0.85rem 2rem; border-radius: 8px; font-weight: 600;">
                Choose Files
              </div>
              <p style="font-size: 0.8rem; color: #64748b; margin-top: 1rem;">
                Supported: ${matchedTool.formats} &bull; Max Size: ${matchedTool.limits}
              </p>
            </div>
          </div>

          <!-- Comprehensive 400-600 Word Content Section -->
          <article style="background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 2.5rem; color: #cbd5e1; line-height: 1.8; margin-bottom: 3rem;">
            <section style="margin-bottom: 2.5rem;">
              <h2 style="font-size: 1.6rem; color: #fff; margin-bottom: 1rem;">Overview & Core Capabilities</h2>
              <p>${matchedTool.description}</p>
            </section>

            <section style="margin-bottom: 2.5rem;">
              <h2 style="font-size: 1.6rem; color: #fff; margin-bottom: 1rem;">When to Use ${matchedTool.title}</h2>
              <p>${matchedTool.whenToUse}</p>
            </section>

            <section style="margin-bottom: 2.5rem;">
              <h2 style="font-size: 1.6rem; color: #fff; margin-bottom: 1rem;">How to Use ${matchedTool.title} (Step-by-Step)</h2>
              <ol style="padding-left: 1.5rem; line-height: 1.9;">
                ${matchedTool.stepByStep.map(step => `<li>${step}</li>`).join('')}
              </ol>
            </section>

            <section style="margin-bottom: 2.5rem;">
              <h2 style="font-size: 1.6rem; color: #fff; margin-bottom: 1rem;">Key Benefits & Architectural Advantages</h2>
              <ul style="padding-left: 1.5rem; line-height: 1.9;">
                ${matchedTool.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
              </ul>
            </section>

            <section style="margin-bottom: 2.5rem;">
              <h2 style="font-size: 1.6rem; color: #fff; margin-bottom: 1rem;">Supported Formats & Size Limits</h2>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; background: rgba(30,41,59,0.5); padding: 1.25rem; border-radius: 8px;">
                <div>
                  <strong style="color: #fff; display: block; margin-bottom: 0.25rem;">Supported Formats</strong>
                  <span style="color: #94a3b8; font-size: 0.95rem;">${matchedTool.formats}</span>
                </div>
                <div>
                  <strong style="color: #fff; display: block; margin-bottom: 0.25rem;">File Limit</strong>
                  <span style="color: #94a3b8; font-size: 0.95rem;">${matchedTool.limits}</span>
                </div>
              </div>
            </section>

            <!-- FAQ Section -->
            <section style="margin-bottom: 2.5rem;">
              <h2 style="font-size: 1.6rem; color: #fff; margin-bottom: 1.25rem;">Frequently Asked Questions</h2>
              <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${matchedTool.faqs.map(faq => `
                  <div style="background: rgba(30,41,59,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 1.25rem;">
                    <h3 style="color: #fff; font-size: 1.1rem; margin-bottom: 0.5rem;">${faq.q}</h3>
                    <p style="color: #94a3b8; font-size: 0.95rem; margin: 0; line-height: 1.6;">${faq.a}</p>
                  </div>
                `).join('')}
              </div>
            </section>

            <!-- Related Tools Section -->
            <section>
              <h2 style="font-size: 1.6rem; color: #fff; margin-bottom: 1.25rem;">Related PDF Tools</h2>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
                ${relatedTools.map(rel => `
                  <a href="/${rel.id}" style="background: rgba(30,41,59,0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1rem; text-decoration: none; color: inherit;">
                    <strong style="color: #fff; display: block; font-size: 1rem; margin-bottom: 0.25rem;">${rel.title}</strong>
                    <span style="color: #818cf8; font-size: 0.85rem; font-weight: 600;">Open &rarr;</span>
                  </a>
                `).join('')}
              </div>
            </section>
          </article>
        </main>
        ${footerHtml}
      `;
    } else {
      // Unrecognized path -> 404
      return renderSsrPage('/404', templateHtml);
    }
  }

  // Inject into templateHtml
  let rendered = templateHtml;

  // Replace Title
  rendered = rendered.replace(/<title>.*?<\/title>/is, `<title>${escapeHtml(title)}</title>`);

  // Head Meta Replacements & Injections
  const metaTags = `
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="keywords" content="${escapeHtml(keywords)}">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${escapeHtml(canonical)}">
    <meta property="og:type" content="${ogType}">
    <meta property="og:site_name" content="ImgDocs">
    <meta property="og:image" content="${SITE_URL}/og-preview.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${SITE_URL}/og-preview.png">
    ${jsonLdSchemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
  `;

  // Replace existing meta tags or inject before </head>
  rendered = rendered.replace(/<meta name="description".*?>/i, '');
  rendered = rendered.replace(/<meta name="keywords".*?>/i, '');
  rendered = rendered.replace(/<link rel="canonical".*?>/i, '');
  rendered = rendered.replace(/<\/head>/i, `${metaTags}\n</head>`);

  // Replace <div id="root">...</div> with server rendered body
  rendered = rendered.replace(/<div id="root">.*?<\/div>/is, `<div id="root">${bodyHtml}</div>`);

  return {
    type: 'html',
    status,
    html: rendered
  };
}
