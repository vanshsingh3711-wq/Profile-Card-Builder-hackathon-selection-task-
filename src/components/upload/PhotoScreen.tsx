'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { UploadCloud, Loader2, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { PhotoValidationResult, SubjectBox } from "@/types/builder";
import { validateImageFile } from "@/lib/image/validateImageFile";
import { prepareImageForValidation } from "@/lib/image/prepareImageForValidation";
import { PhotoCropEditor } from './PhotoCropEditor';

interface Props {
  existingPhoto?: string | null;
  onPhotoSelected: (url: string) => void;
  onResetPhoto?: () => void;
}

type ProcessingState = 'idle' | 'analyzing' | 'editing';

const STATUS_MESSAGES = [
  'Reading your image...',
  'Finding the main subject...',
  'Checking composition...',
  'Preparing your frame...',
];

export const PhotoScreen: React.FC<Props> = ({ existingPhoto, onPhotoSelected, onResetPhoto }) => {
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // We keep the original full-res image for the cropper
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [subjectBox, setSubjectBox] = useState<SubjectBox | null>(null);

  const [statusMessageIndex, setStatusMessageIndex] = useState(0);

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previousImageRef = useRef<string | null>(null);

  useEffect(() => {
    previousImageRef.current = originalImageSrc;
  }, [originalImageSrc]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
      setError(null);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera access denied or unavailable. Please upload a photo instead.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          processFile(file);
          stopCamera();
        }
      }, 'image/jpeg', 0.9);
    }
  };

  useEffect(() => {
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
      const { dataUrl: validationImageSrc, scaleFactor } = await prepareImageForValidation(file);
      
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
        setProcessingState(previousImageRef.current ? 'editing' : 'idle');
        setError(validation.reason || 'Please upload a photo containing a person or character.');
        URL.revokeObjectURL(originalObjectUrl);
        return;
      }

      // Success! Move to editing
      setOriginalImageSrc(originalObjectUrl);
      
      const scaledSubjectBox = validation.subjectBox ? {
        x: validation.subjectBox.x * scaleFactor,
        y: validation.subjectBox.y * scaleFactor,
        width: validation.subjectBox.width * scaleFactor,
        height: validation.subjectBox.height * scaleFactor,
      } : null;

      setSubjectBox(scaledSubjectBox);
      setProcessingState('editing');

    } catch (err) {
      console.error('Photo processing error:', err);
      setProcessingState(previousImageRef.current ? 'editing' : 'idle');
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

  const handleChangePhoto = () => {
    if (onResetPhoto) {
      onResetPhoto();
    }
  };

  const handleContinueWithExisting = () => {
    if (existingPhoto) {
      onPhotoSelected(existingPhoto);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* CAMERA PREVIEW - FULL SCREEN OVERLAY */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-200">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-4 px-6">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); capturePhoto(); }}
              className="px-8 py-4 bg-hh-yellow text-[#060B08] font-mono text-sm font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-[0_0_20px_rgba(255,223,0,0.5)]"
            >
              Capture
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); stopCamera(); }}
              className="px-8 py-4 bg-black/50 border border-white/30 text-white font-mono text-sm uppercase tracking-widest hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {processingState === 'editing' && originalImageSrc ? (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <PhotoCropEditor 
            imageSrc={originalImageSrc} 
            subjectBox={subjectBox} 
            onConfirm={onPhotoSelected}
            onTriggerUpload={() => fileInputRef.current?.click()}
            onTriggerCamera={startCamera}
          />
        </>
      ) : (
        <>
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

          {/* UPLOAD AREA OR EXISTING PREVIEW */}
          <div
            onDragOver={(e) => {
              if (existingPhoto) return;
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              if (existingPhoto) return;
              handleDrop(e);
            }}
            className={`
              relative overflow-hidden min-h-[360px] border-[3px] border-dashed transition-all duration-300 bg-black/10 group
              ${
                existingPhoto
                  ? 'border-hh-yellow/20'
                  : isDragging
                    ? 'border-hh-yellow bg-hh-yellow/10 scale-[1.01]'
                    : 'border-hh-yellow/40 hover:border-hh-yellow hover:bg-hh-yellow/5'
              }
            `}
          >
            {!existingPhoto && (
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={processingState === 'analyzing'}
                onChange={handleFileChange}
                className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 ${isCameraActive ? 'hidden' : 'block'} disabled:cursor-wait`}
              />
            )}

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

            {/* PREVIEW STATE (If they hit Back after cropping) */}
            {processingState === 'idle' && existingPhoto && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/20 p-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-hh-yellow shadow-[0_0_15px_rgba(255,223,0,0.3)]">
                  <img src={existingPhoto} alt="Selected profile" className="w-full h-full object-cover" />
                </div>
                <p className="font-bodoni text-2xl text-white mt-2">Photo Selected</p>
                <div className="flex gap-4 mt-2">
                  <button
                    onClick={handleChangePhoto}
                    className="px-6 py-2 border border-hh-yellow/30 text-hh-yellow font-mono text-xs uppercase tracking-widest hover:bg-hh-yellow/10 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 inline mr-2" />
                    Change Photo
                  </button>
                  <button
                    onClick={handleContinueWithExisting}
                    className="px-6 py-2 bg-hh-yellow text-[#060B08] font-mono text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-[0_0_15px_rgba(255,223,0,0.4)]"
                  >
                    Continue <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                  </button>
                </div>
              </div>
            )}

            {/* EMPTY STATE */}
            {processingState === 'idle' && !existingPhoto && (
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
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    startCamera();
                  }}
                  className="relative z-30 mt-2 px-6 py-3 bg-hh-yellow text-[#060B08] font-mono text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors"
                >
                  Take Photo
                </button>
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
        </>
      )}
    </div>
  );
};
