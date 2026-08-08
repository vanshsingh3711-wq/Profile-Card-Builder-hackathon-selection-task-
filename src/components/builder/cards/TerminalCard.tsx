/**
 * TerminalCard.tsx — Design 3: THE TERMINAL
 *
 * Aesthetic: Hacker, dark cyber, CRT monitor.
 * Full-width photo panel as header with green duotone, prominent name glow,
 * cleaner data readout sections, animated cursor blinking, neon green on true black.
 */

import React from 'react';
import { CardInnerProps, HHLogo } from './card-shared';

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
        className={`relative flex flex-col ${sizeClass} overflow-hidden font-mono bg-[#050A05] border border-[#00FF41]/20`}
        style={{ boxShadow: '0 0 60px rgba(0,255,65,0.08), 0 30px 80px rgba(0,0,0,0.9)' }}
      >
        {/* ── CRT Scanline Overlay ── */}
        <div
          className="absolute inset-0 z-50 pointer-events-none mix-blend-overlay opacity-[0.07]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #00FF41 2px, #00FF41 3px)',
          }}
        />

        {/* ── Top bar ── */}
        <div className="relative flex justify-between items-center w-full px-5 pt-5 pb-3 z-20 border-b border-[#00FF41]/15">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
            </div>
            <span className="text-[#00FF41]/50 text-[8px] tracking-[0.3em] uppercase font-bold">
              builder.id — v2.6.1
            </span>
          </div>
          <div className="flex items-center gap-3">
            <HHLogo filter={FILTER_MATRIX_GREEN} />
            <span className="text-[#00FF41] text-[10px] font-bold opacity-70">&gt;_</span>
          </div>
        </div>

        {/* ── Full-width photo header panel ── */}
        <div className="relative w-full overflow-hidden" style={{ height: '38%' }}>
          {profile.photo ? (
            <>
              <img
                src={profile.photo}
                alt="Builder"
                className="w-full h-full object-cover object-center"
                style={{
                  filter: 'grayscale(100%) contrast(1.4) brightness(0.7) sepia(1) hue-rotate(70deg) saturate(4)',
                }}
              />
              {/* Green screen overlay */}
              <div className="absolute inset-0 bg-[#00FF41] mix-blend-screen opacity-10" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center font-mono text-[10px] text-[#00FF41]/40 uppercase tracking-widest animate-pulse">
              [AWAITING_VISUAL_INPUT]
            </div>
          )}
          {/* Bottom gradient fade */}
          <div
            className="absolute bottom-0 left-0 right-0 h-24"
            style={{ background: 'linear-gradient(to top, #050A05, transparent)' }}
          />
          {/* 2:47 watermark */}
          <div className="absolute top-3 right-4 z-10">
            <span className="font-mono text-[7px] text-[#00FF41]/40 uppercase tracking-[0.3em]">2:47 PM STUDIO · GOA 2026</span>
          </div>
          {/* Waveform bars bottom-left */}
          <div className="absolute bottom-3 left-4 flex items-end gap-[2px] h-5 z-10 opacity-60">
            {[3, 6, 2, 8, 5, 4, 7, 3, 5, 6, 2, 4].map((h, i) => (
              <div key={i} className="w-1 bg-[#00FF41]" style={{ height: `${h * 12}%` }} />
            ))}
          </div>
        </div>

        {/* ── Identity section ── */}
        <div className="relative z-20 px-5 pt-4 flex flex-col gap-4">

          {/* Name */}
          <div>
            <span className="text-[#00FF41]/50 text-[8px] uppercase tracking-[0.3em] font-bold block mb-1">
              {'>'} IDENTITY
            </span>
            <h2
              className="font-mono text-4xl md:text-5xl text-[#00FF41] uppercase leading-none tracking-tighter font-black break-words"
              style={{ textShadow: '0 0 20px rgba(0,255,65,0.6), 0 0 60px rgba(0,255,65,0.2)' }}
            >
              {profile.name || 'VANSH S.'}
            </h2>
            <h3 className="font-mono text-[10px] text-white/50 uppercase tracking-[0.2em] mt-1">
              {profile.role || 'FULL STACK DEV'}
            </h3>
          </div>

          {/* Stack */}
          <div>
            <span className="text-[#00FF41]/50 text-[8px] uppercase tracking-[0.3em] font-bold block mb-2">
              {'>'} STACK
            </span>
            <div className="flex flex-wrap gap-1.5">
              {displayStack.map((t: string, i: number) => (
                <span
                  key={i}
                  className="font-mono text-[8px] md:text-[9px] font-bold text-[#00FF41] border border-[#00FF41]/40 bg-[#00FF41]/5 uppercase tracking-widest px-2.5 py-1"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Builder title */}
          <div>
            <span className="text-[#00FF41]/50 text-[8px] uppercase tracking-[0.3em] font-bold block mb-2">
              {'>'} BUILDER_TITLE
            </span>
            <div
              className="w-full border border-[#00FF41]/50 bg-[#00FF41]/8 px-4 py-3 flex items-center"
              style={{ boxShadow: '0 0 12px rgba(0,255,65,0.1) inset' }}
            >
              <span
                className="font-mono text-base md:text-lg text-[#00FF41] uppercase tracking-widest font-bold"
                style={{ textShadow: '0 0 10px rgba(0,255,65,0.5)' }}
              >
                <span className="text-[#00FF41]/50 mr-2">{'>'}</span>
                {profile.builderTitle || 'AGENT ARCHITECT'}
                <span className="inline-block w-2.5 h-4 bg-[#00FF41] ml-1.5 animate-pulse align-middle" />
              </span>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="mt-auto w-full px-5 py-3 border-t border-[#00FF41]/15 flex justify-between items-center z-20 bg-black/40">
          <div className="flex items-center gap-3">
            <span className="text-[#00FF41] text-[8px] font-bold tracking-widest uppercase bg-[#00FF41]/15 px-2 py-0.5 border border-[#00FF41]/30">
              &lt;/&gt;
            </span>
            <span className="text-white/40 text-[7px] md:text-[8px] tracking-[0.2em] uppercase">
              GOA, INDIA · 28–31 OCT 2026
            </span>
          </div>
          <span className="text-[#00FF41] text-[8px] font-bold tracking-widest uppercase">#FRAMEINGOA</span>
        </div>
      </div>
    );
  }
);

TerminalCard.displayName = 'TerminalCard';