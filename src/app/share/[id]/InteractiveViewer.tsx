'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SharedProfile } from '@/lib/share-profile';

interface InteractiveViewerProps {
  frontImage: string;
  backImage: string | null;
  profile: SharedProfile;
}

export function InteractiveViewer({ frontImage, backImage, profile }: InteractiveViewerProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // If there's no back image (e.g., legacy share), just show the front image without flip logic.
  const canFlip = Boolean(backImage);

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto z-10">
      
      {/* 1. PAGE HERO & BRANDING */}
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="relative w-full flex justify-center items-center mb-6">
          {/* Base Yellow Typography */}
          <Image
            src="/branding/Hacker house.png"
            alt="HACKER HOUSE"
            width={1200}
            height={300}
            priority
            className="w-full max-w-[280px] md:max-w-[320px] h-auto object-contain drop-shadow-xl"
          />
          {/* Overlapping Neon Pink Hindi Text */}
          <Image
            src="/branding/goa_hindi.svg"
            alt="GOA"
            width={300}
            height={150}
            className="absolute z-10 w-[24%] md:w-[22%] top-[48%] left-[48%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_15px_rgba(255,20,147,0.5)]"
          />
        </div>

        <div className="inline-flex items-center gap-4 bg-black/40 px-6 py-2 border-[2px] border-hh-yellow mb-4 shadow-[4px_4px_0_0_rgba(255,223,0,0.5)]">
          <div className="w-2 h-2 bg-hh-pink animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-widest text-hh-yellow font-bold">
            Live Builder Profile
          </span>
        </div>
      </div>

      {/* 2. FRONT/BACK TERMINAL INDICATOR */}
      {canFlip && (
        <div className="flex font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest border-2 border-hh-yellow/30 bg-black/40 p-1 mb-8 w-full max-w-[440px]">
          <div className={`flex-1 flex justify-center py-2 transition-all duration-300 ${!isFlipped ? 'bg-hh-yellow text-[#0A4226] shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]' : 'text-hh-yellow/50 hover:text-hh-yellow'}`}>
            [01] FRONT_FRAME
          </div>
          <div className={`flex-1 flex justify-center py-2 transition-all duration-300 ${isFlipped ? 'bg-hh-pink text-white shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]' : 'text-hh-pink/50 hover:text-hh-pink'}`}>
            [02] BACK_DATA
          </div>
        </div>
      )}

      {/* 3 & 4. TWO-SIDED CARD VIEWER */}
      {/* Heavy Brutalist Wrapper */}
      <div className="relative w-full max-w-[440px] mb-8 bg-[#0A4226] border-[6px] md:border-[8px] border-hh-yellow shadow-[8px_8px_0_0_#FF1493] md:shadow-[12px_12px_0_0_#FF1493] p-1 md:p-2">
        <div 
          className="relative w-full aspect-[4/5]"
          style={{ perspective: '1500px' }}
        >
          <div 
            className="w-full h-full relative transition-transform duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] shadow-2xl shadow-black/90"
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            {/* Front Card */}
            <div 
              className="absolute inset-0 w-full h-full bg-[#060B08] border-2 border-[#0A4226]"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <Image
                src={frontImage}
                alt="Builder Card Front"
                fill
                className="w-full h-full object-contain"
                priority
                unoptimized
              />
            </div>

            {/* Back Card */}
            {canFlip && (
              <div 
                className="absolute inset-0 w-full h-full bg-[#060B08] border-2 border-[#0A4226]"
                style={{ 
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)' 
                }}
              >
                <Image
                  src={backImage as string}
                  alt="Builder Card Back"
                  fill
                  className="w-full h-full object-contain"
                  priority
                  unoptimized
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. TACTILE CARD CONTROLS */}
      {canFlip && (
        <div className="w-full max-w-[440px] mb-12">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            aria-label={isFlipped ? "Flip to front of Builder ID" : "Flip to back of Builder ID"}
            aria-pressed={isFlipped}
            className="group relative flex items-center justify-center gap-3 w-full py-5 bg-transparent border-[3px] border-hh-yellow text-hh-yellow font-mono font-bold uppercase tracking-[0.2em] text-sm shadow-[6px_6px_0_0_rgba(255,223,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[4px_4px_0_0_rgba(255,223,0,1)] active:translate-y-[6px] active:translate-x-[6px] active:shadow-none transition-all duration-200"
          >
            <span className={`transform transition-transform duration-500 ${isFlipped ? '-rotate-180 text-hh-pink' : 'rotate-0 text-hh-yellow'}`}>
              ↻
            </span>
            {isFlipped ? "Flip To Front" : "Flip To Back"}
          </button>
        </div>
      )}

      {/* 6. THE DOSSIER (Builder Information) */}
      <div className="w-full max-w-[440px] relative bg-[#0A4226] border-[3px] border-hh-yellow p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(255,20,147,0.7)] text-left mb-12">
        {/* Decorative Hardware Elements */}
        <div className="absolute top-0 right-0 w-10 h-10 border-b-[3px] border-l-[3px] border-hh-yellow bg-hh-pink flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#0A4226]" />
        </div>
        <div className="absolute -left-[3px] top-10 w-2 h-16 bg-hh-pink" />

        <div className="flex flex-col gap-6 mt-2">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hh-yellow/80 mb-1">Subject Name</p>
            <p className="font-bodoni text-3xl md:text-4xl text-white uppercase tracking-tight">{profile.name}</p>
          </div>
          
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hh-yellow/80 mb-1.5">Designated Role</p>
            <p className="font-mono text-sm md:text-base font-bold text-[#0A4226] bg-hh-yellow px-4 py-1.5 inline-block uppercase tracking-widest">{profile.role}</p>
          </div>
          
          {profile.stack && profile.stack.length > 0 && (
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hh-yellow/80 mb-2">Core Stack</p>
              <div className="flex flex-wrap gap-2">
                {profile.stack.map((s, i) => (
                  <span key={i} className="px-3 py-1.5 bg-[#060B08] border border-hh-pink text-hh-pink font-mono text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(255,20,147,0.6)]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}