/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { UploadedImage, ConverterOptions } from '../types';

/**
 * Rotates an image using canvas and returns a high-quality JPEG data URL.
 */
export function getRotatedImageDataUrl(image: UploadedImage): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = image.src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(image.src);
        return;
      }

      // If rotation is 90 or 270, the dimensions are swapped
      const isRotated90 = (image.rotation / 90) % 2 !== 0;
      const width = isRotated90 ? img.height : img.width;
      const height = isRotated90 ? img.width : img.height;

      canvas.width = width;
      canvas.height = height;

      // Translate to center, rotate, and draw
      ctx.translate(width / 2, height / 2);
      ctx.rotate((image.rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      // Return high-quality JPEG representation
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => {
      resolve(image.src);
    };
  });
}

interface GenerationProgressCallback {
  (currentIndex: number, total: number, percentage: number): void;
}

/**
 * Core PDF generation procedure.
 * Builds either a merged single-file PDF or returns a ZIP of individual PDFs.
 */
export async function generatePdfFromImages(
  images: UploadedImage[],
  options: ConverterOptions,
  onProgress: GenerationProgressCallback
): Promise<{ blob: Blob; fileName: string }> {
  const total = images.length;
  
  if (options.merge) {
    // -------------------------------------------------------------
    // MERGED MULTI-PAGE PDF GENERATION
    // -------------------------------------------------------------
    let doc: jsPDF | null = null;

    for (let i = 0; i < total; i++) {
      const img = images[i];
      onProgress(i + 1, total, Math.round(((i) / total) * 100));

      // Get pre-rotated image data
      const rotatedSrc = await getRotatedImageDataUrl(img);

      // Swap dimensions if rotation is vertical
      const isRotated90 = (img.rotation / 90) % 2 !== 0;
      const visualWidth = isRotated90 ? img.height : img.width;
      const visualHeight = isRotated90 ? img.width : img.height;

      // Margins in mm
      const marginMM = options.margin === 'none' ? 0 : options.margin === 'small' ? 10 : 20;

      let pageWidth = 210;
      let pageHeight = 297;
      let isFit = options.pageSize === 'fit';

      if (isFit) {
        // Convert pixels to MM using 96 DPI approximation
        const pxToMm = 0.264583;
        const imageWidthMM = visualWidth * pxToMm;
        const imageHeightMM = visualHeight * pxToMm;
        
        pageWidth = imageWidthMM + (marginMM * 2);
        pageHeight = imageHeightMM + (marginMM * 2);
      } else {
        // Set fixed dimensions based on selection
        if (options.pageSize === 'a4') {
          pageWidth = options.orientation === 'portrait' ? 210 : 297;
          pageHeight = options.orientation === 'portrait' ? 297 : 210;
        } else if (options.pageSize === 'letter') {
          pageWidth = options.orientation === 'portrait' ? 215.9 : 279.4;
          pageHeight = options.orientation === 'portrait' ? 279.4 : 215.9;
        }
      }

      // Initialize doc on first page, otherwise add page
      if (!doc) {
        doc = new jsPDF({
          orientation: options.orientation,
          unit: 'mm',
          format: isFit ? [pageWidth, pageHeight] : (options.pageSize === 'a4' ? 'a4' : 'letter')
        });
      } else {
        doc.addPage(isFit ? [pageWidth, pageHeight] : (options.pageSize === 'a4' ? 'a4' : 'letter'), options.orientation);
      }

      // Calculate bounds for fitting
      const printableWidth = pageWidth - (marginMM * 2);
      const printableHeight = pageHeight - (marginMM * 2);

      let drawWidth = printableWidth;
      let drawHeight = printableHeight;

      if (!isFit) {
        const imageRatio = visualWidth / visualHeight;
        const printableRatio = printableWidth / printableHeight;

        if (imageRatio > printableRatio) {
          drawWidth = printableWidth;
          drawHeight = printableWidth / imageRatio;
        } else {
          drawHeight = printableHeight;
          drawWidth = printableHeight * imageRatio;
        }
      } else {
        // In fit mode, we draw the image directly over the inner area
        drawWidth = visualWidth * 0.264583;
        drawHeight = visualHeight * 0.264583;
      }

      // Center it inside the margins
      const drawX = marginMM + (printableWidth - drawWidth) / 2;
      const drawY = marginMM + (printableHeight - drawHeight) / 2;

      // Add image to pdf page
      doc.addImage(rotatedSrc, 'JPEG', drawX, drawY, drawWidth, drawHeight);
    }

    onProgress(total, total, 100);
    const pdfBlob = doc ? doc.output('blob') : new Blob();
    return {
      blob: pdfBlob,
      fileName: 'imgdocs-converted.pdf'
    };
  } else {
    // -------------------------------------------------------------
    // ZIP ARCHIVE OF SEPARATE SINGLE-PAGE PDFs
    // -------------------------------------------------------------
    const zip = new JSZip();

    for (let i = 0; i < total; i++) {
      const img = images[i];
      onProgress(i + 1, total, Math.round(((i) / total) * 100));

      const rotatedSrc = await getRotatedImageDataUrl(img);

      const isRotated90 = (img.rotation / 90) % 2 !== 0;
      const visualWidth = isRotated90 ? img.height : img.width;
      const visualHeight = isRotated90 ? img.width : img.height;

      const marginMM = options.margin === 'none' ? 0 : options.margin === 'small' ? 10 : 20;

      let pageWidth = 210;
      let pageHeight = 297;
      let isFit = options.pageSize === 'fit';

      if (isFit) {
        const pxToMm = 0.264583;
        const imageWidthMM = visualWidth * pxToMm;
        const imageHeightMM = visualHeight * pxToMm;
        pageWidth = imageWidthMM + (marginMM * 2);
        pageHeight = imageHeightMM + (marginMM * 2);
      } else {
        if (options.pageSize === 'a4') {
          pageWidth = options.orientation === 'portrait' ? 210 : 297;
          pageHeight = options.orientation === 'portrait' ? 297 : 210;
        } else if (options.pageSize === 'letter') {
          pageWidth = options.orientation === 'portrait' ? 215.9 : 279.4;
          pageHeight = options.orientation === 'portrait' ? 279.4 : 215.9;
        }
      }

      // Create a fresh single-page document
      const doc = new jsPDF({
        orientation: options.orientation,
        unit: 'mm',
        format: isFit ? [pageWidth, pageHeight] : (options.pageSize === 'a4' ? 'a4' : 'letter')
      });

      const printableWidth = pageWidth - (marginMM * 2);
      const printableHeight = pageHeight - (marginMM * 2);

      let drawWidth = printableWidth;
      let drawHeight = printableHeight;

      if (!isFit) {
        const imageRatio = visualWidth / visualHeight;
        const printableRatio = printableWidth / printableHeight;

        if (imageRatio > printableRatio) {
          drawWidth = printableWidth;
          drawHeight = printableWidth / imageRatio;
        } else {
          drawHeight = printableHeight;
          drawWidth = printableHeight * imageRatio;
        }
      } else {
        drawWidth = visualWidth * 0.264583;
        drawHeight = visualHeight * 0.264583;
      }

      const drawX = marginMM + (printableWidth - drawWidth) / 2;
      const drawY = marginMM + (printableHeight - drawHeight) / 2;

      doc.addImage(rotatedSrc, 'JPEG', drawX, drawY, drawWidth, drawHeight);

      // Output individual page PDF blob
      const pageBlob = doc.output('blob');
      
      // Clean filename for the zip entry
      const rawName = img.name.replace(/\.[^/.]+$/, "");
      zip.file(`${rawName}.pdf`, pageBlob);
    }

    onProgress(total, total, 95);
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    onProgress(total, total, 100);

    return {
      blob: zipBlob,
      fileName: 'imgdocs-converted.zip'
    };
  }
}
