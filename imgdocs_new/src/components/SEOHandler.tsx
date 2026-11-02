/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { toolsList } from '../data/toolsData';
import { blogPosts } from '../data/blogData';
import { SITE_URL, getPathFromTab } from '../lib/routes';

interface SEOHandlerProps {
  activeTab: string;
  activeBlogSlug: string | null;
}

export default function SEOHandler({ activeTab, activeBlogSlug }: SEOHandlerProps) {
  useEffect(() => {
    const currentPath = getPathFromTab(activeTab, activeBlogSlug);
    let title = 'ImgDocs | Secure Client-Side PDF Tools & Free Converter';
    let description = 'Optimize, compress, convert, merge, split, rotate, and eSign PDF files 100% locally in your browser memory. No server uploads, absolute file privacy and security.';
    let canonical = `${SITE_URL}${currentPath === '/' ? '' : currentPath}`;
    let keywords = 'PDF converter, local PDF tools, secure PDF editor, client-side PDF, convert PDF to JPG, compress PDF, browser OCR, eSign PDF, split PDF, merge PDF';
    let schemas: any[] = [];

    // Base Organization & WebSite Schemas
    const orgSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      'name': 'ImgDocs Technologies',
      'url': SITE_URL,
      'logo': `${SITE_URL}/logo.png`,
      'sameAs': [
        'https://twitter.com/imgdocs',
        'https://github.com/imgdocs'
      ]
    };

    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      'name': 'ImgDocs',
      'url': SITE_URL,
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${SITE_URL}/?search={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };

    schemas.push(orgSchema, websiteSchema);

    if (activeTab === 'home') {
      title = 'ImgDocs | Secure Client-Side PDF Converter & Document Suite';
      description = 'Free high-quality PDF tools running entirely in your browser session. Compress, merge, split, and convert files safely without cloud uploads.';
      keywords = 'PDF converter, local PDF tools, secure PDF editor, client-side PDF, convert PDF to JPG, compress PDF, browser OCR, eSign PDF, split PDF, merge PDF, offline pdf converter';
    } else if (activeTab === 'blog') {
      title = 'ImgDocs Blog | Expert PDF & Document Productivity Tutorials';
      description = 'Read our comprehensive guides, safety instructions, and expert tips on document compression, encryption standards, and digital workflows.';
      keywords = 'pdf tutorials, secure document workflow, compression guides, local pdf encryption, how to convert pdf, docx editing safety';
      
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_URL },
          { '@type': 'ListItem', 'position': 2, 'name': 'Blog Library', 'item': canonical }
        ]
      });
    } else if (activeTab === 'blog-post' && activeBlogSlug) {
      const post = blogPosts.find(p => p.slug === activeBlogSlug);
      if (post) {
        title = `${post.title} | ImgDocs Library`;
        description = post.summary;
        keywords = `pdf guide, ${post.title.toLowerCase()}, secure file processing, document productivity tutorial`;

        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          'headline': post.title,
          'description': post.summary,
          'datePublished': post.date,
          'author': {
            '@type': 'Organization',
            'name': 'ImgDocs Editorial Team',
            'url': SITE_URL
          },
          'publisher': orgSchema,
          'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': canonical
          }
        });

        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_URL },
            { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': `${SITE_URL}/blog` },
            { '@type': 'ListItem', 'position': 3, 'name': post.title, 'item': canonical }
          ]
        });
      }
    } else if (activeTab === 'pricing') {
      title = 'Premium Subscription Pricing Plans | ImgDocs Pro & Business';
      description = 'Secure browser-native PDF tools. Choose ImgDocs Pro or Business to unlock unlimited document editing, high-fidelity OCR, and advanced collaborative features starting at just ₹249/mo.';
      keywords = 'imgdocs subscription, pdf suite pricing, document tools price, enterprise docx tools cost, team doc workspace, pro features';

      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': 'ImgDocs Premium Subscription',
        'description': 'Advanced secure document productivity suite with client-side conversions and smart team tools.',
        'brand': {
          '@type': 'Brand',
          'name': 'ImgDocs'
        },
        'offers': {
          '@type': 'AggregateOffer',
          'priceCurrency': 'INR',
          'lowPrice': '299',
          'highPrice': '7990',
          'offerCount': '4',
          'offers': [
            {
              '@type': 'Offer',
              'name': 'Pro Monthly',
              'price': '299',
              'priceCurrency': 'INR',
              'url': canonical
            },
            {
              '@type': 'Offer',
              'name': 'Pro Yearly',
              'price': '2499',
              'priceCurrency': 'INR',
              'url': canonical
            }
          ]
        }
      });

      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_URL },
          { '@type': 'ListItem', 'position': 2, 'name': 'Pricing Plans', 'item': canonical }
        ]
      });
    } else if (activeTab === 'html-sitemap') {
      title = 'HTML Sitemap & PDF Tools Index | ImgDocs Directory';
      description = 'Explore the full list of secure client-side PDF tools, document tutorials, company resources, and legal compliance pages on ImgDocs.';
      keywords = 'html sitemap, imgdocs page index, pdf tools list, convert pdf directory, document guides list';

      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_URL },
          { '@type': 'ListItem', 'position': 2, 'name': 'HTML Sitemap', 'item': canonical }
        ]
      });
    } else if (['about', 'contact', 'feature-requests', 'help', 'releases', 'api', 'careers'].includes(activeTab)) {
      const displayNames: Record<string, string> = {
        'about': 'About Us',
        'contact': 'Contact Us',
        'feature-requests': 'Feature Requests Board',
        'help': 'Help Center',
        'releases': 'Release Notes',
        'api': 'API Documentation',
        'careers': 'Careers & Opportunities'
      };
      const displayName = displayNames[activeTab] || 'Info Page';
      title = `${displayName} | ImgDocs Free PDF Suite`;
      description = `Learn more about our ${displayName.toLowerCase()} policies. ImgDocs provides browser-native tools to keep document conversions safe and instant.`;
      keywords = `imgdocs ${displayName.toLowerCase()}, pdf support, free document suite help, contact imgdocs`;

      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_URL },
          { '@type': 'ListItem', 'position': 2, 'name': displayName, 'item': canonical }
        ]
      });
    } else if (['privacy', 'terms', 'cookie', 'disclaimer', 'dmca', 'refund-policy'].includes(activeTab)) {
      const legalSeo: Record<string, { title: string; description: string; keywords: string }> = {
        'privacy': {
          title: 'Privacy Policy | ImgDocs Zero-Storage',
          description: 'Read the ImgDocs privacy policy: cookies, Google AdSense, DoubleClick DART cookie opt-outs, and our 1-hour automatic file deletion policy.',
          keywords: 'imgdocs privacy policy, cookies, google adsense, doubleclick cookie opt out, file auto deletion, gdpr compliance'
        },
        'terms': {
          title: 'Terms of Service | ImgDocs User Agreement',
          description: 'Review the ImgDocs Terms of Service covering acceptable use, software licensing, service warranties, and governing legal jurisdiction.',
          keywords: 'imgdocs terms of service, user agreement, acceptable use policy, software terms'
        },
        'cookie': {
          title: 'Cookie Policy | ImgDocs Privacy Hub',
          description: 'Understand how ImgDocs uses browser cookies and Google AdSense DART advertising cookies, with easy opt-out guidelines.',
          keywords: 'cookie policy, adsense cookies, dart cookie, disable cookies, browser storage'
        },
        'disclaimer': {
          title: 'Disclaimer Notice | ImgDocs Document Suite',
          description: 'ImgDocs legal disclaimer: informational purpose, user responsibility for document submissions, and third-party advertising notices.',
          keywords: 'disclaimer, legal notice, user responsibility, document converter disclaimer'
        },
        'dmca': {
          title: 'DMCA Policy | ImgDocs Copyright Notice',
          description: 'Our DMCA copyright compliance policy and notification procedures for editorial tutorials and technical documentation.',
          keywords: 'dmca policy, copyright compliance, takedown notice, imgdocs legal'
        },
        'refund-policy': {
          title: 'Refund Policy | ImgDocs Money-Back Guarantee',
          description: 'Learn about our 7-day money-back guarantee, premium subscription cancellations, and refund request procedures.',
          keywords: 'refund policy, cancellation policy, money back guarantee, subscription terms'
        }
      };
      const seo = legalSeo[activeTab] || {
        title: 'Legal Compliance | ImgDocs Hub',
        description: 'Review official ImgDocs legal terms, privacy commitments, and compliance policies.',
        keywords: 'imgdocs legal, compliance, terms, privacy'
      };
      title = seo.title;
      description = seo.description;
      keywords = seo.keywords;

      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_URL },
          { '@type': 'ListItem', 'position': 2, 'name': title.split('|')[0].trim(), 'item': canonical }
        ]
      });
    } else if (activeTab === '404') {
      title = 'Page Not Found (404) | ImgDocs';
      description = 'The requested page or PDF tool could not be found. Explore our complete directory of secure client-side PDF tools.';
      keywords = '404 page not found, imgdocs error';
    } else {
      // PDF Tool
      const normalizedTab = activeTab.replace('_', '-');
      const tool = toolsList.find(t => t.id === activeTab || t.id === normalizedTab);
      if (tool) {
        const toolSeoData: Record<string, { title: string; description: string; keywords: string }> = {
          'jpg-to-pdf': {
            title: 'JPG to PDF Converter Free | Image to PDF - ImgDocs',
            description: 'Convert JPG, JPEG and PNG images to PDF online free in your browser. Fast, client-side, zero server uploads, 100% private.',
            keywords: 'jpg to pdf, convert jpg to pdf, image to pdf, free jpg to pdf converter, convert image to pdf online'
          },
          'pdf-to-jpg': {
            title: 'PDF to JPG Converter Free | Extract Images - ImgDocs',
            description: 'Convert PDF pages to high-quality JPG images free online. Fast client-side extraction with zero upload latency and complete privacy.',
            keywords: 'pdf to jpg, convert pdf to jpg, pdf to jpg converter free, pdf to image, extract pdf pages'
          },
          'compress-pdf': {
            title: 'Compress PDF Online Free | Reduce PDF Size - ImgDocs',
            description: 'Compress PDF online for free without losing quality. Shrink heavy documents up to 90% for email attachments and portal submissions.',
            keywords: 'compress pdf online, reduce pdf size, pdf compressor free, compress pdf, shrink pdf file'
          },
          'pdf-to-word': {
            title: 'PDF to Word Converter Free | Convert to DOCX - ImgDocs',
            description: 'Convert PDF to Word DOCX online for free. Keeps tables, fonts and layout formatting intact with 100% private in-browser conversion.',
            keywords: 'pdf to word converter free, convert pdf to docx, pdf to word online, pdf to word, editable word docx'
          },
          'word-to-pdf': {
            title: 'Word to PDF Converter Free | DOCX to PDF - ImgDocs',
            description: 'Convert Microsoft Word DOCX documents to secure PDF online for free. Preserves layout, typography and margins with zero cloud uploads.',
            keywords: 'word to pdf converter free, convert docx to pdf, word to pdf online, doc to pdf, word to pdf'
          },
          'merge-pdf': {
            title: 'Merge PDF Online Free | Combine PDF Files - ImgDocs',
            description: 'Merge multiple PDF files into one document free online. Drag and drop to reorder pages with 100% client-side privacy and fast export.',
            keywords: 'merge pdf online, combine pdf, merge pdf free, join pdf files, pdf merger, combine pdf online'
          },
          'split-pdf': {
            title: 'Split PDF Online Free | Extract PDF Pages - ImgDocs',
            description: 'Split PDF files into separate pages or custom page ranges free online. Fast, secure in-browser extraction with zero server uploads.',
            keywords: 'split pdf online, extract pdf pages, split pdf free, separate pdf pages, pdf page splitter'
          },
          'protect-pdf': {
            title: 'Protect PDF with Password | Encrypt PDF - ImgDocs',
            description: 'Password protect PDF files with military-grade AES-256 encryption free online. Prevent unauthorized viewing, copying and printing.',
            keywords: 'protect pdf, password protect pdf, encrypt pdf free, secure pdf online, aes 256 pdf password'
          },
          'unlock-pdf': {
            title: 'Unlock PDF Online Free | Remove Password - ImgDocs',
            description: 'Unlock password-protected PDF files free online. Remove print, copy and editing restrictions instantly in your browser session.',
            keywords: 'unlock pdf, remove pdf password, decrypt pdf free, unlock pdf online, remove pdf restrictions'
          },
          'rotate-pdf': {
            title: 'Rotate PDF Pages Online Free | Align PDF - ImgDocs',
            description: 'Permanently rotate PDF pages clockwise or counter-clockwise online for free. Fix sideways or upside down scanned pages in seconds.',
            keywords: 'rotate pdf online, rotate pdf free, flip pdf pages, permanent pdf rotation, rotate upside down pdf'
          },
          'organize-pdf': {
            title: 'Organize PDF Pages Free | Rearrange PDF - ImgDocs',
            description: 'Rearrange, reorder and delete PDF pages visually online for free. Fast drag-and-drop storyboard editor running client-side.',
            keywords: 'organize pdf, rearrange pdf pages, reorder pdf, delete pdf pages, pdf storyboard'
          },
          'add-watermark': {
            title: 'Add Watermark to PDF Free | Stamp PDF - ImgDocs',
            description: 'Stamp custom text or image watermarks onto PDF pages online for free. Set opacity, position and angle with instant preview.',
            keywords: 'add watermark to pdf, stamp pdf, watermark pdf free, confidential stamp pdf'
          },
          'remove-pages': {
            title: 'Remove Pages from PDF Free | Delete Pages - ImgDocs',
            description: 'Delete unwanted pages from your PDF file online for free. Select pages to discard and download a lean, compact document.',
            keywords: 'remove pages from pdf, delete pdf pages, delete pages free, prune pdf'
          },
          'ocr-pdf': {
            title: 'OCR PDF Free | Extract Text from Scans - ImgDocs',
            description: 'Extract text from scanned PDF documents and images online for free using advanced Optical Character Recognition. 100% private.',
            keywords: 'ocr pdf, extract text from pdf, scanned pdf to text, optical character recognition free'
          },
          'html-to-pdf': {
            title: 'HTML to PDF Converter Free | Web to PDF - ImgDocs',
            description: 'Convert HTML code snippets or web URLs into clean, printable vector PDF documents online for free in your browser.',
            keywords: 'html to pdf, convert html to pdf, webpage to pdf, url to pdf free'
          },
          'excel-to-pdf': {
            title: 'Excel to PDF Converter Free | XLSX to PDF - ImgDocs',
            description: 'Convert Excel spreadsheets XLSX and CSV to PDF online for free. Locks formulas and auto-fits wide table grids to printable pages.',
            keywords: 'excel to pdf, convert excel to pdf, xlsx to pdf, spreadsheet to pdf, excel to pdf free'
          },
          'pdf-to-excel': {
            title: 'PDF to Excel Converter Free | PDF to XLSX - ImgDocs',
            description: 'Convert PDF tables into editable Excel XLSX and CSV spreadsheets free online. Accurate table detection and 100% private local processing.',
            keywords: 'pdf to excel converter free, convert pdf to excel, pdf to xlsx, pdf to csv, pdf table to excel'
          },
          'powerpoint-to-pdf': {
            title: 'PowerPoint to PDF Free | PPTX to PDF - ImgDocs',
            description: 'Convert PowerPoint PPTX presentation slides to vector PDF online for free. Keeps slide layouts, shapes and fonts intact.',
            keywords: 'powerpoint to pdf, convert pptx to pdf, ppt to pdf, slides to pdf free'
          },
          'pdf-to-powerpoint': {
            title: 'PDF to PowerPoint Free | Convert to PPTX - ImgDocs',
            description: 'Convert PDF presentations to editable PowerPoint PPTX slides free online. Maintains slide vector layouts and formatting with zero uploads.',
            keywords: 'pdf to powerpoint free, convert pdf to pptx, pdf to powerpoint, pdf to slides'
          },
          'esign-pdf': {
            title: 'eSign PDF Online Free | Sign PDF Free - ImgDocs',
            description: 'Draw or type your digital signature to sign contracts and legal PDF documents free online. 100% private in-browser signature stamping.',
            keywords: 'esign pdf, sign pdf free, digital signature pdf, sign pdf online, electronically sign pdf'
          },
          'crop-image': {
            title: 'Crop Image Online Free | Photo Cropper - ImgDocs',
            description: 'Crop JPG, PNG and WEBP photos with preset aspect ratios 1:1, 16:9, 4:3, 9:16 online for free. Zero server uploads, 100% private.',
            keywords: 'crop image online, free photo cropper, crop jpg png, square crop 1:1, banner crop 16:9'
          }
        };

        const seo = toolSeoData[tool.id];
        if (seo) {
          title = seo.title;
          description = seo.description;
          keywords = seo.keywords;
        } else {
          title = `${tool.title} | Free Client-Side Tool | ImgDocs`;
          description = tool.shortDescription;
          keywords = `${tool.title.toLowerCase()}, client side pdf, secure pdf tool, free pdf converter`;
        }

        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          'name': tool.title,
          'applicationCategory': 'BusinessApplication',
          'operatingSystem': 'Web, Windows, macOS, Android, iOS',
          'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD'
          },
          'description': tool.shortDescription,
          'browserRequirements': 'Requires HTML5, WebAssembly and modern browser support.'
        });

        if (tool.faqs && tool.faqs.length > 0) {
          schemas.push({
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
          });
        }

        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_URL },
            { '@type': 'ListItem', 'position': 2, 'name': tool.title, 'item': canonical }
          ]
        });
      }
    }

    // Update document title & meta tags
    document.title = title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords);

    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', activeTab === '404' ? 'noindex, follow' : 'index, follow');

    let metaAuthor = document.querySelector('meta[name="author"]');
    if (!metaAuthor) {
      metaAuthor = document.createElement('meta');
      metaAuthor.setAttribute('name', 'author');
      document.head.appendChild(metaAuthor);
    }
    metaAuthor.setAttribute('content', 'ImgDocs Technologies');

    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTheme);
    }
    metaTheme.setAttribute('content', '#ef4444');

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical);

    // OpenGraph
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', description);

    let ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) {
      ogImage = document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      document.head.appendChild(ogImage);
    }
    ogImage.setAttribute('content', `${SITE_URL}/og-image.png`);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('content', canonical);

    let ogType = document.querySelector('meta[property="og:type"]');
    if (!ogType) {
      ogType = document.createElement('meta');
      ogType.setAttribute('property', 'og:type');
      document.head.appendChild(ogType);
    }
    ogType.setAttribute('content', activeTab === 'blog-post' ? 'article' : 'website');

    let ogSiteName = document.querySelector('meta[property="og:site_name"]');
    if (!ogSiteName) {
      ogSiteName = document.createElement('meta');
      ogSiteName.setAttribute('property', 'og:site_name');
      document.head.appendChild(ogSiteName);
    }
    ogSiteName.setAttribute('content', 'ImgDocs');

    // Twitter Card
    let twitterCard = document.querySelector('meta[name="twitter:card"]');
    if (!twitterCard) {
      twitterCard = document.createElement('meta');
      twitterCard.setAttribute('name', 'twitter:card');
      document.head.appendChild(twitterCard);
    }
    twitterCard.setAttribute('content', 'summary_large_image');

    let twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (!twitterTitle) {
      twitterTitle = document.createElement('meta');
      twitterTitle.setAttribute('name', 'twitter:title');
      document.head.appendChild(twitterTitle);
    }
    twitterTitle.setAttribute('content', title);

    let twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (!twitterDesc) {
      twitterDesc = document.createElement('meta');
      twitterDesc.setAttribute('name', 'twitter:description');
      document.head.appendChild(twitterDesc);
    }
    twitterDesc.setAttribute('content', description);

    let twitterImg = document.querySelector('meta[name="twitter:image"]');
    if (!twitterImg) {
      twitterImg = document.createElement('meta');
      twitterImg.setAttribute('name', 'twitter:image');
      document.head.appendChild(twitterImg);
    }
    twitterImg.setAttribute('content', `${SITE_URL}/og-image.png`);

    // Remove old JSON-LD scripts
    const oldScripts = document.querySelectorAll('script[id^="jsonld-schema-"]');
    oldScripts.forEach(s => s.remove());

    // Inject new JSON-LD scripts
    schemas.forEach((schemaData, idx) => {
      const script = document.createElement('script');
      script.id = `jsonld-schema-${idx}`;
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schemaData);
      document.head.appendChild(script);
    });

  }, [activeTab, activeBlogSlug]);

  return null;
}
