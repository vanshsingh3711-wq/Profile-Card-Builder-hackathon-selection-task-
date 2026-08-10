import React from 'react';
import { BuilderProfile } from '@/types/builder';
import QRCode from 'react-qr-code';
import { HHLogo, FILTER_GREEN, generateBuilderId } from './card-shared';

export const EditorialBackCard = React.forwardRef<HTMLDivElement, { profile: BuilderProfile; isSatori?: boolean }>(
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
        className={`relative flex flex-col justify-between ${sizeClass} overflow-hidden font-mono bg-[#FFFBEA] p-4 sm:p-5 md:p-6`}
        style={{ boxShadow: isSatori ? undefined : '0 20px 60px rgba(0,0,0,0.22)' }}
      >
        <div className="absolute inset-2.5 border border-[#0A4226]/15 pointer-events-none z-30" />

        {/* Top Header */}
        <div className="relative flex justify-between items-start w-full z-20 shrink-0">
          <HHLogo filter={FILTER_GREEN} isSatori={isSatori} />
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[#0A4226]/40 text-[6.5px] md:text-[7px] font-bold tracking-[0.25em] uppercase">
              HACKER HOUSE GOA 2026
            </span>
            <span className="text-[#0A4226] text-[5.5px] md:text-[6px] font-bold tracking-[0.2em] uppercase mt-0.5">
              BUILDER ID // {builderId}
            </span>
          </div>
        </div>

        {/* Center QR */}
        <div className="relative z-20 flex flex-col items-center justify-center my-auto w-full gap-4">
          <div className="bg-[#FFFBEA] p-3 shadow-md border border-[#0A4226]/10">
            {qrUrl ? (
              isSatori ? (
                <div className="w-[140px] h-[140px] bg-[#0A4226]" style={{ display: 'flex' }} />
              ) : (
                <QRCode
                  value={qrUrl}
                  size={140}
                  level="M"
                  bgColor="#FFFBEA"
                  fgColor="#0A4226"
                />
              )
            ) : (
              <div className="w-[140px] h-[140px] bg-gray-200" style={{ display: 'flex' }} />
            )}
          </div>
          <span className="font-mono text-[8px] text-[#0A4226] font-bold uppercase tracking-widest px-3 py-1 bg-[#0A4226]/5 border border-[#0A4226]/10">
            SCAN TO IDENTIFY // BUILDER PROFILE
          </span>
        </div>

        {/* Bottom Details */}
        <div className="relative z-20 flex flex-col gap-2.5 shrink-0">
          <div className="w-full h-[2.5px] bg-[#0A4226]" />
          
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[6.5px] md:text-[7px] font-bold text-hh-pink uppercase tracking-[0.2em]">
                SUBJECT NAME
              </span>
              <span className="font-bodoni text-xl sm:text-2xl text-[#0A4226] uppercase leading-none break-words">
                {profile.name || 'YOUR NAME'}
              </span>
            </div>
          </div>
          
          <div className="w-full h-px bg-[#0A4226]/20" />
          
          <div className="flex items-end justify-between gap-2 pt-1 border-t border-[#0A4226]/10">
             <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[6.5px] md:text-[7px] font-bold text-[#0A4226]/50 uppercase tracking-[0.2em]">ASSIGNED TITLE</span>
                <span className="font-bodoni text-sm sm:text-base text-[#0A4226] uppercase tracking-wide leading-tight">
                  {profile.builderTitle || 'AGENT ARCHITECT'}
                </span>
             </div>
             
             <div className="flex flex-col items-end gap-0.5 shrink-0">
                <span className="font-mono text-[7.5px] md:text-[8px] font-bold text-[#0A4226] uppercase tracking-[0.2em]">GOA, INDIA</span>
                <span className="font-mono text-[6.5px] md:text-[7px] text-[#0A4226]/50 uppercase tracking-[0.15em]">28–31 OCT 2026</span>
             </div>
          </div>
        </div>
      </div>
    );
  }
);
EditorialBackCard.displayName = 'EditorialBackCard';
