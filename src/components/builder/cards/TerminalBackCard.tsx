import React from 'react';
import { BuilderProfile } from '@/types/builder';
import QRCode from 'react-qr-code';
import { HHLogo, generateBuilderId } from './card-shared';

const FILTER_MATRIX_GREEN = 'brightness(0) saturate(100%) invert(58%) sepia(97%) saturate(3681%) hue-rotate(85deg) brightness(108%) contrast(106%)';

export const TerminalBackCard = React.forwardRef<HTMLDivElement, { profile: BuilderProfile }>(
  ({ profile }, ref) => {
    const sizeClass = 'w-full h-full';
    const builderId = generateBuilderId(profile.name);

    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_SITE_URL || 'https://my-goa.vercel.app';
    
    const safeName = profile.name?.trim().replace(/\s+/g, '-').toLowerCase() || 'builder';
    const qrUrl = `${baseUrl}/share/${safeName}`;

    return (
      <div
        ref={ref}
        className={`relative flex flex-col justify-between ${sizeClass} overflow-hidden font-mono bg-[#050A05] border border-[#00FF41]/20 p-4 sm:p-5 md:p-6`}
        style={{ boxShadow: '0 0 60px rgba(0,255,65,0.08) inset' }}
      >
        {/* CRT Scanline Overlay */}
        <div
          className="absolute inset-0 z-50 pointer-events-none mix-blend-overlay opacity-[0.07]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #00FF41 2px, #00FF41 3px)' }}
        />

        {/* Top Header */}
        <div className="relative flex justify-between items-center w-full pb-2 z-20 border-b border-[#00FF41]/15 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[#00FF41]/50 text-[6.5px] md:text-[7.5px] tracking-[0.2em] uppercase font-bold flex flex-col gap-0.5">
              <span>HACKER HOUSE GOA 2026</span>
              <span className="text-[#00FF41]">BUILDER ID // {builderId}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <HHLogo filter={FILTER_MATRIX_GREEN} />
          </div>
        </div>

        {/* Center QR */}
        <div className="relative z-20 flex flex-col items-center justify-center my-auto w-full gap-3">
          <div className="border border-[#00FF41] p-3 bg-[#050A05]" style={{ boxShadow: '0 0 20px rgba(0,255,65,0.2)' }}>
            {qrUrl ? (
              <QRCode
                value={qrUrl}
                size={140}
                level="M"
                bgColor="#050A05"
                fgColor="#00FF41"
              />
            ) : (
              <div className="w-[140px] h-[140px] bg-gray-800" />
            )}
          </div>
          <div className="text-center">
            <span className="block text-[#00FF41]/50 text-[6.5px] uppercase tracking-[0.2em] font-bold">
              {'>'} SCAN_TO_IDENTIFY // BUILDER_PROFILE
            </span>
            <span className="font-mono text-[8px] md:text-[9px] text-[#00FF41] font-bold uppercase tracking-widest mt-1">
              /share/{profile.name?.trim().replace(/\s+/g, '-').toLowerCase() || 'builder'}
            </span>
          </div>
        </div>

        {/* Bottom Details */}
        <div className="relative z-20 flex flex-col gap-2.5 shrink-0">
          <div>
            <span className="text-[#00FF41]/50 text-[6.5px] md:text-[7px] uppercase tracking-[0.25em] font-bold block mb-0.5">
              {'>'} SUBJECT_ID
            </span>
            <h2 className="font-mono text-xl sm:text-2xl text-[#00FF41] uppercase leading-none font-black break-words" style={{ textShadow: '0 0 10px rgba(0,255,65,0.4)' }}>
              {profile.name || 'VANSH S.'}
            </h2>
          </div>

          <div>
            <span className="text-[#00FF41]/50 text-[6.5px] md:text-[7px] uppercase tracking-[0.25em] font-bold block mb-0.5">
              {'>'} DESIGNATION
            </span>
            <div className="w-full border border-[#00FF41]/40 bg-[#00FF41]/8 px-2 py-1 flex items-center">
              <span className="font-mono text-xs text-[#00FF41] uppercase tracking-widest font-bold">
                <span className="text-[#00FF41]/50 mr-1">{'>'}</span>{profile.builderTitle || 'AGENT ARCHITECT'}
              </span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-[#00FF41]/15 flex justify-between items-center bg-black/40 mt-1">
            <span className="text-white/40 text-[6.5px] md:text-[7px] tracking-[0.15em] uppercase">
              SECURE_ACCESS_GRANTED
            </span>
            <span className="text-[#00FF41] text-[7px] md:text-[7.5px] font-bold tracking-widest uppercase animate-pulse">
              [ VALID ]
            </span>
          </div>
        </div>
      </div>
    );
  }
);
TerminalBackCard.displayName = 'TerminalBackCard';
