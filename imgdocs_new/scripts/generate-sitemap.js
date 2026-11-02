import fs from 'fs';
import path from 'path';

const today = new Date().toISOString().split('T')[0];
const SITE_URL = 'https://www.imgdocs.me';

const tools = [
  'jpg-to-pdf', 'pdf-to-jpg', 'compress-pdf', 'pdf-to-word', 'word-to-pdf',
  'merge-pdf', 'split-pdf', 'protect-pdf', 'unlock-pdf', 'rotate-pdf',
  'organize-pdf', 'add-watermark', 'remove-pages', 'ocr-pdf', 'html-to-pdf',
  'excel-to-pdf', 'powerpoint-to-pdf', 'esign-pdf'
];

const mainPages = [
  '/', '/about', '/contact', '/pricing', '/blog', '/help', '/releases',
  '/api', '/careers', '/feature-requests', '/html-sitemap', '/privacy-policy',
  '/terms', '/refund-policy', '/cookie-policy', '/disclaimer', '/dmca'
];

const blogSlugs = [
  'how-to-compress-pdf', 'how-to-convert-pdf-to-word', 'best-free-pdf-editors',
  'protect-pdf-with-password', 'merge-pdf-online', 'split-large-pdf-files',
  'ocr-guide', 'digital-signatures', 'pdf-tips', 'pdf-security',
  'word-to-pdf-formatting', 'rotate-pdf-pages', 'extract-jpg-from-pdf',
  'deep-dive-html-to-pdf', 'excel-to-pdf-reports', 'powerpoint-to-pdf-slides',
  'e-sign-vs-digital-signatures', 'safely-remove-pdf-pages', 'pdf-a-archiving-standards',
  'add-custom-watermarks', 'gdpr-compliance-pdf-tools', 'edit-scanned-documents',
  'top-pdf-chrome-extensions', 'compressing-images-web', 'design-portfolio-pdf',
  'evolution-of-pdf', 'sign-lease-on-phone', 'troubleshoot-pdf-corruption',
  'metadata-cleanup-guide', 'why-client-side-pdf-safe', 'pdf-optimization-seo-guide',
  'sign-pdf-safely-at-home', 'merge-jpg-to-pdf-tutorial', 'extract-text-from-scanned-pdf',
  'compress-pdf-without-quality-loss', 'protect-intellectual-property-pdf',
  'unlock-pdf-passwords-guide', 'rotate-all-pages-pdf', 'organize-pdf-pages-visually',
  'add-watermark-pdf-ownership', 'remove-blank-pages-pdf', 'convert-html-webpage-to-pdf',
  'convert-excel-sheets-to-pdf-neatly', 'convert-powerpoint-to-pdf-slides',
  'design-pdf-resumes-for-ats', 'pdf-accessibility-wcag-rules',
  'history-of-document-standards', 'sign-contracts-on-mobile-browsers',
  'repair-corrupted-pdf-files', 'clean-sensitive-metadata-scans',
  'why-offline-converters-prevent-leaks', 'best-practices-for-legal-pdfs',
  'compress-scanned-receipts-taxes', 'collaborative-document-workflows-privacy',
  'pdf-redaction-vs-blackout-security'
];

let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

// Main pages
for (const page of mainPages) {
  const loc = `${SITE_URL}${page === '/' ? '' : page}`;
  const priority = page === '/' ? '1.0' : (['/pricing', '/blog', '/html-sitemap'].includes(page) ? '0.9' : '0.8');
  xml += `  <url>\n`;
  xml += `    <loc>${loc}</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <changefreq>${page === '/' || page === '/blog' ? 'daily' : 'weekly'}</changefreq>\n`;
  xml += `    <priority>${priority}</priority>\n`;
  xml += `  </url>\n`;
}

// Tool pages
for (const tool of tools) {
  const loc = `${SITE_URL}/${tool}`;
  xml += `  <url>\n`;
  xml += `    <loc>${loc}</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <changefreq>weekly</changefreq>\n`;
  xml += `    <priority>0.9</priority>\n`;
  xml += `    <image:image>\n`;
  xml += `      <image:loc>${SITE_URL}/og-image.png</image:loc>\n`;
  xml += `      <image:title>ImgDocs ${tool} Tool</image:title>\n`;
  xml += `    </image:image>\n`;
  xml += `  </url>\n`;
}

// Blog pages
for (const slug of blogSlugs) {
  const loc = `${SITE_URL}/blog/${slug}`;
  xml += `  <url>\n`;
  xml += `    <loc>${loc}</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <changefreq>monthly</changefreq>\n`;
  xml += `    <priority>0.8</priority>\n`;
  xml += `  </url>\n`;
}

xml += `</urlset>`;

const publicPath = path.join(process.cwd(), 'public', 'sitemap.xml');
fs.writeFileSync(publicPath, xml, 'utf-8');
console.log('Successfully generated public/sitemap.xml!');
