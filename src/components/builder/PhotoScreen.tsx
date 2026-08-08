'use client';

import React, { useState, useCallback } from 'react';
import { UploadCloud } from 'lucide-react';

interface Props {
  onPhotoSelected: (url: string) => void;
}

export const PhotoScreen: React.FC<Props> = ({ onPhotoSelected }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) setPreview(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) processFile(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-10">
      {/* Step header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-hh-yellow/30" />
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-hh-yellow">Step 01 / 03</span>
          <div className="h-px flex-1 bg-hh-yellow/30" />
        </div>
        <h1 className="font-bodoni text-5xl md:text-7xl text-hh-yellow uppercase leading-none tracking-tight">
          Build Your<br />
          <span className="text-hh-pink">Builder</span><br />
          Identity
        </h1>
        <p className="font-mono text-sm text-hh-cream/60 uppercase tracking-widest">
          Hacker House Goa 2026 · 28–31 Oct · #FrameInGoa
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center min-h-[320px] border-[3px] border-dashed transition-all duration-300 cursor-pointer group bg-black/10
          ${isDragging
            ? 'border-hh-yellow bg-hh-yellow/10 scale-[1.02]'
            : preview
              ? 'border-hh-pink border-solid'
              : 'border-hh-yellow/40 hover:border-hh-yellow hover:bg-hh-yellow/5'}`}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFileChange}
        />

        {preview ? (
          <div className="relative w-full h-full min-h-[320px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover object-center max-h-[450px]"
            />
            <div className="absolute inset-0 bg-[#0A4226]/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
              <UploadCloud className="w-10 h-10 text-hh-pink mb-3" />
              <span className="font-mono text-sm font-bold uppercase tracking-widest text-hh-yellow">Change Subject</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5 py-12 px-8 text-center">
            <UploadCloud
              className={`w-14 h-14 transition-colors ${isDragging ? 'text-hh-pink' : 'text-hh-yellow/60 group-hover:text-hh-yellow'}`}
            />
            <div>
              <p className="font-bodoni text-3xl text-hh-yellow uppercase mb-2">Drop your photo</p>
              <p className="font-mono text-xs text-hh-cream/50 uppercase tracking-widest leading-relaxed">
                or click to upload<br />JPG, PNG, HEIC · Square or portrait
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Branding strip */}
      <div className="flex items-center gap-6 border-t border-hh-yellow/20 pt-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/branding/2-47.svg"
          alt="2:47 PM STUDIO"
          className="h-8 opacity-60"
          style={{ filter: 'brightness(0) saturate(100%) invert(86%) sepia(50%) saturate(1048%) hue-rotate(352deg) brightness(106%) contrast(104%)' }}
        />
        <div className="h-6 w-px bg-hh-yellow/20" />
        <span className="font-mono text-xs text-hh-yellow/60 uppercase tracking-widest">Goa, India</span>
      </div>

      {preview && (
        <button
          onClick={() => onPhotoSelected(preview)}
          className="w-full py-5 bg-hh-pink text-white font-mono font-bold uppercase tracking-[0.2em] text-sm hover:bg-white hover:text-hh-pink transition-all shadow-[0_0_15px_rgba(255,20,147,0.4)]"
        >
          Confirm Photo →
        </button>
      )}
    </div>
  );
};
