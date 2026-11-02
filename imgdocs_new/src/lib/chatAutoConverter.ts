/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';

export interface ConvertedFileResult {
  id: string;
  originalName: string;
  outputName: string;
  outputType: string;
  size: string;
  downloadUrl: string;
  previewUrl?: string;
  formatIcon?: string;
  actionLabel: string;
  summary: string;
  bytesSaved?: string;
}

export interface ChatConversionWidget {
  targetFormat: 'pdf' | 'jpg' | 'png' | 'webp' | 'txt' | 'csv' | 'json';
  title: string;
  promptHint: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Converts pure text/markdown or notes into a formatted PDF document.
 */
export async function convertTextToPdf(
  rawText: string,
  docTitle = 'ImgDocs Export'
): Promise<{ blob: Blob; url: string; size: string; name: string }> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Accent Stripe
  doc.setFillColor(79, 70, 229); // indigo-600
  doc.rect(0, 24, pageWidth, 2, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('ImgDocs Smart Document', margin, 15);

  // Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  const nowStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  doc.text(nowStr, pageWidth - margin, 15, { align: 'right' });

  // Document Title
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(docTitle, margin, 38);

  let currentY = 46;

  // Clean Markdown & format text lines
  const cleanLines = rawText.split('\n');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);

  for (let i = 0; i < cleanLines.length; i++) {
    const rawLine = cleanLines[i].trimEnd();
    
    // Empty line / paragraph gap
    if (!rawLine.trim()) {
      currentY += 4;
      if (currentY > pageHeight - margin) {
        doc.addPage();
        currentY = margin + 10;
      }
      continue;
    }

    // Heading lines (# Heading)
    if (rawLine.startsWith('# ') || rawLine.startsWith('## ') || rawLine.startsWith('### ')) {
      currentY += 3;
      const hText = rawLine.replace(/^#+\s*/, '');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      
      const splitH = doc.splitTextToSize(hText, contentWidth);
      for (const sh of splitH) {
        if (currentY > pageHeight - margin) {
          doc.addPage();
          currentY = margin + 10;
        }
        doc.text(sh, margin, currentY);
        currentY += 6;
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      continue;
    }

    // Bullet points
    if (rawLine.startsWith('- ') || rawLine.startsWith('* ') || rawLine.startsWith('• ')) {
      const bText = '• ' + rawLine.replace(/^[-*•]\s*/, '');
      const splitBullet = doc.splitTextToSize(bText, contentWidth - 4);
      for (const sb of splitBullet) {
        if (currentY > pageHeight - margin) {
          doc.addPage();
          currentY = margin + 10;
        }
        doc.text(sb, margin + 2, currentY);
        currentY += 5;
      }
      continue;
    }

    // Regular text with word wrapping
    const wrapped = doc.splitTextToSize(rawLine, contentWidth);
    for (const w of wrapped) {
      if (currentY > pageHeight - margin) {
        doc.addPage();
        currentY = margin + 10;
      }
      doc.text(w, margin, currentY);
      currentY += 5;
    }
  }

  // Footer on all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated automatically by Ask ImgDocs • Page ${p} of ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
  }

  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  const safeName = docTitle.toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 30) || 'converted_document';
  const finalName = `${safeName}.pdf`;

  return {
    blob: pdfBlob,
    url,
    size: formatBytes(pdfBlob.size),
    name: finalName
  };
}

/**
 * Converts an image file (JPG, PNG, WebP, GIF) to a high-definition PDF document.
 */
