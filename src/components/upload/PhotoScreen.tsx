'use client';

import React, { useState, useCallback } from 'react';
import { UploadCloud, Loader2, AlertCircle } from 'lucide-react';
import { PhotoValidationResult, SubjectBox } from "@/types/builder";
import { validateImageFile } from "@/lib/image/validateImageFile";
import { prepareImageForValidation } from "@/lib/image/prepareImageForValidation";
import { PhotoCropEditor } from './PhotoCropEditor';

interface Props {
  onPhotoSelected: (url: string) => void;
}

type ProcessingState = 'idle' | 'analyzing' | 'editing';

const STATUS_MESSAGES = [
  'Reading your image...',
  'Finding the main subject...',
  'Checking composition...',
  'Preparing your frame...',
];

export const PhotoScreen: React.FC<Props> = ({ onPhotoSelected }) => {
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // We keep the original full-res image for the cropper
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [subjectBox, setSubjectBox] = useState<SubjectBox | null>(null);

  const [statusMessageIndex, setStatusMessageIndex] = useState(0);

  React.useEffect(() => {
    if (processingState !== 'analyzing') return;

    const interval = setInterval(() => {
      setStatusMessageIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 1200);

    return () => clearInterval(interval);
  }, [processingState]);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setStatusMessageIndex(0);
    
    try {
      // 1. Basic client-side validation
      await validateImageFile(file);
      
      setProcessingState('analyzing');

      // 2. Prepare smaller image for fast validation
      const validationImageSrc = await prepareImageForValidation(file);
      
      // 3. Keep original image for the crop editor
      const originalObjectUrl = URL.createObjectURL(file);
      
      // 4. Send to AI
      const validationResponse = await fetch('/api/validate-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: validationImageSrc }),
      });

      if (!validationResponse.ok) {
        throw new Error('Photo validation failed.');
      }

      const validation: PhotoValidationResult = await validationResponse.json();

      if (!validation.valid) {
        setProcessingState('idle');
        setError(validation.reason || 'Please upload a photo containing a person or character.');
        URL.revokeObjectURL(originalObjectUrl);
        return;
      }

      // Success! Move to editing
      setOriginalImageSrc(originalObjectUrl);
      setSubjectBox(validation.subjectBox);
      setProcessingState('editing');

    } catch (err) {
      console.error('Photo processing error:', err);
      setProcessingState('idle');
      setError(
        err instanceof Error 
          ? err.message 
          : 'We could not process this image. Please try another photo.'
      );
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  if (processingState === 'editing' && originalImageSrc) {
    return (
      <PhotoCropEditor 
        imageSrc={originalImageSrc} 
        subjectBox={subjectBox} 
        onConfirm={onPhotoSelected} 
      />
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
      {/* STEP HEADER */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-hh-yellow/30" />
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-hh-yellow">
            Step 01 / 04
          </span>
          <div className="h-px flex-1 bg-hh-yellow/30" />
        </div>
        <div className="text-center">
          <h1 className="font-bodoni text-5xl md:text-6xl text-hh-yellow uppercase leading-[0.85]">
            Build Your
            <br />
            <span className="text-white">Builder Identity</span>
          </h1>
          <p className="mt-5 font-mono text-xs md:text-sm text-hh-cream/50 uppercase tracking-widest">
            Hacker House Goa 2026 &middot; 28–31 Oct &middot; #FrameInGoa
          </p>
        </div>
      </div>

      {/* UPLOAD AREA */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          relative overflow-hidden min-h-[360px] border-[3px] border-dashed transition-all duration-300 bg-black/10 group
          ${
            isDragging
              ? 'border-hh-yellow bg-hh-yellow/10 scale-[1.01]'
              : 'border-hh-yellow/40 hover:border-hh-yellow hover:bg-hh-yellow/5'
          }
        `}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={processingState === 'analyzing'}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 disabled:cursor-wait"
        />

        {/* PROCESSING */}
        {processingState === 'analyzing' && (
          <div className="absolute inset-0 z-30 bg-[#07120C]/95 backdrop-blur-md flex flex-col items-center justify-center text-center px-8">
            <div className="relative">
              <div className="absolute inset-0 bg-hh-pink/20 blur-3xl rounded-full" />
              <Loader2 className="relative w-14 h-14 text-hh-yellow animate-spin" />
            </div>
            <p className="mt-7 font-bodoni text-3xl text-hh-yellow uppercase">
              Analyzing Subject
            </p>
            <p className="mt-3 font-mono text-xs text-white/60 uppercase tracking-[0.2em] max-w-sm h-5 transition-all duration-300">
              {STATUS_MESSAGES[statusMessageIndex]}
            </p>
            <div className="mt-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-hh-pink animate-pulse" />
              <span className="font-mono text-[9px] text-hh-yellow/60 uppercase tracking-widest">
                Almost ready
              </span>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {processingState === 'idle' && (
          <div className="flex flex-col items-center justify-center min-h-[360px] gap-6 py-14 px-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-hh-yellow/10 blur-2xl rounded-full scale-150" />
              <UploadCloud
                className={`relative w-16 h-16 transition-colors ${
                  isDragging ? 'text-hh-pink' : 'text-hh-yellow/60 group-hover:text-hh-yellow'
                }`}
              />
            </div>
            <div>
              <p className="font-bodoni text-4xl text-hh-yellow uppercase mb-3">
                {isDragging ? 'Drop It Here' : 'Drop Your Photo'}
              </p>
              <p className="font-mono text-xs text-hh-cream/50 uppercase tracking-widest leading-relaxed">
                or click anywhere to upload
                <br />
                JPG &middot; PNG &middot; WEBP
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {['PERSON', 'ANIME', 'CHARACTER'].map((type) => (
                <span
                  key={type}
                  className="px-3 py-1 border border-hh-yellow/20 text-hh-yellow/50 font-mono text-[8px] tracking-widest"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-start gap-3 border border-red-400/30 bg-red-400/5 px-4 py-4 animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-mono text-xs font-bold text-red-400 uppercase tracking-widest">
              Image Not Accepted
            </p>
            <p className="mt-1 font-mono text-[10px] text-red-300/70 leading-relaxed">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* BRANDING */}
      <div className="flex items-center gap-6 border-t border-hh-yellow/20 pt-6">
        <img
          src="/branding/2-47.svg"
          alt="2:47 PM STUDIO"
          className="h-8 opacity-60"
          style={{
            filter: 'brightness(0) saturate(100%) invert(86%) sepia(50%) saturate(1048%) hue-rotate(352deg) brightness(106%) contrast(104%)',
          }}
        />
        <div className="h-6 w-px bg-hh-yellow/20" />
        <span className="font-mono text-xs text-hh-yellow/60 uppercase tracking-widest">
          Goa, India
        </span>
      </div>
    </div>
  );
};
