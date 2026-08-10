'use client';

import React from 'react';

export interface CardPhotoProps {
  photo: string | null;
  variant: 'editorial' | 'terminal' | 'goa';
  className?: string;
  isSatori?: boolean;
}

export const CardPhoto: React.FC<CardPhotoProps> = ({
  photo,
  variant,
  className = '',
  isSatori,
}) => {
  // Shared size across ALL card variants: w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40
  const photoSizeClass = 'w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 aspect-square';

  if (variant === 'editorial') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
        {/* Outer border & shadow */}
        <div className={`relative ${photoSizeClass} rounded-full overflow-hidden border-2 border-[#0A4226]/30 shadow-md bg-[#0A4226]/5`}>
          {photo ? (
            <img
              src={photo}
              alt="Builder"
              className="w-full h-full"
              style={{ filter: isSatori ? undefined : 'grayscale(100%) contrast(1.1) brightness(0.92)' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bodoni text-xs uppercase text-[#0A4226]/30 text-center">
              No Photo
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'terminal') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
        {/* Glowing Matrix green border */}
        <div
          className={`relative ${photoSizeClass} rounded-full overflow-hidden border-2 border-[#00FF41] bg-[#050A05]`}
          style={{ boxShadow: isSatori ? undefined : '0 0 20px rgba(0,255,65,0.35), inset 0 0 15px rgba(0,255,65,0.2)' }}
        >
          {photo ? (
            <>
              <img
                src={photo}
                alt="Builder"
                className="w-full h-full"
                style={{
                  filter: isSatori ? undefined : 'grayscale(100%) contrast(1.4) brightness(0.7) sepia(1) hue-rotate(70deg) saturate(4)',
                }}
              />
              {!isSatori && <div className="absolute inset-0 bg-[#00FF41] mix-blend-screen opacity-10 pointer-events-none" />}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center font-mono text-[8px] text-[#00FF41]/40 uppercase tracking-widest text-center px-2 animate-pulse">
              [NO_SIGNAL]
            </div>
          )}
        </div>
      </div>
    );
  }

  // GOA VARIANT
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      {/* Outer dual gradient ring + glow */}
      <div 
        className="p-[2.5px] rounded-full shrink-0"
        style={{
          background: isSatori ? '#FFE14D' : 'linear-gradient(135deg, #FFE14D 0%, #FF1493 50%, #FFE14D 100%)',
          boxShadow: isSatori ? undefined : '0 0 25px rgba(255,20,147,0.4), 0 0 10px rgba(255,225,77,0.3)'
        }}
      >
        <div className={`relative ${photoSizeClass} rounded-full overflow-hidden border-2 border-[#060B08] bg-[#060B08]`}>
          {photo ? (
            <img
              src={photo}
              alt="Builder"
              className="w-full h-full"
              style={{ filter: isSatori ? undefined : 'brightness(0.95) saturate(1.15) contrast(1.05)' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bodoni text-xs uppercase text-hh-yellow/40 text-center">
              No Photo
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