export async function convertImageToPdf(
  imageSource: File | Blob | string,
  suggestedName = 'image'
): Promise<{ blob: Blob; url: string; size: string; name: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const handleImgLoad = () => {
      try {
        const doc = new jsPDF({
          orientation: img.width > img.height ? 'landscape' : 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10;
        const maxW = pageWidth - margin * 2;
        const maxH = pageHeight - margin * 2;

        const ratio = Math.min(maxW / img.width, maxH / img.height);
        const drawW = img.width * ratio;
        const drawH = img.height * ratio;
        const posX = (pageWidth - drawW) / 2;
        const posY = (pageHeight - drawH) / 2;

        // Draw image onto PDF
        doc.addImage(img, 'JPEG', posX, posY, drawW, drawH, undefined, 'FAST');

        const pdfBlob = doc.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        const baseName = suggestedName.replace(/\.[^.]+$/, '') || 'converted_image';
        const finalName = `${baseName}.pdf`;

        resolve({
          blob: pdfBlob,
          url,
          size: formatBytes(pdfBlob.size),
          name: finalName
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image for PDF conversion.'));

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(imageSource);
    }
  });
}

/**
 * Converts image formats (e.g. JPG -> PNG, PNG -> JPG, WebP -> JPG).
 */
export async function convertImageFormat(
  imageSource: File | Blob | string,
  targetFormat: 'png' | 'jpeg' | 'webp',
  originalName = 'image.png'
): Promise<{ blob: Blob; url: string; size: string; name: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D context unavailable.');

        if (targetFormat === 'jpeg') {
          // Fill white background for JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        const mimeType = targetFormat === 'png' ? 'image/png' : targetFormat === 'webp' ? 'image/webp' : 'image/jpeg';
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Failed to create image blob.'));
          const url = URL.createObjectURL(blob);
          const ext = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
          const base = originalName.replace(/\.[^.]+$/, '') || 'converted_image';
          const name = `${base}.${ext}`;

          resolve({
            blob,
            url,
            size: formatBytes(blob.size),
            name
          });
        }, mimeType, 0.92);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error('Failed to load source image.'));

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(imageSource);
    }
  });
}

/**
 * Converts text into TXT, CSV, JSON or MD file.
 */
