/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  RotateCw, 
  Trash2, 
  GripHorizontal, 
  Plus, 
  SortAsc, 
  SortDesc, 
  Eye, 
  EyeOff,
  FileImage
} from 'lucide-react';
import { UploadedImage } from '../types';

interface ThumbnailGridProps {
  images: UploadedImage[];
  showCovers: boolean;
  onRotate: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (draggedIndex: number, targetIndex: number) => void;
  onSortByName: (ascending: boolean) => void;
  onToggleCovers: () => void;
  onAddFiles: (files: File[]) => void;
}

export default function ThumbnailGrid({
  images,
  showCovers,
  onRotate,
  onDelete,
  onReorder,
  onSortByName,
  onToggleCovers,
  onAddFiles
}: ThumbnailGridProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [sortAscending, setSortAscending] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Add a ghost image styling effect if supported
    if (e.dataTransfer.setDragImage) {
      const dragGhost = document.getElementById(`thumb-card-${images[index].id}`);
      if (dragGhost) {
        e.dataTransfer.setDragImage(dragGhost, 40, 40);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    onReorder(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSortClick = () => {
    const nextOrder = sortAscending === true ? false : true;
    setSortAscending(nextOrder);
    onSortByName(nextOrder);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(Array.from(e.target.files));
    }
  };

  // Helper to map rotation angle to Tailwind rotation class
  const getRotationClass = (angle: number) => {
    switch (angle % 360) {
      case 90: return 'rotate-90';
      case 180: return 'rotate-180';
      case 270: return 'rotate-270';
      default: return 'rotate-0';
    }
  };

  return (
    <div className="flex-1" id="thumbnail-grid-workspace">
      {/* Workspace Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm" id="workspace-toolbar">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Files ({images.length})
          </span>
          <div className="h-4 w-px bg-slate-200" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-primary hover:bg-red-100 transition-colors cursor-pointer"
            id="toolbar-add-files"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Images
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Sorting & Preview Mode Controls */}
        <div className="flex items-center gap-2">
          {/* Alphabetical Sorting button */}
          <button
            type="button"
            onClick={handleSortClick}
            className={`flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 transition-colors text-slate-700 cursor-pointer ${sortAscending !== null ? 'bg-slate-100' : 'bg-white'}`}
            title="Sort images by name"
            id="toolbar-sort-btn"
          >
            {sortAscending === false ? (
              <>
                <SortDesc className="h-3.5 w-3.5 text-primary" />
                <span>Sort Name (Z-A)</span>
              </>
            ) : (
              <>
                <SortAsc className="h-3.5 w-3.5 text-primary" />
                <span>Sort Name (A-Z)</span>
              </>
            )}
          </button>

          {/* Cover View Toggle button */}
          <button
            type="button"
            onClick={onToggleCovers}
            className={`flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 transition-colors text-slate-700 cursor-pointer ${showCovers ? 'bg-primary-light border-red-200 text-primary' : 'bg-white'}`}
            title="Toggle PDF page outline preview mode"
            id="toolbar-covers-btn"
          >
            {showCovers ? (
              <>
                <EyeOff className="h-3.5 w-3.5" />
                <span>Hide PDF Covers</span>
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" />
                <span>Show PDF Covers</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid of thumbnails */}
      <div 
        className={`grid gap-6 ${
          showCovers 
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5'
        }`}
        id="images-preview-grid"
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            id={`thumb-card-${image.id}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`group relative flex flex-col items-center justify-between rounded-xl bg-white border transition-all duration-200 ${
              draggedIndex === index 
                ? 'border-primary bg-primary-light scale-95 opacity-50 shadow-inner' 
                : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
            } ${showCovers ? 'p-4 aspect-[1/1.3]' : 'p-3 aspect-square'}`}
          >
            {/* Top Bar controls of individual card */}
            <div className="absolute top-2 right-2 left-2 z-10 flex items-center justify-between opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              {/* Drag Handle */}
              <div 
                className="flex h-7 w-7 cursor-grab items-center justify-center rounded-lg bg-slate-900/80 text-white hover:bg-slate-900 active:cursor-grabbing shadow"
                title="Drag to reorder page"
              >
                <GripHorizontal className="h-4 w-4" />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-1">
                {/* Rotate Button */}
                <button
                  type="button"
                  onClick={() => onRotate(image.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900/80 text-white hover:bg-primary hover:text-white shadow transition-colors cursor-pointer"
                  title="Rotate image 90 degrees"
                  id={`rotate-${image.id}`}
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => onDelete(image.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900/80 text-white hover:bg-red-600 hover:text-white shadow transition-colors cursor-pointer"
                  title="Remove image from conversion"
                  id={`delete-${image.id}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Main Image View */}
            <div className="relative flex-1 flex items-center justify-center w-full overflow-hidden select-none">
              <div className={`transition-transform duration-300 ${getRotationClass(image.rotation)}`}>
                <img
                  src={image.src}
                  alt={image.name}
                  referrerPolicy="no-referrer"
                  className={`max-h-32 max-w-full rounded object-contain shadow-sm ${showCovers ? 'max-h-44 border border-slate-100' : ''}`}
                />
              </div>

              {/* Cover view overlay overlaying layout details */}
              {showCovers && (
                <div className="absolute bottom-0 right-0 rounded bg-slate-900/75 px-1.5 py-0.5 font-mono text-[10px] text-white">
                  Page {index + 1}
                </div>
              )}
            </div>

            {/* Bottom info panel (filename / details) */}
            <div className="mt-2 w-full text-center" id={`details-panel-${image.id}`}>
              <div className="truncate text-xs font-semibold text-slate-700" title={image.name}>
                {image.name}
              </div>
              <div className="mt-0.5 text-[10px] font-medium text-slate-400">
                {(image.file.size / (1024 * 1024)).toFixed(2)} MB • {image.width} × {image.height}px
              </div>
            </div>
          </div>
        ))}

        {/* Append files mini card helper */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white hover:border-primary hover:bg-primary-light/30 transition-all duration-200 cursor-pointer p-4 aspect-square"
          id="workspace-add-more-button"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-primary-light group-hover:text-primary transition-all">
            <Plus className="h-6 w-6" />
          </div>
          <span className="mt-3 text-sm font-bold text-slate-600 group-hover:text-primary">
            Add images
          </span>
          <span className="mt-1 text-xs text-slate-400 text-center">
            Upload and join more pages
          </span>
        </button>
      </div>
    </div>
  );
}
