/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { toolsList } from '../data/toolsData';
import { blogPosts } from '../data/blogData';

export const SITE_URL = 'https://www.imgdocs.me';

export interface RouteMetadata {
  path: string;
  tabId: string;
  blogSlug?: string;
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  category?: 'static' | 'tool' | 'blog' | 'legal';
}

// Mapping from tool ID / alias to clean path
export const TOOL_PATH_MAP: Record<string, string> = {
  'jpg-to-pdf': '/jpg-to-pdf',
  'jpg_to_pdf': '/jpg-to-pdf',
  'image-to-pdf': '/jpg-to-pdf',
  'pdf-to-jpg': '/pdf-to-jpg',
  'pdf_to_jpg': '/pdf-to-jpg',
  'image-converter': '/pdf-to-jpg',
  'compress-pdf': '/compress-pdf',
  'compress': '/compress-pdf',
  'image-compressor': '/compress-pdf',
  'pdf-to-word': '/pdf-to-word',
  'word-to-pdf': '/word-to-pdf',
  'merge-pdf': '/merge-pdf',
  'split-pdf': '/split-pdf',
  'extract-pages': '/split-pdf',
  'protect-pdf': '/protect-pdf',
  'unlock-pdf': '/unlock-pdf',
  'rotate-pdf': '/rotate-pdf',
  'organize-pdf': '/organize-pdf',
  'add-watermark': '/add-watermark',
  'remove-pages': '/remove-pages',
  'delete-pages': '/remove-pages',
  'ocr-pdf': '/ocr-pdf',
  'ocr': '/ocr-pdf',
  'html-to-pdf': '/html-to-pdf',
  'excel-to-pdf': '/excel-to-pdf',
  'pdf-to-excel': '/pdf-to-excel',
  'pdf_to_excel': '/pdf-to-excel',
  'powerpoint-to-pdf': '/powerpoint-to-pdf',
  'pdf-to-powerpoint': '/pdf-to-powerpoint',
  'pdf_to_powerpoint': '/pdf-to-powerpoint',
  'esign-pdf': '/esign-pdf',
  'crop-image': '/crop-image',
  'crop_image': '/crop-image',
  'image-cropper': '/crop-image',
  'crop-photo': '/crop-image'
};

// Aliases for legacy or shortened blog post URLs
export const BLOG_SLUG_ALIASES: Record<string, string> = {
  'how-to-compress-pdf': 'how-to-compress-pdf-without-losing-quality',
  'how-to-convert-pdf-to-word': 'how-to-convert-pdf-to-word-without-losing-formatting',
  'merge-pdf-online': 'how-to-merge-pdf-files-for-free',
  'protect-pdf-with-password': 'how-to-password-protect-a-pdf',
  'best-free-pdf-editors': 'is-it-safe-to-use-online-pdf-converters',
  'split-large-pdf-files': 'how-to-reduce-pdf-size-for-email',
  'jpg-to-pdf-mobile': 'how-to-convert-jpg-to-pdf-on-mobile',
  'split-pdf-guide': 'how-to-split-and-extract-pages-from-pdf'
};

// Static pages route map
export const STATIC_PATH_MAP: Record<string, string> = {
  'home': '/',
  'about': '/about',
  'contact': '/contact',
  'pricing': '/pricing',
  'blog': '/blog',
  'privacy': '/privacy-policy',
  'privacy-policy': '/privacy-policy',
  'terms': '/terms',
  'terms-and-conditions': '/terms',
  'terms-of-service': '/terms',
  'refund-policy': '/refund-policy',
  'cookie': '/cookie-policy',
  'cookie-policy': '/cookie-policy',
  'disclaimer': '/disclaimer',
  'dmca': '/dmca',
  'help': '/help',
  'releases': '/releases',
  'api': '/api',
  'careers': '/careers',
  'feature-requests': '/feature-requests',
  'dashboard': '/dashboard',
  'html-sitemap': '/html-sitemap',
  'sitemap': '/html-sitemap',
  'tools': '/tools',
  'all-tools': '/tools',
  'security': '/security',
  'reviews': '/reviews',
  'templates': '/templates'
};

