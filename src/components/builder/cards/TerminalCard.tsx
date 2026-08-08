/**
 * TerminalCard.tsx — Design 3: THE TERMINAL
 *
 * Aesthetic: Hacker, dark cyber, CRT monitor.
 * Equal card dimensions, standardized circular photo frame, and 100% visible content.
 */

import React from 'react';
import { CardInnerProps, HHLogo } from './card-shared';
import { CardPhoto } from './CardPhoto';

// CRT Matrix Green Filter for Logos
const FILTER_MATRIX_GREEN = 'brightness(0) saturate(100%) invert(58%) sepia(97%) saturate(3681%) hue-rotate(85deg) brightness(108%) contrast(106%)';

export const TerminalCard = React.forwardRef<HTMLDivElement, CardInnerProps>(
  ({ profile, sizeClass }, ref) => {
    const displayStack = profile.stack?.length > 0
      ? profile.stack
      : ['NEXT.JS', 'GEMINI API', 'SHOPIFY'];

    return (
      <div
        ref={ref}
        className={`relative flex flex-col justify-between ${sizeClass} overflow-hidden font-mono bg-[#050A05] border border-[#00FF41]/20 p-4 sm:p-5 md:p-6`}
        style={{ boxShadow: '0 0 60px rgba(0,255,65,0.08), 0 30px 80px rgba(0,0,0,0.9)' }}
      >
        {/* ── CRT Scanline Overlay ── */}
        <div
          className="absolute inset-0 z-50 pointer-events-none mix-blend-overlay opacity-[0.07]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #00FF41 2px, #00FF41 3px)',
          }}
        />

        {/* ── 1. Top bar (Logo + Status + Branding) ───────────────── */}
        <div className="relative flex justify-between items-center w-full pb-2 z-20 border-b border-[#00FF41]/15 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#FF5F57]" />
              <div className="w-2 h-2 rounded-full bg-[#FEBC2E]" />
              <div className="w-2 h-2 rounded-full bg-[#28C840]" />
            </div>
            <span className="text-[#00FF41]/50 text-[6.5px] md:text-[7.5px] tracking-[0.2em] uppercase font-bold">
              builder.id — v2.6.1
            </span>
          </div>
          <div className="flex items-center gap-2">
            <HHLogo filter={FILTER_MATRIX_GREEN} />
            <span className="text-[#00FF41] text-[9px] font-bold opacity-70">&gt;_</span>
          </div>
        </div>

        {/* ── 2. Circular Photo Header Panel ───────────────────────── */}
        <div className="relative w-full my-auto py-1.5 flex flex-col items-center justify-center border border-[#00FF41]/10 bg-[#00FF41]/[0.02] z-20 shrink-0">
          <div className="absolute top-1 right-2.5 z-10">
            <span className="font-mono text-[6px] md:text-[6.5px] text-[#00FF41]/40 uppercase tracking-[0.2em]">2:47 PM STUDIO</span>
          </div>
          
          <CardPhoto photo={profile.photo} variant="terminal" />

          {/* Waveform bars */}
          <div className="flex items-end gap-[2px] h-2.5 mt-1.5 opacity-60">
            {[3, 6, 2, 8, 5, 4, 7, 3, 5, 6, 2, 4].map((h, i) => (
              <div key={i} className="w-1 bg-[#00FF41]" style={{ height: `${h * 12}%` }} />
            ))}
          </div>
        </div>

        {/* ── 3. Identity & Details Section ──────────────────────────── */}
        <div className="relative z-20 flex flex-col gap-2.5 shrink-0">
          {/* Name & Role */}
          <div>
            <span className="text-[#00FF41]/50 text-[6.5px] md:text-[7px] uppercase tracking-[0.25em] font-bold block mb-0.5">
              {'>'} IDENTITY
            </span>
            <h2
              className="font-mono text-2xl sm:text-3xl md:text-4xl text-[#00FF41] uppercase leading-[0.92] tracking-tighter font-black break-words"
              style={{ textShadow: '0 0 15px rgba(0,255,65,0.6), 0 0 40px rgba(0,255,65,0.2)' }}
            >
              {profile.name || 'VANSH S.'}
            </h2>
            <h3 className="font-mono text-[8.5px] md:text-[9px] text-white/60 uppercase tracking-[0.2em] mt-0.5">
              {profile.role || 'FULL STACK DEV'}
            </h3>
          </div>

          {/* Stack */}
          <div>
            <span className="text-[#00FF41]/50 text-[6.5px] md:text-[7px] uppercase tracking-[0.25em] font-bold block mb-1">
              {'>'} STACK
            </span>
            <div className="flex flex-wrap gap-1">
              {displayStack.map((t: string, i: number) => (
                <span
                  key={i}
                  className="font-mono text-[7.5px] md:text-[8.5px] font-bold text-[#00FF41] border border-[#00FF41]/40 bg-[#00FF41]/5 uppercase tracking-widest px-2 py-0.5"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Builder Title + Footer */}
          <div>
            <span className="text-[#00FF41]/50 text-[6.5px] md:text-[7px] uppercase tracking-[0.25em] font-bold block mb-0.5">
              {'>'} BUILDER_TITLE
            </span>
            <div
              className="w-full border border-[#00FF41]/40 bg-[#00FF41]/8 px-2.5 py-1.5 flex items-center mb-2"
              style={{ boxShadow: '0 0 10px rgba(0,255,65,0.1) inset' }}
            >
              <span
                className="font-mono text-sm md:text-base text-[#00FF41] uppercase tracking-widest font-bold"
                style={{ textShadow: '0 0 8px rgba(0,255,65,0.5)' }}
              >
                <span className="text-[#00FF41]/50 mr-1">{'>'}</span>
                {profile.builderTitle || 'AGENT ARCHITECT'}
                <span className="inline-block w-1.5 h-3 bg-[#00FF41] ml-1 animate-pulse align-middle" />
              </span>
            </div>
          </div>

          {/* Footer Meta */}
          <div className="pt-1.5 border-t border-[#00FF41]/15 flex justify-between items-center bg-black/40">
            <div className="flex items-center gap-1.5">
              <span className="text-[#00FF41] text-[6.5px] md:text-[7px] font-bold tracking-widest uppercase bg-[#00FF41]/15 px-1 py-0.5 border border-[#00FF41]/30">
                &lt;/&gt;
              </span>
              <span className="text-white/40 text-[6.5px] md:text-[7px] tracking-[0.15em] uppercase">
                GOA, INDIA &middot; 28–31 OCT 2026
              </span>
            </div>
            <span className="text-[#00FF41] text-[7px] md:text-[7.5px] font-bold tracking-widest uppercase">#FRAMEINGOA</span>
          </div>
        </div>
      </div>
    );
  }
);

TerminalCard.displayName = 'TerminalCard';