export function convertTextToFile(
  text: string,
  format: 'txt' | 'csv' | 'json' | 'md',
  baseName = 'exported_document'
): { blob: Blob; url: string; size: string; name: string } {
  let content = text;
  let mimeType = 'text/plain;charset=utf-8';

  if (format === 'json') {
    mimeType = 'application/json;charset=utf-8';
    try {
      // If not already valid JSON, wrap into clean object
      JSON.parse(text);
    } catch {
      content = JSON.stringify({
        title: baseName,
        createdAt: new Date().toISOString(),
        content: text.split('\n').filter(Boolean)
      }, null, 2);
    }
  } else if (format === 'csv') {
    mimeType = 'text/csv;charset=utf-8';
    // If text isn't CSV, turn lines into rows
    if (!text.includes(',')) {
      const rows = text.split('\n').map(l => `"${l.replace(/"/g, '""')}"`);
      content = 'Item\n' + rows.join('\n');
    }
  } else if (format === 'md') {
    mimeType = 'text/markdown;charset=utf-8';
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const safeBase = baseName.replace(/\.[^.]+$/, '') || 'document';
  const name = `${safeBase}.${format}`;

  return {
    blob,
    url,
    size: formatBytes(blob.size),
    name
  };
}

/**
 * Core automatic detection and instant converter execution for chat.
 * Works seamlessly for 100% free and guest users without requiring sign-in!
 */
export async function performAutoChatConversion(
  prompt: string,
  attachedFile: File | null,
  attachedFileBase64?: string | null
): Promise<{
  convertedFile?: ConvertedFileResult;
  conversionWidget?: ChatConversionWidget;
  messageText: string;
} | null> {
  const cleanPrompt = prompt.trim();
  const lower = cleanPrompt.toLowerCase();

  const isConvertIntent = 
    lower.includes('convert') || 
    lower.includes('make pdf') || 
    lower.includes('save as pdf') || 
    lower.includes('create pdf') || 
    lower.includes('to pdf') || 
    lower.includes('to png') || 
    lower.includes('to jpg') || 
    lower.includes('to jpeg') || 
    lower.includes('to webp') || 
    lower.includes('to txt') || 
    lower.includes('to csv') || 
    lower.includes('to json') ||
    lower.includes('compress') ||
    lower.includes('extract text') ||
    lower.includes('ocr');

  // Case 1: An image file is attached and user wants to convert to PDF or another image format
  if (attachedFile && attachedFile.type.startsWith('image/')) {
    // 1A: Image -> PDF
    if (lower.includes('pdf') || lower.includes('convert') || cleanPrompt === '' || lower.includes('save') || lower.includes('document')) {
      try {
        const res = await convertImageToPdf(attachedFile, attachedFile.name);
        return {
          convertedFile: {
            id: 'conv_' + Date.now(),
            originalName: attachedFile.name,
            outputName: res.name,
            outputType: 'application/pdf',
            size: res.size,
            downloadUrl: res.url,
            formatIcon: 'pdf',
            actionLabel: 'Download PDF',
            summary: `✨ **Converted Automatically for Free!**\n\nYour image **${attachedFile.name}** was instantly transformed into a high-definition PDF document.`
          },
          messageText: `🎉 I have automatically converted **${attachedFile.name}** into a ready-to-download PDF for you! No sign-in required.`
        };
      } catch (err) {
        console.warn('Image to PDF auto-conversion error:', err);
      }
    }

    // 1B: Image -> PNG
    if (lower.includes('png')) {
      try {
        const res = await convertImageFormat(attachedFile, 'png', attachedFile.name);
        return {
          convertedFile: {
            id: 'conv_' + Date.now(),
            originalName: attachedFile.name,
            outputName: res.name,
            outputType: 'image/png',
            size: res.size,
            downloadUrl: res.url,
            formatIcon: 'image',
            actionLabel: 'Download PNG',
            summary: `✨ **Converted to PNG!**\n\nTransformed **${attachedFile.name}** to lossless PNG format.`
          },
          messageText: `🎉 Converted **${attachedFile.name}** into **${res.name}** (PNG)!`
        };
      } catch (err) {
        console.warn('Image format conversion error:', err);
      }
    }

    // 1C: Image -> JPG / JPEG
    if (lower.includes('jpg') || lower.includes('jpeg')) {
      try {
        const res = await convertImageFormat(attachedFile, 'jpeg', attachedFile.name);
        return {
          convertedFile: {
            id: 'conv_' + Date.now(),
            originalName: attachedFile.name,
            outputName: res.name,
            outputType: 'image/jpeg',
            size: res.size,
            downloadUrl: res.url,
            formatIcon: 'image',
            actionLabel: 'Download JPG',
            summary: `✨ **Converted to JPG!**\n\nOptimized **${attachedFile.name}** to high-efficiency JPEG format.`
          },
          messageText: `🎉 Converted **${attachedFile.name}** into **${res.name}** (JPG)!`
        };
      } catch (err) {
        console.warn('Image format conversion error:', err);
      }
    }

    // 1D: Image -> WebP
    if (lower.includes('webp')) {
      try {
        const res = await convertImageFormat(attachedFile, 'webp', attachedFile.name);
        return {
          convertedFile: {
            id: 'conv_' + Date.now(),
            originalName: attachedFile.name,
            outputName: res.name,
            outputType: 'image/webp',
            size: res.size,
            downloadUrl: res.url,
            formatIcon: 'image',
            actionLabel: 'Download WebP',
            summary: `✨ **Converted to WebP!**\n\nUltra-compressed **${attachedFile.name}** for lightning-fast web performance.`
          },
          messageText: `🎉 Converted **${attachedFile.name}** into **${res.name}** (WebP)!`
        };
      } catch (err) {
        console.warn('Image format conversion error:', err);
      }
    }
  }

  // Case 2: Attached Text / Document file or Raw typed text to PDF
  if (isConvertIntent && (lower.includes('to pdf') || lower.includes('make pdf') || lower.includes('save as pdf') || lower.includes('create pdf') || lower.includes('convert this text') || lower.includes('text to pdf') || lower.includes('generate pdf') || lower.includes('invoice') || lower.includes('receipt') || lower.includes('resume') || lower.includes('letter') || lower.includes('note') || lower.includes('summary'))) {
    // If text has content to convert
    const textContent = cleanPrompt
      .replace(/^convert\s+(?:this\s+)?(?:to\s+pdf|text\s+to\s+pdf|into\s+pdf)[:\s]*/i, '')
      .replace(/^make\s+(?:a\s+)?pdf\s+(?:of|for|from)?[:\s]*/i, '')
      .replace(/^create\s+(?:a\s+)?pdf\s+(?:of|for|from)?[:\s]*/i, '')
      .trim();

    if (textContent.length > 10 || attachedFile) {
      try {
        const bodyToConvert = textContent || (attachedFile ? `Attached File: ${attachedFile.name}\n\nProcessed by Ask ImgDocs` : cleanPrompt);
        const titleMatch = cleanPrompt.match(/(?:title|subject|for|about|named|called)\s+["']?([^"'\n,.]+)["']?/i);
        const title = titleMatch ? titleMatch[1].trim() : 'Document Summary & Report';

        const res = await convertTextToPdf(bodyToConvert, title);
        return {
          convertedFile: {
            id: 'conv_' + Date.now(),
            originalName: 'Text Notes / Prompt',
            outputName: res.name,
            outputType: 'application/pdf',
            size: res.size,
            downloadUrl: res.url,
            formatIcon: 'pdf',
            actionLabel: 'Download PDF',
            summary: `✨ **PDF Document Generated!**\n\nStructured, formatted and exported into a printable PDF document with professional margins and styling.`
          },
          messageText: `📄 I generated your custom PDF **"${res.name}"** directly from your chat prompt! Click below to download.`
        };
      } catch (err) {
        console.warn('Text to PDF auto-conversion error:', err);
      }
    }
  }

  // Case 3: Convert text to TXT, CSV, or JSON
  if (isConvertIntent && (lower.includes('to csv') || lower.includes('to json') || lower.includes('to txt') || lower.includes('to md') || lower.includes('to markdown'))) {
    const target = lower.includes('csv') ? 'csv' : lower.includes('json') ? 'json' : lower.includes('md') ? 'md' : 'txt';
    const textContent = cleanPrompt
      .replace(/^convert\s+(?:this\s+)?(?:to\s+[a-z]+)[:\s]*/i, '')
      .trim() || cleanPrompt;

    const res = convertTextToFile(textContent, target, 'exported_data');
    return {
      convertedFile: {
        id: 'conv_' + Date.now(),
        originalName: 'Chat Prompt Data',
        outputName: res.name,
        outputType: `text/${target}`,
        size: res.size,
        downloadUrl: res.url,
        formatIcon: target,
        actionLabel: `Download ${target.toUpperCase()}`,
        summary: `✨ **Exported to ${target.toUpperCase()}!**\n\nFormatted your prompt content into a downloadable ${target.toUpperCase()} file.`
      },
      messageText: `📁 Successfully exported your data into **${res.name}**!`
    };
  }

  // Case 4: User typed a convert request like "convert jpg to pdf" or "convert png to jpg" without an attachment yet!
  // Return an interactive In-Chat Dropzone so they can convert instantly right in this chat bubble!
  if (isConvertIntent && !attachedFile) {
    let targetFormat: 'pdf' | 'jpg' | 'png' | 'webp' | 'txt' | 'csv' | 'json' = 'pdf';
    let title = 'Convert File to PDF';
    let promptHint = 'Drop or select any JPG, PNG or document to convert to PDF instantly';

    if (lower.includes('png')) {
      targetFormat = 'png';
      title = 'Convert to PNG';
      promptHint = 'Drop any image to convert to PNG format instantly';
    } else if (lower.includes('jpg') || lower.includes('jpeg')) {
      targetFormat = 'jpg';
      title = 'Convert to JPG';
      promptHint = 'Drop any image to convert to JPG format instantly';
    } else if (lower.includes('webp')) {
      targetFormat = 'webp';
      title = 'Convert to WebP';
      promptHint = 'Drop any image to convert to WebP format';
    } else if (lower.includes('txt') || lower.includes('text')) {
      targetFormat = 'txt';
      title = 'Extract to Text';
      promptHint = 'Drop any document or image to extract text (OCR)';
    }

    return {
      conversionWidget: {
        targetFormat,
        title,
        promptHint
      },
      messageText: `⚡ **Quick Instant Converter:**\n\nYou can convert files right inside this chat without signing in! Select or drop your file below to get an instant automatic download:`
    };
  }

  return null;
}