// Parse current pathname + query string into activeTab, activeBlogSlug, and optional redirect path
export function resolveRoute(pathname: string, searchStr: string = ''): {
  activeTab: string;
  activeBlogSlug: string | null;
  redirectPath: string | null;
  isNotFound: boolean;
} {
  const params = new URLSearchParams(searchStr);
  const toolQuery = params.get('tool');
  const pageQuery = params.get('page');
  const blogQuery = params.get('blog');

  // Handle Legacy 301 Query Parameter Redirects
  if (toolQuery) {
    const targetPath = TOOL_PATH_MAP[toolQuery] || `/${toolQuery.replace('_', '-')}`;
    return {
      activeTab: toolQuery === 'jpg-to-pdf' ? 'jpg_to_pdf' : (toolQuery === 'pdf-to-jpg' ? 'pdf_to_jpg' : (toolQuery === 'compress-pdf' ? 'compress' : toolQuery)),
      activeBlogSlug: null,
      redirectPath: targetPath,
      isNotFound: false
    };
  }

  if (blogQuery) {
    return {
      activeTab: 'blog-post',
      activeBlogSlug: blogQuery,
      redirectPath: `/blog/${blogQuery}`,
      isNotFound: false
    };
  }

  if (pageQuery) {
    const targetPath = STATIC_PATH_MAP[pageQuery] || `/${pageQuery}`;
    return {
      activeTab: pageQuery === 'cookie-policy' ? 'cookie' : (pageQuery === 'privacy-policy' ? 'privacy' : pageQuery),
      activeBlogSlug: null,
      redirectPath: targetPath,
      isNotFound: false
    };
  }

  // Handle Clean Path Routes
  const cleanPath = pathname.replace(/\/$/, '') || '/';

  if (cleanPath === '/') {
    return { activeTab: 'home', activeBlogSlug: null, redirectPath: null, isNotFound: false };
  }

  if (cleanPath === '/about') return { activeTab: 'about', activeBlogSlug: null, redirectPath: null, isNotFound: false };
  if (cleanPath === '/contact') return { activeTab: 'contact', activeBlogSlug: null, redirectPath: null, isNotFound: false };
  if (cleanPath === '/pricing') return { activeTab: 'pricing', activeBlogSlug: null, redirectPath: null, isNotFound: false };
  if (cleanPath === '/blog') return { activeTab: 'blog', activeBlogSlug: null, redirectPath: null, isNotFound: false };
  if (cleanPath === '/privacy-policy' || cleanPath === '/privacy') return { activeTab: 'privacy', activeBlogSlug: null, redirectPath: cleanPath === '/privacy' ? '/privacy-policy' : null, isNotFound: false };
  if (cleanPath === '/terms' || cleanPath === '/terms-of-service') return { activeTab: 'terms', activeBlogSlug: null, redirectPath: cleanPath === '/terms-of-service' ? '/terms' : null, isNotFound: false };
  if (cleanPath === '/refund-policy') return { activeTab: 'refund-policy', activeBlogSlug: null, redirectPath: null, isNotFound: false };
  if (cleanPath === '/cookie-policy' || cleanPath === '/cookie') return { activeTab: 'cookie', activeBlogSlug: null, redirectPath: cleanPath === '/cookie' ? '/cookie-policy' : null, isNotFound: false };
  if (cleanPath === '/disclaimer') return { activeTab: 'disclaimer', activeBlogSlug: null, redirectPath: null, isNotFound: false };
  if (cleanPath === '/dmca') return { activeTab: 'dmca', activeBlogSlug: null, redirectPath: null, isNotFound: false };
  if (cleanPath === '/help') return { activeTab: 'help', activeBlogSlug: null, redirectPath: null, isNotFound: false };
  if (cleanPath === '/releases') return { activeTab: 'releases', activeBlogSlug: null, redirectPath: null, isNotFound: false };
  if (cleanPath === '/api') return { activeTab: 'api', activeBlogSlug: null, redirectPath: null, isNotFound: false };
  if (cleanPath === '/careers') return { activeTab: 'careers', activeBlogSlug: null, redirectPath: null, isNotFound: false };
  if (cleanPath === '/feature-requests') return { activeTab: 'feature-requests', activeBlogSlug: null, redirectPath: null, isNotFound: false };
  if (cleanPath === '/dashboard') return { activeTab: 'dashboard', activeBlogSlug: null, redirectPath: null, isNotFound: false };
  if (cleanPath === '/tools' || cleanPath === '/all-tools') return { activeTab: 'tools', activeBlogSlug: null, redirectPath: cleanPath === '/all-tools' ? '/tools' : null, isNotFound: false };
  if (cleanPath === '/security') return { activeTab: 'security', activeBlogSlug: null, redirectPath: null, isNotFound: false };
  if (cleanPath === '/reviews') return { activeTab: 'reviews', activeBlogSlug: null, redirectPath: null, isNotFound: false };
  if (cleanPath === '/templates') return { activeTab: 'templates', activeBlogSlug: null, redirectPath: null, isNotFound: false };
  if (cleanPath === '/html-sitemap' || cleanPath === '/sitemap') return { activeTab: 'html-sitemap', activeBlogSlug: null, redirectPath: cleanPath === '/sitemap' ? '/html-sitemap' : null, isNotFound: false };

  // Check Blog Post URLs (/blog/slug)
  if (cleanPath.startsWith('/blog/')) {
    const rawSlug = cleanPath.replace('/blog/', '');
    const canonicalSlug = BLOG_SLUG_ALIASES[rawSlug] || rawSlug;
    const postExists = blogPosts.some(b => b.slug === canonicalSlug);
    if (postExists) {
      return { 
        activeTab: 'blog-post', 
        activeBlogSlug: canonicalSlug, 
        redirectPath: BLOG_SLUG_ALIASES[rawSlug] ? `/blog/${canonicalSlug}` : null, 
        isNotFound: false 
      };
    } else {
      return { activeTab: '404', activeBlogSlug: null, redirectPath: null, isNotFound: true };
    }
  }

  // Check Tool URLs
  const rawToolId = Object.keys(TOOL_PATH_MAP).find(key => TOOL_PATH_MAP[key] === cleanPath);
  if (rawToolId) {
    let tabId = rawToolId;
    if (rawToolId === 'jpg-to-pdf' || rawToolId === 'image-to-pdf') tabId = 'jpg_to_pdf';
    if (rawToolId === 'pdf-to-jpg' || rawToolId === 'image-converter') tabId = 'pdf_to_jpg';
    if (rawToolId === 'compress-pdf' || rawToolId === 'image-compressor' || rawToolId === 'compress') tabId = 'compress';
    if (rawToolId === 'ocr') tabId = 'ocr-pdf';
    if (rawToolId === 'delete-pages') tabId = 'remove-pages';
    if (rawToolId === 'extract-pages') tabId = 'split-pdf';

    return { activeTab: tabId, activeBlogSlug: null, redirectPath: null, isNotFound: false };
  }

  // Direct tool check in toolsList
  const matchedTool = toolsList.find(t => `/${t.id}` === cleanPath);
  if (matchedTool) {
    return { activeTab: matchedTool.id, activeBlogSlug: null, redirectPath: null, isNotFound: false };
  }

  // Unmapped path -> 404
  return { activeTab: '404', activeBlogSlug: null, redirectPath: null, isNotFound: true };
}

// Convert activeTab & activeBlogSlug to clean URL path
export function getPathFromTab(activeTab: string, activeBlogSlug: string | null = null): string {
  if (activeTab === 'home') return '/';
  if (activeTab === 'blog') return '/blog';
  if (activeTab === 'blog-post' && activeBlogSlug) return `/blog/${activeBlogSlug}`;
  if (activeTab === 'jpg_to_pdf' || activeTab === 'jpg-to-pdf') return '/jpg-to-pdf';
  if (activeTab === 'pdf_to_jpg' || activeTab === 'pdf-to-jpg') return '/pdf-to-jpg';
  if (activeTab === 'compress' || activeTab === 'compress-pdf') return '/compress-pdf';
  if (activeTab === 'privacy') return '/privacy-policy';
  if (activeTab === 'cookie') return '/cookie-policy';
  if (STATIC_PATH_MAP[activeTab]) return STATIC_PATH_MAP[activeTab];
  if (TOOL_PATH_MAP[activeTab]) return TOOL_PATH_MAP[activeTab];
  return `/${activeTab}`;
}
