/**
 * EditorialCard.tsx — Design 2: THE EDITORIAL
 *
 * Aesthetic: Minimalist, magazine print-style.
 * Cream background (#FFFBEA), deep green type, full-width B&W photo top,
 * editorial typography panel below with thick rules and PenTool icon.
 */

import React from 'react';
import { PenTool } from 'lucide-react';
import { FILTER_GREEN, HHLogo, CardInnerProps } from './card-shared';

export const EditorialCard = React.forwardRef<HTMLDivElement, CardInnerProps>(
  ({ profile, sizeClass }, ref) => {
    const displayStack =
      profile.stack?.length > 0 ? profile.stack : ['NEXT.JS', 'TYPESCRIPT', 'PYTHON'];

    return (
      <div
        ref={ref}
        className={`relative flex flex-col ${sizeClass} overflow-hidden font-mono bg-[#FFFBEA]`}
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.22)' }}
      >
        {/* ── Inner decorative border ─────────────────────────────── */}
        <div className="absolute inset-3 border border-[#0A4226]/15 pointer-events-none z-30" />

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="relative flex justify-between items-start w-full px-7 pt-6 z-20">
          <div className="flex flex-col gap-0.5">
            <img
              src="/branding/2-47.svg"
              alt="2:47 PM STUDIO"
              className="w-10"
              style={{ filter: FILTER_GREEN }}
            />
            <span className="text-[#0A4226]/40 text-[7px] font-bold tracking-[0.3em] uppercase">
              EST. 2026
            </span>
          </div>
          <HHLogo filter={FILTER_GREEN} />
        </div>

        {/* ── Photo section ──────────────────────────────────────── */}
        <div className="relative w-full px-7 pt-4 z-10" style={{ height: '42%' }}>
          <div className="relative w-full h-full overflow-hidden border border-[#0A4226]/20">
            {profile.photo ? (
              <img
                src={profile.photo}
                alt="Builder"
                className="absolute inset-0 w-full h-full object-cover object-center"
                style={{ filter: 'grayscale(100%) contrast(1.1) brightness(0.92)' }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center font-bodoni text-lg uppercase text-[#0A4226]/25 text-center bg-[#0A4226]/5">
                No<br />Photo
              </div>
            )}
            {/* PenTool badge */}
            <div className="absolute top-3 right-3 w-8 h-8 bg-hh-pink flex items-center justify-center text-white z-10">
              <PenTool className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* ── Editorial info panel ───────────────────────────────── */}
        <div className="flex-1 flex flex-col px-7 pt-4 pb-6 z-20">

          {/* Thick rule */}
          <div className="w-full h-[3px] bg-[#0A4226] mb-3" />

          {/* Issue line */}
          <span className="font-mono text-[7px] font-bold text-[#0A4226]/40 uppercase tracking-[0.3em] mb-3">
            Builder Identity · Issue No.1
          </span>

          {/* Role */}
          <span className="font-mono text-[8px] font-bold text-hh-pink uppercase tracking-[0.3em] mb-1">
            {profile.role || 'FULL STACK DEVELOPER'}
          </span>

          {/* Name */}
          <h2 className="font-bodoni text-4xl md:text-5xl text-[#0A4226] uppercase leading-[0.88] tracking-tight break-words mb-3">
            {profile.name || 'YOUR NAME'}
          </h2>

          {/* Thin rule */}
          <div className="w-full h-px bg-[#0A4226]/20 mb-3" />

          {/* Stack */}
          <div className="flex flex-wrap gap-1.5 mb-auto">
            {displayStack.map((t: string, i: number) => (
              <span
                key={i}
                className="font-mono text-[8px] font-bold text-[#0A4226] uppercase tracking-widest border border-[#0A4226]/30 px-2 py-0.5"
              >
                {t}
              </span>
            ))}
          </div>

          {/* Builder Title */}
          <div className="mt-3">
            <div className="w-full h-[2px] bg-[#0A4226]/15 mb-2" />
            <span className="font-mono text-[7px] font-bold text-hh-pink uppercase tracking-[0.3em] block mb-1">
              Assigned Title
            </span>
            <span className="font-bodoni text-xl md:text-2xl text-[#0A4226] uppercase tracking-wide leading-tight">
              {profile.builderTitle || 'AGENT ARCHITECT'}
            </span>
          </div>

          {/* Footer */}
          <div className="mt-4 flex justify-between items-end">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[7px] font-bold text-[#0A4226] uppercase tracking-[0.2em]">GOA, INDIA</span>
              <span className="font-mono text-[7px] text-[#0A4226]/40 uppercase tracking-[0.15em]">28–31 OCT 2026</span>
            </div>
            <span className="font-mono text-[7px] font-bold text-hh-pink uppercase tracking-widest">#FrameInGoa</span>
          </div>
        </div>
      </div>
    );
  }
);

EditorialCard.displayName = 'EditorialCard';
