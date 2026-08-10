import React from 'react';
import { BuilderProfile } from '@/types/builder';
import QRCode from 'react-qr-code';
import { HHLogo, FILTER_YELLOW, generateBuilderId } from './card-shared';

export const GoaBackCard = React.forwardRef<HTMLDivElement, { profile: BuilderProfile; isSatori?: boolean }>(
  ({ profile, isSatori }, ref) => {
    const sizeClass = 'w-full h-full';
    const builderId = generateBuilderId(profile.name);

    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_SITE_URL || 'https://profile-card-builder-hackathon-selection-task-j16qlg94p.vercel.app';
    
    const safeName = profile.name?.trim().replace(/\s+/g, '-').toLowerCase() || 'builder';
    const qrIdentifier = profile.shareId || safeName;
    const qrUrl = `${baseUrl}/share/${qrIdentifier}`;

    return (
      <div
        ref={ref}
        className={`relative flex flex-col justify-between ${sizeClass} overflow-hidden font-mono bg-[#060B08] p-4 sm:p-5 md:p-6`}
        style={{ boxShadow: isSatori ? undefined : 'inset 0 0 40px rgba(0,0,0,0.8)' }}
      >
        {!isSatori && (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full pointer-events-none opacity-30 blur-2xl"
            style={{ background: 'radial-gradient(circle, rgba(255,20,147,0.3) 0%, rgba(255,225,77,0.15) 50%, transparent 70%)' }}
          />
        )}

        <div className="relative z-20 flex justify-between items-start w-full border-b border-white/10 pb-3 shrink-0">
          <HHLogo filter={FILTER_YELLOW} isSatori={isSatori} />
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-white/40 text-[6.5px] md:text-[7px] font-bold tracking-[0.2em] uppercase">
              HACKER HOUSE GOA 2026
            </span>
            <span className="text-hh-yellow text-[5.5px] md:text-[6px] font-bold tracking-[0.2em] uppercase mt-0.5">
              BUILDER ID // {builderId}
            </span>
          </div>
        </div>

        <div className="relative z-20 flex flex-col items-center justify-center my-auto w-full gap-4">
          <div className="bg-white p-2.5 shadow-[0_0_20px_rgba(255,20,147,0.3)]">
            {qrUrl ? (
              isSatori ? (
                <div className="w-[140px] h-[140px] bg-black" style={{ display: 'flex' }} />
              ) : (
                <QRCode
                  value={qrUrl}
                  size={140}
                  level="M"
                  bgColor="#FFFFFF"
                  fgColor="#060B08"
                />
              )
            ) : (
              <div className="w-[140px] h-[140px] bg-gray-200" style={{ display: 'flex' }} />
            )}
          </div>
          <span className="font-mono text-[7px] md:text-[8px] text-hh-yellow uppercase tracking-widest bg-black/40 px-3 py-1 border border-hh-yellow/20">
            SCAN TO IDENTIFY // BUILDER PROFILE
          </span>
        </div>

        <div className="relative z-20 flex flex-col gap-2 shrink-0">
          <div className="w-10 h-[2px]" style={{ background: isSatori ? '#FFE14D' : 'linear-gradient(to right, #FFE14D, #FF1493)' }} />
          
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[8px] md:text-[8.5px] font-bold text-hh-yellow uppercase tracking-[0.25em]">
                {profile.role || 'FULL STACK DEVELOPER'}
              </span>
              <span className="font-bodoni text-xl sm:text-2xl text-white uppercase leading-none break-words" style={{ textShadow: '0 2px 10px rgba(255,20,147,0.25)' }}>
                {profile.name || 'YOUR NAME'}
              </span>
            </div>
          </div>
          
          <div className="w-full h-px bg-white/10" />
          
          <div className="flex items-end justify-between gap-2">
             <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[6.5px] md:text-[7px] text-white/40 uppercase tracking-[0.2em]">✦ Builder Title ✦</span>
                <span className="font-bodoni text-sm sm:text-base text-hh-pink uppercase tracking-wide leading-tight" style={{ textShadow: '0 0 10px rgba(255,20,147,0.4)' }}>
                  {profile.builderTitle || 'AGENT ARCHITECT'}
                </span>
             </div>
             
             <div className="flex flex-col items-end gap-0.5 shrink-0">
                <span className="font-mono text-[7.5px] md:text-[8px] font-bold text-hh-yellow uppercase tracking-widest">GOA, INDIA</span>
                <span className="font-mono text-[6.5px] md:text-[7px] text-white/35 uppercase tracking-widest">#FRAMEINGOA</span>
             </div>
          </div>
        </div>
      </div>
    );
  }
);
GoaBackCard.displayName = 'GoaBackCard';
