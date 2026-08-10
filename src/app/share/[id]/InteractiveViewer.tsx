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
      
      {/* 2. PAGE HERO & BRANDING */}
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="mb-4">
          <Image 
            src="/branding/Hacker house.png" 
            alt="Hacker House Goa Logo" 
            width={100} 
            height={100}
            className="w-20 md:w-24 h-auto object-contain"
          />
        </div>
        <h1 className="font-bodoni text-3xl md:text-5xl text-hh-yellow uppercase text-center mb-2 tracking-tight">
          Hacker House Goa 2026
        </h1>
        <p className="text-hh-cream/70 uppercase tracking-[0.2em] text-xs md:text-sm font-bold flex items-center gap-2">
          <span className="w-8 h-px bg-hh-pink/50"></span>
          Builder Identity
          <span className="w-8 h-px bg-hh-pink/50"></span>
        </p>
        <p className="mt-6 text-hh-cream/90 font-mono text-sm max-w-md mx-auto">
          Meet the builders heading to Goa.
        </p>
      </div>

      {/* FRONT/BACK INDICATOR */}
      {canFlip && (
        <div className="flex items-center justify-center gap-6 mb-4 font-mono text-sm md:text-base uppercase tracking-widest">
          <span className={`transition-colors duration-300 flex items-center gap-2 ${!isFlipped ? 'text-hh-yellow font-bold' : 'text-hh-cream/40'}`}>
            Front {!isFlipped ? '●' : '○'}
          </span>
          <span className={`transition-colors duration-300 flex items-center gap-2 ${isFlipped ? 'text-hh-pink font-bold' : 'text-hh-cream/40'}`}>
            Back {isFlipped ? '●' : '○'}
          </span>
        </div>
      )}

      {/* 3 & 4. TWO-SIDED CARD VIEWER & RESPONSIVE SIZING */}
      <div 
        className="relative w-full max-w-[440px] aspect-[4/5] mb-8"
        style={{ 
          perspective: '1500px',
          width: 'min(88vw, 440px)'
        }}
      >
        <div 
          className="w-full h-full relative transition-transform duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] shadow-2xl shadow-black/80"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Front Card */}
          <div 
            className="absolute inset-0 w-full h-full"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <Image
              src={frontImage}
              alt="Builder Card Front"
              fill
              className="w-full h-full object-contain rounded-2xl border border-hh-yellow/20 bg-[#060B08]"
              priority
              unoptimized
            />
          </div>

          {/* Back Card */}
          {canFlip && (
            <div 
              className="absolute inset-0 w-full h-full"
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)' 
              }}
            >
              <Image
                src={backImage as string}
                alt="Builder Card Back"
                fill
                className="w-full h-full object-contain rounded-2xl border border-hh-pink/20 bg-[#060B08]"
                priority
                unoptimized
              />
            </div>
          )}
        </div>
      </div>

      {/* 5. CARD CONTROLS */}
      {canFlip && (
        <div className="flex flex-col items-center mb-10 gap-3">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            aria-label={isFlipped ? "Flip to front of Builder ID" : "Flip to back of Builder ID"}
            aria-pressed={isFlipped}
            className="group flex items-center gap-2 px-8 py-3 bg-hh-green border border-hh-yellow text-hh-yellow font-mono text-sm uppercase tracking-wider hover:bg-hh-yellow hover:text-hh-green active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-hh-pink focus:ring-offset-2 focus:ring-offset-[#060B08]"
          >
            <span className={`transform transition-transform duration-500 ${isFlipped ? '-rotate-180' : 'rotate-0'}`}>
              ↻
            </span>
            {isFlipped ? "Flip To Front" : "Flip To Back"}
          </button>
        </div>
      )}

      {/* 6. BUILDER INFORMATION */}
      <div className="w-full max-w-[440px] bg-black/40 border border-white/10 p-6 rounded-lg mb-12 backdrop-blur-sm text-center">
        <h3 className="text-xs font-mono text-hh-pink uppercase tracking-widest mb-1">Builder</h3>
        <h2 className="text-xl md:text-2xl font-bold text-hh-cream uppercase tracking-wider mb-4">{profile.name}</h2>
        
        <h3 className="text-xs font-mono text-hh-yellow uppercase tracking-widest mb-1">Role</h3>
        <h2 className="text-sm md:text-base font-medium text-hh-cream uppercase tracking-wider mb-4">{profile.role}</h2>
        
        {profile.stack && profile.stack.length > 0 && (
          <>
            <h3 className="text-xs font-mono text-white/50 uppercase tracking-widest mb-2">Stack</h3>
            <p className="text-sm font-mono text-hh-cream/80 uppercase">
              {profile.stack.join(' · ')}
            </p>
          </>
        )}
      </div>

    </div>
  );
}
