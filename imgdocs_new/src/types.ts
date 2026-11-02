/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UploadedImage {
  id: string;
  file: File;
  name: string;
  src: string; // Object URL for image preview
  rotation: number; // 0, 90, 180, 270 degrees clockwise
  width: number;
  height: number;
}

export type AppState = 'UPLOAD' | 'UPLOADING' | 'EDITOR' | 'CONVERTING' | 'RESULT';

export type PageOrientation = 'portrait' | 'landscape';

export type PageSize = 'fit' | 'a4' | 'letter';

export type PageMargin = 'none' | 'small' | 'big';

export interface ConverterOptions {
  orientation: PageOrientation;
  pageSize: PageSize;
  margin: PageMargin;
  merge: boolean;
}

export interface UploadStats {
  currentFile: number;
  totalFiles: number;
  progress: number;
  timeLeft: number; // in seconds
  speed: number; // in MB/s
  source: 'local' | 'drive' | 'dropbox' | null;
}

export interface BlogPost {
  slug: string;
  title: string;
  category: 'PDF Guides' | 'Security & Privacy' | 'Office Productivity' | 'Advanced Workflows';
  date: string;
  readTime: string;
  summary: string;
  content: string;
}

