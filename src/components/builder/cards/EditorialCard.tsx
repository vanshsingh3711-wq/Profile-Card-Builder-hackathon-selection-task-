/**
 * EditorialCard.tsx — Design 2: THE EDITORIAL
 *
 * Aesthetic: Minimalist, magazine print-style.
 * Equal card dimensions, standardized circular photo frame, and 100% visible content.
 */

import React from 'react';
import { PenTool } from 'lucide-react';
import { FILTER_GREEN, HHLogo, CardInnerProps } from './card-shared';
import { CardPhoto } from './CardPhoto';

export const EditorialCard = React.forwardRef<HTMLDivElement, CardInnerProps>(
  ({ profile, sizeClass }, ref) => {
    const displayStack =
      profile.stack?.length > 0 ? profile.stack : ['NEXT.JS', 'TYPESCRIPT', 'PYTHON'];

    return (
      <div
        ref={ref}
        className={`relative flex flex-col justify-between ${sizeClass} overflow-hidden font-mono bg-[#FFFBEA] p-4 sm:p-5 md:p-6`}
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.22)' }}
      >
        {/* ── Inner decorative border ─────────────────────────────── */}
        <div className="absolute inset-2.5 border border-[#0A4226]/15 pointer-events-none z-30" />

        {/* ── 1. Header (Logo + Studio Branding) ────────────────── */}
        <div className="relative flex justify-between items-start w-full z-20 shrink-0">
          <div className="flex flex-col gap-0.5">
            <img
              src="/branding/2-47.svg"
              alt="2:47 PM STUDIO"
              className="w-8 md:w-9"
              style={{ filter: FILTER_GREEN }}
            />
            <span className="text-[#0A4226]/40 text-[6.5px] md:text-[7px] font-bold tracking-[0.25em] uppercase">
              EST. 2026
            </span>
          </div>
          <HHLogo filter={FILTER_GREEN} />
        </div>

        {/* ── 2. Circular Photo Section ────────────────────────────── */}
        <div className="relative flex justify-center items-center my-auto py-1.5 z-20 shrink-0">
          <div className="relative">
            <CardPhoto photo={profile.photo} variant="editorial" />
            {/* PenTool badge */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 bg-hh-pink rounded-full flex items-center justify-center text-white z-30 shadow-md">
              <PenTool className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
        </div>

        {/* ── 3. Identity & Details Block ──────────────────────────── */}
        <div className="relative z-20 flex flex-col gap-2.5 shrink-0">
          {/* Thick rule */}
          <div className="w-full h-[2.5px] bg-[#0A4226]" />

          {/* Issue line */}
          <span className="font-mono text-[6.5px] md:text-[7px] font-bold text-[#0A4226]/50 uppercase tracking-[0.25em]">
            Builder Identity &middot; Issue No.1
          </span>

          {/* Role */}
          <span className="font-mono text-[8px] md:text-[8.5px] font-bold text-hh-pink uppercase tracking-[0.25em]">
            {profile.role || 'FULL STACK DEVELOPER'}
          </span>

          {/* Name */}
          <h2 className="font-bodoni text-2xl sm:text-3xl md:text-4xl text-[#0A4226] uppercase leading-[0.92] tracking-tight break-words">
            {profile.name || 'YOUR NAME'}
          </h2>

          {/* Thin rule */}
          <div className="w-full h-px bg-[#0A4226]/20" />

          {/* Stack */}
          <div className="flex flex-wrap gap-1">
            {displayStack.map((t: string, i: number) => (
              <span
                key={i}
                className="font-mono text-[7.5px] md:text-[8.5px] font-bold text-[#0A4226] uppercase tracking-widest border border-[#0A4226]/30 px-2 py-0.5 bg-[#0A4226]/[0.02]"
              >
                {t}
              </span>
            ))}
          </div>

          {/* Builder Title + Footer Meta */}
          <div className="flex items-end justify-between gap-2 pt-1 border-t border-[#0A4226]/10">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[6.5px] md:text-[7px] font-bold text-hh-pink uppercase tracking-[0.2em]">
                Assigned Title
              </span>
              <span className="font-bodoni text-base sm:text-lg md:text-xl text-[#0A4226] uppercase tracking-wide leading-tight">
                {profile.builderTitle || 'AGENT ARCHITECT'}
              </span>
            </div>

            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <span className="font-mono text-[7.5px] md:text-[8px] font-bold text-[#0A4226] uppercase tracking-[0.2em]">GOA, INDIA</span>
              <span className="font-mono text-[6.5px] md:text-[7px] text-[#0A4226]/50 uppercase tracking-[0.15em]">28–31 OCT 2026</span>
              <span className="font-mono text-[6.5px] md:text-[7px] font-bold text-hh-pink uppercase tracking-widest">#FrameInGoa</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

EditorialCard.displayName = 'EditorialCard';