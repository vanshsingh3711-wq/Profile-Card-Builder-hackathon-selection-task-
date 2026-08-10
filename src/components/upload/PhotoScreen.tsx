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
        <div className="fixed inset-0 z-50 bg-[#060B08] flex flex-col animate-in fade-in duration-300">
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="font-mono text-[10px] text-red-500 uppercase tracking-widest font-bold">REC</span>
            </div>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); stopCamera(); }}
              className="font-mono text-[10px] text-white/50 hover:text-white uppercase tracking-widest"
            >
              [ ESC ]
            </button>
          </div>
          
          <div className="relative flex-1 w-full flex items-center justify-center p-0 md:p-8">
            <div className="relative w-full h-full md:max-w-3xl border-0 md:border border-white/10 bg-black flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Viewfinder overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[65%] md:w-[320px] aspect-[3/4] border border-white/20 relative">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white/80" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white/80" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white/80" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white/80" />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center bg-gradient-to-t from-black/90 via-black/60 to-transparent z-20">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); capturePhoto(); }}
              className="w-16 h-16 rounded-full border-[3px] border-hh-yellow flex items-center justify-center hover:bg-hh-yellow/10 transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-hh-yellow group-hover:scale-95 transition-transform shadow-[0_0_15px_rgba(255,223,0,0.5)]" />
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
              <div className="h-px flex-1 bg-hh-yellow/20" />
              <div className="flex items-center gap-2 px-3 py-1 bg-hh-yellow/5 border border-hh-yellow/20">
                <div className="w-1.5 h-1.5 bg-hh-yellow animate-pulse" />
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-hh-yellow font-bold">
                  SYS.INIT // 01:04
                </span>
              </div>
              <div className="h-px flex-1 bg-hh-yellow/20" />
            </div>
            <div className="text-center mt-2">
              <h1 className="font-bodoni text-5xl md:text-6xl text-hh-yellow uppercase leading-[0.85]">
                Upload Your
                <br />
                <span className="text-white">Photo</span>
              </h1>
              <p className="mt-6 font-mono text-xs md:text-sm text-hh-cream/60 uppercase tracking-widest max-w-md mx-auto">
                Begin creating your Builder Identity for Hacker House Goa 2026.
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
              relative overflow-hidden min-h-[380px] border-[2px] transition-all duration-300 group
              ${
                existingPhoto
                  ? 'border-hh-yellow/20 bg-black/40'
                  : isDragging
                    ? 'border-hh-yellow border-dashed bg-hh-yellow/10 scale-[1.01]'
                    : 'border-hh-yellow/30 border-dashed bg-[#041008] hover:border-hh-yellow/60 hover:bg-[#06180C]'
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

            {/* PREVIEW STATE */}
            {processingState === 'idle' && existingPhoto && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#07120C]">
                
                {/* Background blurred photo for aesthetics */}
                <div 
                  className="absolute inset-0 opacity-20 blur-xl scale-110"
                  style={{ backgroundImage: `url(${existingPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
                
                <div className="relative z-10 w-36 h-36 md:w-48 md:h-48 rounded-none border border-hh-yellow/30 bg-black p-1.5 md:p-2 shadow-2xl mb-8">
                  <div className="w-full h-full relative overflow-hidden border border-hh-yellow/10">
                    <img src={existingPhoto} alt="Selected profile" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                    <div className="absolute inset-0 border border-hh-yellow/20 pointer-events-none mix-blend-overlay" />
                  </div>
                  
                  {/* Decorative corner brackets */}
                  <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-hh-yellow" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-hh-yellow" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-hh-yellow" />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-hh-yellow" />
                </div>

                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-mono text-[10px] text-green-500 uppercase tracking-widest">
                      Photo Accepted
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleChangePhoto}
                      className="px-5 py-2.5 border border-hh-yellow/30 bg-black/40 text-hh-yellow font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-hh-yellow/10 transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reselect
                    </button>
                    <button
                      onClick={handleContinueWithExisting}
                      className="px-6 py-2.5 bg-hh-yellow text-[#060B08] font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-[0_0_15px_rgba(255,223,0,0.2)] hover:shadow-[0_0_20px_rgba(255,223,0,0.4)] flex items-center gap-2"
                    >
                      Continue
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* EMPTY STATE */}
            {processingState === 'idle' && !existingPhoto && (
              <div className="flex flex-col items-center justify-center min-h-[380px] gap-6 py-10 px-6 text-center">
                <div className="relative group-hover:scale-110 transition-transform duration-500">
                  <div className="absolute inset-0 bg-hh-yellow/10 blur-2xl rounded-full scale-150" />
                  <UploadCloud className="relative w-12 h-12 text-hh-yellow/60 group-hover:text-hh-yellow transition-colors" />
                </div>
                <div>
                  <p className="font-mono text-sm font-bold text-hh-yellow uppercase tracking-widest mb-2">
                    {isDragging ? 'Drop Image Here' : 'Select an Image'}
                  </p>
                  <p className="font-mono text-[10px] text-hh-cream/40 uppercase tracking-widest leading-relaxed">
                    Drag and drop or click to browse
                    <br />
                    High-quality JPG, PNG, or WEBP
                  </p>
                </div>

                <div className="flex items-center w-full max-w-[200px] gap-4 my-1">
                  <div className="h-px flex-1 bg-hh-yellow/20" />
                  <span className="font-mono text-[9px] text-hh-yellow/50 uppercase tracking-widest">OR</span>
                  <div className="h-px flex-1 bg-hh-yellow/20" />
                </div>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    startCamera();
                  }}
                  className="relative z-30 px-6 py-3 border border-hh-yellow/30 bg-black/40 text-hh-yellow font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-hh-yellow hover:text-[#060B08] transition-colors"
                >
                  Take Photo with Camera
                </button>

                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {['Clear Face', 'Good Lighting', 'One Person'].map((req) => (
                    <div key={req} className="flex items-center gap-1.5">
                      <div className="w-1 h-1 bg-hh-yellow/40 rounded-sm" />
                      <span className="font-mono text-[9px] text-hh-cream/50 tracking-widest uppercase">
                        {req}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ERROR */}
          {error && (
            <div className="flex items-start gap-4 border border-red-500/30 bg-red-500/5 px-5 py-4 animate-in fade-in slide-in-from-top-2 duration-300 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500/50" />
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-mono text-[11px] font-bold text-red-400 uppercase tracking-widest mb-1">
                  Validation Failed
                </p>
                <p className="font-mono text-[10px] text-red-300/80 leading-relaxed uppercase">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* BRANDING FOOTER */}
          <div className="flex items-center justify-between border-t border-hh-yellow/10 pt-6 mt-2">
            <div className="flex items-center gap-4">
              <img
                src="/branding/2-47.svg"
                alt="2:47 PM STUDIO"
                className="h-6 opacity-40 hover:opacity-100 transition-opacity"
                style={{
                  filter: 'brightness(0) saturate(100%) invert(86%) sepia(50%) saturate(1048%) hue-rotate(352deg) brightness(106%) contrast(104%)',
                }}
              />
            </div>
            <span className="font-mono text-[9px] text-hh-yellow/40 uppercase tracking-widest">
              SYSTEM.READY
            </span>
          </div>
        </>
      )}
    </div>
  );
};
