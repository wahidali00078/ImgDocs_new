/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { toolsList } from '../data/toolsData';
import { blogPosts } from '../data/blogData';
import { SITE_URL, getPathFromTab } from './routes';

const today = new Date().toISOString().split('T')[0];

export function generateSitemapXml(): string {
  const mainPages = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/about', priority: '0.8', changefreq: 'monthly' },
    { path: '/contact', priority: '0.8', changefreq: 'monthly' },
    { path: '/pricing', priority: '0.9', changefreq: 'weekly' },
    { path: '/blog', priority: '0.9', changefreq: 'daily' },
    { path: '/help', priority: '0.7', changefreq: 'monthly' },
    { path: '/releases', priority: '0.7', changefreq: 'weekly' },
    { path: '/api', priority: '0.7', changefreq: 'monthly' },
    { path: '/careers', priority: '0.6', changefreq: 'monthly' },
    { path: '/feature-requests', priority: '0.7', changefreq: 'weekly' },
    { path: '/html-sitemap', priority: '0.8', changefreq: 'weekly' },
    { path: '/privacy-policy', priority: '0.5', changefreq: 'monthly' },
    { path: '/terms', priority: '0.5', changefreq: 'monthly' },
    { path: '/refund-policy', priority: '0.5', changefreq: 'monthly' },
    { path: '/cookie-policy', priority: '0.5', changefreq: 'monthly' },
    { path: '/disclaimer', priority: '0.5', changefreq: 'monthly' },
    { path: '/dmca', priority: '0.5', changefreq: 'monthly' }
  ];

  const toolPages = toolsList.map(t => ({
    path: getPathFromTab(t.id),
    priority: '0.9',
    changefreq: 'weekly'
  }));

  const blogPages = blogPosts.map(p => ({
    path: `/blog/${p.slug}`,
    priority: '0.8',
    changefreq: 'monthly'
  }));

  const allUrls = [...mainPages, ...toolPages, ...blogPages];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  for (const page of allUrls) {
    const loc = `${SITE_URL}${page.path === '/' ? '' : page.path}`;
    xml += `  <url>\n`;
    xml += `    <loc>${loc}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `    <image:image>\n`;
    xml += `      <image:loc>${SITE_URL}/og-image.png</image:loc>\n`;
    xml += `      <image:title>ImgDocs PDF Tools &amp; Document Suite</image:title>\n`;
    xml += `    </image:image>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}

export function writeSitemapFiles() {
  const sitemapContent = generateSitemapXml();
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent, 'utf-8');
}
