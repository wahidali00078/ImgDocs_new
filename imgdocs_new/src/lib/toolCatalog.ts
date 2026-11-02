/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ToolCatalogItem {
  id: string;
  name: string;
  tabId: string;
  path: string;
  category: 'Convert to PDF' | 'Convert from PDF' | 'Optimize & Edit' | 'Security & Sign' | 'Platform & Account' | 'Company & Legal';
  iconName: string;
  shortDesc: string;
  fullDesc: string;
  isPremium?: boolean;
  limits: string;
  formats: string;
  steps: string[];
  keywords: string[];
  supportsInChat?: boolean;
}

export const TOOL_CATALOG: ToolCatalogItem[] = [
  {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF Converter',
    tabId: 'jpg_to_pdf',
    path: '/jpg-to-pdf',
    category: 'Convert to PDF',
    iconName: 'Image',
    shortDesc: 'Convert JPG, JPEG, and PNG images into professionally structured PDF files instantly in your browser.',
    fullDesc: 'Convert any image (JPG, PNG, WEBP, BMP, GIF, SVG) into clean, high-resolution PDF documents with customizable page sizes (A4, Letter, Fit Page), margins, and orientation.',
    limits: 'Max 25 files per compilation, up to 50MB per image. 100% private browser compilation.',
    formats: 'JPG, JPEG, PNG, WEBP, BMP, GIF, SVG',
    steps: [
      'Upload your JPG, PNG, or WEBP image files.',
      'Reorder or rotate pages in the thumbnail storyboard.',
      'Select page format (A4, Letter, or Fit), orientation, and margins.',
      'Click "Generate PDF" to compile your document instantly.',
      'Download your finished PDF without server uploads.'
    ],
    keywords: ['jpg to pdf', 'image to pdf', 'photo to pdf', 'jpeg to pdf', 'png to pdf', 'webp to pdf', 'convert photo', 'picture to pdf', 'combine photos to pdf', 'images to pdf'],
    supportsInChat: true
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG Extractor',
    tabId: 'pdf_to_jpg',
    path: '/pdf-to-jpg',
    category: 'Convert from PDF',
    iconName: 'FileImage',
    shortDesc: 'Decompile PDF documents and extract every single page into separate high-resolution JPG images.',
    fullDesc: 'Extract individual pages or entire documents as crisp JPG images or download them all packed into a single ZIP archive without uploading to remote servers.',
    limits: 'Max 100MB PDF files. Instant client-side rasterization via WebAssembly and PDF.js.',
    formats: 'PDF (.pdf)',
    steps: [
      'Select or drop your PDF document.',
      'Preview individual rendered page thumbnails.',
      'Click "Download All as ZIP" or save individual high-res JPG cards.',
      'Extract slides, graphics, or pages in seconds.'
    ],
    keywords: ['pdf to jpg', 'pdf to image', 'extract pages as photos', 'pdf to png', 'pdf to pictures', 'export pdf pages', 'decompile pdf', 'pdf as jpeg'],
    supportsInChat: true
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF & Image',
    tabId: 'compress',
    path: '/compress-pdf',
    category: 'Optimize & Edit',
    iconName: 'Minimize2',
    shortDesc: 'Compress PDF and image file sizes by optimizing quality, dimensions, and compression ratios locally.',
    fullDesc: 'Shrink oversized PDFs, JPGs, and PNGs to meet email limits (under 25MB) or government portal restrictions (under 2MB) with side-by-side quality inspection.',
    limits: 'Max 100MB per file. Choose Low, Medium, or High compression.',
    formats: 'PDF, JPG, JPEG, PNG, WEBP',
    steps: [
      'Upload the PDF or image file you wish to optimize.',
      'Choose your target compression profile (Low, Medium, High).',
      'Preview the estimated file size reduction in real time.',
      'Click "Compress" and download your lightweight file.'
    ],
    keywords: ['compress pdf', 'reduce file size', 'shrink pdf', 'compress image', 'make pdf smaller', 'reduce mb', 'optimize pdf', 'compress photo', 'reduce pdf size'],
    supportsInChat: true
  },
  {
    id: 'crop-image',
    name: 'Crop Image & Photo Editor',
    tabId: 'crop_image',
    path: '/crop-image',
    category: 'Optimize & Edit',
    iconName: 'Crop',
    shortDesc: 'Crop JPG, PNG, and WEBP images with aspect ratio presets (1:1, 16:9, 4:3, 9:16, Freeform) in browser RAM.',
    fullDesc: 'Interactive canvas photo cropper with zoom, rotation, freeform framing, social media aspect ratio presets, and multi-format export (JPG, PNG, WEBP, or direct PDF).',
    limits: 'Max 50MB per photo. Unlimited free crops with zero watermarks.',
    formats: 'JPG, JPEG, PNG, WEBP, BMP, GIF, SVG',
    steps: [
      'Select or drop your photo into the interactive canvas.',
      'Choose an aspect ratio (1:1 Square, 16:9 Banner, 9:16 Story, 4:3, Freeform).',
      'Drag crop handles, zoom, or rotate to frame your subject.',
      'Select export format (JPG, PNG, WEBP, or PDF).',
      'Click "Crop & Export Image" to save.'
    ],
    keywords: ['crop image', 'crop photo', 'photo cropper', 'trim image', 'aspect ratio', 'square photo', 'avatar cropper', 'banner crop', 'resize crop', 'cut image', 'edit photo'],
    supportsInChat: true
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word Converter',
    tabId: 'pdf-to-word',
    path: '/pdf-to-word',
    category: 'Convert from PDF',
    iconName: 'FileText',
    shortDesc: 'Convert PDF documents into editable Word files (.docx) with layouts, paragraphs, and tables preserved.',
    fullDesc: 'Transform locked PDF contracts, resumes, and reports into editable Microsoft Word (.docx) files compatible with Word, Google Docs, and Apple Pages.',
    limits: 'Max 50MB. Text flow and layout reconstruction in browser.',
    formats: 'PDF (.pdf)',
    steps: [
      'Upload your PDF file.',
      'Our engine reads the structural layout and text nodes.',
      'Click "Convert to Word" to assemble the editable .docx framework.',
      'Download your file and edit in Microsoft Word or Google Docs.'
    ],
    keywords: ['pdf to word', 'pdf to docx', 'convert pdf to word', 'editable pdf', 'pdf to doc', 'make pdf editable', 'turn pdf into word'],
    supportsInChat: false
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF Converter',
    tabId: 'word-to-pdf',
    path: '/word-to-pdf',
    category: 'Convert to PDF',
    iconName: 'FileCheck',
    shortDesc: 'Convert MS Word documents (.docx, .doc) into high-fidelity PDF files with locked formatting.',
    fullDesc: 'Lock in fonts, margins, tables, and styles before submitting contracts, resumes, or assignments to ensure identical layout across all devices.',
    limits: 'Max 50MB. Local document parsing and styling reproduction.',
    formats: 'DOCX, DOC',
    steps: [
      'Upload your Microsoft Word document (.docx or .doc).',
      'Our engine renders the document structure and page breaks.',
      'Click "Generate PDF" to compile your locked PDF.',
      'Download your PDF ready for printing or emailing.'
    ],
    keywords: ['word to pdf', 'docx to pdf', 'convert word to pdf', 'doc to pdf', 'save word as pdf'],
    supportsInChat: false
  },
  {
    id: 'merge-pdf',
    name: 'Merge PDF Files',
    tabId: 'merge-pdf',
    path: '/merge-pdf',
    category: 'Optimize & Edit',
    iconName: 'Layers',
    shortDesc: 'Combine multiple PDF files and organize pages into a single cohesive document.',
    fullDesc: 'Combine multiple invoices, reports, scanned pages, or chapters into one unified PDF with interactive page reordering and drag-and-drop sequencing.',
    limits: 'Max 20 PDF documents per merge. Up to 100MB combined.',
    formats: 'PDF (.pdf)',
    steps: [
      'Select two or more PDF files to combine.',
      'Drag cards to set the desired document order.',
      'Click "Merge PDFs Now" to concatenate the streams.',
      'Download your consolidated master PDF.'
    ],
    keywords: ['merge pdf', 'combine pdf', 'join pdfs', 'concatenate pdf', 'unite pdf', 'merge documents', 'combine files into one pdf'],
    supportsInChat: false
  },
  {
    id: 'split-pdf',
    name: 'Split PDF & Extract Pages',
    tabId: 'split-pdf',
    path: '/split-pdf',
    category: 'Optimize & Edit',
    iconName: 'Scissors',
    shortDesc: 'Separate one page or a whole set for easy conversion into independent PDF files.',
    fullDesc: 'Split large documents into individual chapters, extract specific page ranges (e.g. pages 3-7), or save every page as a standalone file.',
    limits: 'Max 100MB PDF. Fast browser-native page splitting.',
    formats: 'PDF (.pdf)',
    steps: [
      'Upload the multi-page PDF you wish to split.',
      'Specify page ranges (e.g., "1-3, 5, 8-10") or choose "Split All".',
      'Click "Split PDF" to generate new standalone documents.',
      'Download the individual files or a packaged ZIP.'
    ],
    keywords: ['split pdf', 'extract pages', 'separate pdf', 'cut pdf', 'extract range from pdf', 'divide pdf'],
    supportsInChat: false
  },
  {
    id: 'protect-pdf',
    name: 'Protect PDF with Password',
    tabId: 'protect-pdf',
    path: '/protect-pdf',
    category: 'Security & Sign',
    iconName: 'Lock',
    shortDesc: 'Encrypt your PDF with standard AES-256 password protection to prevent unauthorized access.',
    fullDesc: 'Add high-grade AES-256 user and owner encryption passwords to your confidential financial statements, legal contracts, or identity documents.',
    isPremium: true,
    limits: 'AES-256 encryption. Restrict printing, editing, and copying.',
    formats: 'PDF (.pdf)',
    steps: [
      'Upload the PDF file to encrypt.',
      'Enter a strong user password (required to view the file).',
      'Optionally set permission restrictions (prevent printing or copying).',
      'Click "Encrypt PDF" and save your password-protected file.'
    ],
    keywords: ['protect pdf', 'encrypt pdf', 'lock pdf', 'password protect pdf', 'secure pdf', 'add password to pdf'],
    supportsInChat: false
  },
  {
    id: 'unlock-pdf',
    name: 'Unlock & Decrypt PDF',
    tabId: 'unlock-pdf',
    path: '/unlock-pdf',
    category: 'Security & Sign',
    iconName: 'Unlock',
    shortDesc: 'Remove password and permissions security from authorized PDF documents.',
    fullDesc: 'Strip password protection and usage restrictions from PDF files when you know the password, creating an unencumbered version for easy sharing and printing.',
    isPremium: true,
    limits: 'Requires valid authorization password. Local decryption.',
    formats: 'PDF (.pdf)',
    steps: [
      'Upload your locked PDF document.',
      'Enter the known authorization password.',
      'Click "Unlock PDF" to remove the security wrapper.',
      'Download the permanently unlocked, readable PDF.'
    ],
    keywords: ['unlock pdf', 'decrypt pdf', 'remove password from pdf', 'unprotect pdf', 'open locked pdf'],
    supportsInChat: false
  },
  {
    id: 'rotate-pdf',
    name: 'Rotate PDF Pages',
    tabId: 'rotate-pdf',
    path: '/rotate-pdf',
    category: 'Optimize & Edit',
    iconName: 'RotateCw',
    shortDesc: 'Rotate upside-down or sideways pages 90°, 180°, or 270° clockwise.',
    fullDesc: 'Fix orientation issues on scanned papers, receipts, or contracts. Rotate individual pages or the entire document permanently.',
    limits: 'Max 100MB PDF. Interactive visual grid rotation.',
    formats: 'PDF (.pdf)',
    steps: [
      'Upload your misaligned PDF document.',
      'Click the rotate button on individual pages or use "Rotate All".',
      'Click "Save Rotated PDF" to re-encode orientation flags.',
      'Download your properly aligned document.'
    ],
    keywords: ['rotate pdf', 'fix orientation', 'turn pdf page', 'rotate pages', 'flip pdf', 'sideways pdf'],
    supportsInChat: false
  },
  {
    id: 'organize-pdf',
    name: 'Organize & Reorder PDF',
    tabId: 'organize-pdf',
    path: '/organize-pdf',
    category: 'Optimize & Edit',
    iconName: 'Grid',
    shortDesc: 'Sort, add, delete, and reorder pages of a PDF document with drag and drop.',
    fullDesc: 'Interactive visual storyboard to rearrange page order, delete blank or unnecessary pages, and duplicate key sections before saving.',
    limits: 'Max 50MB PDF. Client-side visual page arranger.',
    formats: 'PDF (.pdf)',
    steps: [
      'Upload the PDF you want to re-sequence.',
      'Drag page cards to their new positions.',
      'Hover and click the trash icon on pages you want to delete.',
      'Click "Save Organized PDF" to download.'
    ],
    keywords: ['organize pdf', 'reorder pages', 'rearrange pdf', 'sort pdf pages', 'resequence pdf'],
    supportsInChat: false
  },
  {
    id: 'add-watermark',
    name: 'Add Watermark & Stamp',
    tabId: 'add-watermark',
    path: '/add-watermark',
    category: 'Optimize & Edit',
    iconName: 'Stamp',
    shortDesc: 'Stamp an image or text over your PDF pages with custom transparency, typography, and position.',
    fullDesc: 'Protect intellectual property with custom "CONFIDENTIAL", "DRAFT", company logos, or copyright watermarks stamped directly onto PDF layers.',
    limits: 'Max 50MB PDF. Text and image overlay controls.',
    formats: 'PDF (.pdf)',
    steps: [
      'Upload your PDF document.',
      'Choose text watermark (type custom text) or upload a logo PNG.',
      'Adjust font, size, rotation angle, opacity, and positioning.',
      'Click "Apply Watermark" and download.'
    ],
    keywords: ['watermark pdf', 'add watermark', 'stamp pdf', 'confidential stamp', 'logo overlay on pdf', 'copyright stamp'],
    supportsInChat: false
  },
  {
    id: 'remove-pages',
    name: 'Remove & Delete Pages',
    tabId: 'remove-pages',
    path: '/remove-pages',
    category: 'Optimize & Edit',
    iconName: 'Trash2',
    shortDesc: 'Select and remove unwanted, blank, or duplicate pages from your PDF document.',
    fullDesc: 'Quickly strip out cover pages, advertising sheets, blank pages, or outdated appendixes from any PDF in one click.',
    limits: 'Max 50MB PDF. Local page removal.',
    formats: 'PDF (.pdf)',
    steps: [
      'Upload your PDF file.',
      'Click to select or highlight the pages you wish to eliminate.',
      'Click "Remove Selected Pages".',
      'Download your streamlined PDF file.'
    ],
    keywords: ['remove pages', 'delete pages from pdf', 'strip blank pages', 'cut pages out', 'delete page'],
    supportsInChat: false
  },
  {
    id: 'ocr-pdf',
    name: 'OCR Text Extraction',
    tabId: 'ocr-pdf',
    path: '/ocr-pdf',
    category: 'Optimize & Edit',
    iconName: 'ScanText',
    shortDesc: 'Extract text from scanned PDFs, receipts, and photos with AI optical character recognition.',
    fullDesc: 'Convert non-searchable scanned documents, photo receipts, or book pages into fully searchable, editable, and copyable text nodes.',
    isPremium: true,
    limits: 'High-accuracy OCR for multiple languages.',
    formats: 'PDF, JPG, PNG, WEBP',
    steps: [
      'Upload your scanned PDF or photo receipt.',
      'Select document language (English, Spanish, German, French, etc.).',
      'Click "Run OCR Extraction" to process text layers.',
      'Copy the extracted text or download as TXT / searchable PDF.'
    ],
    keywords: ['ocr', 'extract text', 'ocr pdf', 'scan to text', 'image to text', 'optical character recognition', 'read text from photo', 'copy text from image'],
    supportsInChat: true
  },
  {
    id: 'html-to-pdf',
    name: 'HTML & Webpage to PDF',
    tabId: 'html-to-pdf',
    path: '/html-to-pdf',
    category: 'Convert to PDF',
    iconName: 'Globe',
    shortDesc: 'Convert webpage URLs and raw HTML/CSS code snippets into printable PDF documents.',
    fullDesc: 'Archive live web pages, articles, receipts, and invoices with full CSS styling, images, and links preserved in a printable PDF.',
    limits: 'Standard HTML5, CSS3, and URL rendering.',
    formats: 'URL, HTML, HTM',
    steps: [
      'Enter the live webpage URL or paste your HTML code.',
      'Select page orientation and print margins.',
      'Click "Generate Webpage PDF".',
      'Download your archived vector web document.'
    ],
    keywords: ['html to pdf', 'url to pdf', 'webpage to pdf', 'website to pdf', 'save webpage as pdf', 'convert link to pdf'],
    supportsInChat: false
  },
  {
    id: 'excel-to-pdf',
    name: 'Excel to PDF Converter',
    tabId: 'excel-to-pdf',
    path: '/excel-to-pdf',
    category: 'Convert to PDF',
    iconName: 'Table',
    shortDesc: 'Convert Excel spreadsheets (.xlsx, .xls, .csv) into clean, printable PDF documents.',
    fullDesc: 'Lock spreadsheet rows, columns, and calculations into professional tabular PDF formats without formatting glitches.',
    isPremium: true,
    limits: 'Max 50MB. Automatic landscape column scaling.',
    formats: 'XLSX, XLS, CSV',
    steps: [
      'Upload your Excel or CSV spreadsheet.',
      'Preview table pagination and column formatting.',
      'Select orientation (Landscape recommended for wide sheets).',
      'Click "Generate PDF" to download your structured document.'
    ],
    keywords: ['excel to pdf', 'xlsx to pdf', 'csv to pdf', 'spreadsheet to pdf', 'sheets to pdf', 'xls to pdf'],
    supportsInChat: false
  },
  {
    id: 'powerpoint-to-pdf',
    name: 'PowerPoint to PDF Converter',
    tabId: 'powerpoint-to-pdf',
    path: '/powerpoint-to-pdf',
    category: 'Convert to PDF',
    iconName: 'Presentation',
    shortDesc: 'Convert PowerPoint slide decks (.pptx, .ppt) into standard PDF presentation handouts.',
    fullDesc: 'Turn slide decks and keynote presentations into universal PDF format for pitching, sharing, or printing without PowerPoint installed.',
    isPremium: true,
    limits: 'Max 75MB. Widescreen 16:9 and standard 4:3 preservation.',
    formats: 'PPTX, PPT',
    steps: [
      'Upload your presentation deck (.pptx or .ppt).',
      'Check slide sequence and layout.',
      'Click "Convert to PDF".',
      'Download your locked presentation PDF.'
    ],
    keywords: ['powerpoint to pdf', 'pptx to pdf', 'ppt to pdf', 'slides to pdf', 'presentation to pdf', 'convert slides'],
    supportsInChat: false
  },
  {
    id: 'esign-pdf',
    name: 'eSign PDF Document',
    tabId: 'esign-pdf',
    path: '/esign-pdf',
    category: 'Security & Sign',
    iconName: 'PenTool',
    shortDesc: 'Draw, type, or upload your signature to sign contracts and documents securely online.',
    fullDesc: 'Sign leases, NDA agreements, tax forms, and proposals in seconds with an offline-first signature pad. Draw, type cursive, or upload signature images.',
    isPremium: true,
    limits: '100% private browser cryptographic signing. No signature uploads to servers.',
    formats: 'PDF (.pdf)',
    steps: [
      'Upload the PDF contract or agreement.',
      'Draw your signature freehand, type with cursive font, or upload a PNG.',
      'Drag and scale the signature box onto the designated signature line.',
      'Click "Apply Signature" to flatten it permanently into the vector PDF.',
      'Download your legally signed document.'
    ],
    keywords: ['esign', 'sign pdf', 'sign document', 'digital signature', 'electronic signature', 'sign contract', 'sign lease', 'add signature to pdf'],
    supportsInChat: false
  },
  {
    id: 'pricing',
    name: 'Pricing & Pro Subscription',
    tabId: 'pricing',
    path: '/pricing',
    category: 'Platform & Account',
    iconName: 'Crown',
    shortDesc: 'Explore Free, Pro Monthly, Pro Yearly, and Business plans with unlimited high-speed conversions.',
    fullDesc: 'Upgrade to ImgDocs Premium Pro to unlock unlimited daily operations, all 24+ administrative tools, AES-256 encryption, eSignatures, OCR, and priority support.',
    limits: 'Transparent billing via Stripe and Razorpay with instant cancellation.',
    formats: 'Subscription Plans',
    steps: [
      'Choose between Monthly and Yearly billing (save 20% on yearly).',
      'Select Pro ($9.99/mo or ₹299/mo) or Business ($24.99/mo).',
      'Complete secure checkout via Stripe or Razorpay.',
      'Instant account upgrade with all features unlocked.'
    ],
    keywords: ['pricing', 'plans', 'pro plan', 'upgrade', 'subscription', 'cost', 'premium', 'buy pro', 'license', 'payment'],
    supportsInChat: false
  },
  {
    id: 'dashboard',
    name: 'User Account Dashboard',
    tabId: 'dashboard',
    path: '/dashboard',
    category: 'Platform & Account',
    iconName: 'UserCheck',
    shortDesc: 'Manage your active subscription plan, download payment invoices, and view conversion stats.',
    fullDesc: 'Your personal command center to review active subscription statuses, payment history, billing dates, and document usage statistics.',
    limits: 'Available for all registered free and premium accounts.',
    formats: 'Account Portal',
    steps: [
      'Sign in to your ImgDocs account.',
      'View your daily operations counter and active subscription tier.',
      'Download official PDF tax invoices for business accounting.',
      'Manage profile credentials and preferences.'
    ],
    keywords: ['dashboard', 'account', 'my profile', 'invoices', 'billing', 'subscription status', 'manage account', 'my documents'],
    supportsInChat: false
  },
  {
    id: 'tools',
    name: 'All Tools Directory',
    tabId: 'tools',
    path: '/tools',
    category: 'Platform & Account',
    iconName: 'Grid',
    shortDesc: 'Complete catalog of all 24+ document, image, conversion, and security tools.',
    fullDesc: 'Browse our complete suite of browser-native converters, optimizers, PDF editors, and security tools categorized by workflow.',
    limits: 'Free & Pro tools catalog.',
    formats: 'Interactive Directory',
    steps: [
      'Search by keyword or filter by category.',
      'Click any tool card to launch the tool immediately.'
    ],
    keywords: ['all tools', 'tools list', 'directory', 'list of tools', 'what tools', 'features list', 'toolbox'],
    supportsInChat: false
  },
  {
    id: 'security',
    name: 'Security & Privacy Architecture',
    tabId: 'security',
    path: '/security',
    category: 'Company & Legal',
    iconName: 'ShieldCheck',
    shortDesc: 'Learn how ImgDocs client-side WebAssembly guarantees zero server uploads and 100% GDPR/HIPAA compliance.',
    fullDesc: 'In-depth technical whitepaper on our local browser-first architecture, sandboxed memory isolation, and cryptographic security protocols.',
    limits: 'Technical documentation and compliance whitepaper.',
    formats: 'Security Architecture',
    steps: [
      'Read our zero-trust local execution principles.',
      'Review GDPR, CCPA, and HIPAA compliance guarantees.'
    ],
    keywords: ['security', 'privacy', 'is it safe', 'gdpr', 'hipaa', 'wasm', 'webassembly', 'data privacy', 'how safe is imgdocs'],
    supportsInChat: false
  },
  {
    id: 'help',
    name: 'Help Center & Knowledge Base',
    tabId: 'help',
    path: '/help',
    category: 'Company & Legal',
    iconName: 'HelpCircle',
    shortDesc: 'Comprehensive guides, troubleshooting FAQs, tutorials, and support assistance.',
    fullDesc: 'Find answers to common questions about PDF generation, browser memory limits, file troubleshooting, and payment support.',
    limits: '24/7 self-service knowledge base.',
    formats: 'Support Hub',
    steps: [
      'Search troubleshooting topics and step-by-step guides.',
      'Submit a support inquiry if you need assistance.'
    ],
    keywords: ['help', 'help center', 'support', 'faq', 'troubleshooting', 'how to use', 'questions', 'guide'],
    supportsInChat: false
  },
  {
    id: 'contact',
    name: 'Contact & Support',
    tabId: 'contact',
    path: '/contact',
    category: 'Company & Legal',
    iconName: 'Mail',
    shortDesc: 'Reach our engineering and customer support team directly with official 24-48h SLAs.',
    fullDesc: 'Submit feedback, report bugs, ask enterprise licensing questions, or reach out to support@imgdocs.me.',
    limits: 'Official response SLA within 24 to 48 hours.',
    formats: 'Contact Form',
    steps: [
      'Fill out the message form with your inquiry.',
      'Receive official email response within 24-48 business hours.'
    ],
    keywords: ['contact', 'contact us', 'support email', 'email support', 'report bug', 'customer service', 'talk to human'],
    supportsInChat: false
  },
  {
    id: 'blog',
    name: 'ImgDocs Engineering Blog',
    tabId: 'blog',
    path: '/blog',
    category: 'Company & Legal',
    iconName: 'BookOpen',
    shortDesc: 'In-depth tutorials, document workflow guides, and technical insights on WebAssembly.',
    fullDesc: 'Read our latest articles on web performance, document privacy, PDF optimization tricks, and OCR technology.',
    limits: 'Free educational guides and articles.',
    formats: 'Blog Articles',
    steps: [
      'Browse our curated collection of document optimization articles.',
      'Learn best practices for legal and corporate file management.'
    ],
    keywords: ['blog', 'articles', 'tutorials', 'guides', 'news', 'posts'],
    supportsInChat: false
  },
  {
    id: 'templates',
    name: 'Document Templates Library',
    tabId: 'templates',
    path: '/templates',
    category: 'Platform & Account',
    iconName: 'FileCheck',
    shortDesc: 'Curated library of standard legal, freelance, invoice, and business PDF document templates.',
    fullDesc: 'Free pre-structured templates for NDAs, freelance contractor agreements, commercial invoices, and resignation letters ready to customize.',
    limits: 'Free printable & customizable PDF templates.',
    formats: 'Templates',
    steps: [
      'Select a template category (Business, Legal, Invoices).',
      'Download or open in our editor to fill out and sign.'
    ],
    keywords: ['templates', 'pdf templates', 'nda template', 'invoice template', 'contract template', 'agreement sample'],
    supportsInChat: false
  },
  {
    id: 'api',
    name: 'Developer API Documentation',
    tabId: 'api',
    path: '/api',
    category: 'Platform & Account',
    iconName: 'Code',
    shortDesc: 'REST and client SDK documentation for programmatic PDF conversions and OCR extraction.',
    fullDesc: 'Documentation for integrating ImgDocs conversion pipelines, OCR engines, and PDF generation into your own applications.',
    limits: 'REST API endpoints and TypeScript SDK.',
    formats: 'Developer Docs',
    steps: [
      'Generate your developer API key.',
      'Follow integration code samples in cURL, Python, and Node.js.'
    ],
    keywords: ['api', 'developer', 'docs', 'api documentation', 'sdk', 'integrate', 'endpoints', 'rest api'],
    supportsInChat: false
  }
];

/**
 * Intelligent Intent & Tool Matching Engine
 */
export function matchToolOrPage(rawQuery: string): {
  item: ToolCatalogItem | null;
  isExplicitNavigation: boolean;
  confidence: number;
} {
  if (!rawQuery || typeof rawQuery !== 'string') {
    return { item: null, isExplicitNavigation: false, confidence: 0 };
  }

  const query = rawQuery.toLowerCase().trim();

  // Check explicit navigation triggers
  const navTriggers = [
    'open ', 'go to ', 'take me to ', 'redirect to ', 'redirect me to ', 
    'navigate to ', 'launch ', 'switch to ', 'show me ', 'bring me to ',
    'open the ', 'go to the ', 'load '
  ];

  let isExplicitNavigation = navTriggers.some(t => query.startsWith(t) || query.includes(' ' + t));

  // 1. Direct exact or high-priority matches
  for (const tool of TOOL_CATALOG) {
    if (query === tool.id || query === tool.name.toLowerCase() || query === tool.path) {
      return { item: tool, isExplicitNavigation: true, confidence: 1.0 };
    }

    // Direct match with keywords
    for (const kw of tool.keywords) {
      if (query === kw || query === `open ${kw}` || query === `go to ${kw}` || query === `take me to ${kw}` || query === `redirect to ${kw}`) {
        return { item: tool, isExplicitNavigation: true, confidence: 0.98 };
      }
    }
  }

  // 2. Specialized keyword matching
  let bestMatch: ToolCatalogItem | null = null;
  let highestScore = 0;

  for (const tool of TOOL_CATALOG) {
    let score = 0;

    // Check query containing keyword
    for (const kw of tool.keywords) {
      if (query.includes(kw)) {
        score = Math.max(score, kw.length > 5 ? 0.9 : 0.7);
      }
    }

    // Check specific name words
    const nameWords = tool.name.toLowerCase().split(' ');
    const matchedWords = nameWords.filter(w => w.length > 3 && query.includes(w));
    if (matchedWords.length >= 2) {
      score = Math.max(score, 0.85);
    } else if (matchedWords.length === 1 && score === 0) {
      score = Math.max(score, 0.5);
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = tool;
    }
  }

  // Check if query is something like "how to merge pdf" or "crop my photo"
  if (bestMatch && (query.includes('how to') || query.includes('how do i') || query.includes('can i') || query.includes('want to') || query.includes('need to') || query.includes('help me'))) {
    isExplicitNavigation = false; // It's an informational query with an actionable recommendation
  }

  return {
    item: highestScore >= 0.5 ? bestMatch : null,
    isExplicitNavigation,
    confidence: highestScore
  };
}

/**
 * Search tools for directory/recommendation lists
 */
export function searchToolsAndPages(filterText: string): ToolCatalogItem[] {
  const clean = filterText.toLowerCase().trim();
  if (!clean) return TOOL_CATALOG;

  return TOOL_CATALOG.filter(item => 
    item.name.toLowerCase().includes(clean) ||
    item.shortDesc.toLowerCase().includes(clean) ||
    item.category.toLowerCase().includes(clean) ||
    item.keywords.some(k => k.includes(clean))
  );
}
