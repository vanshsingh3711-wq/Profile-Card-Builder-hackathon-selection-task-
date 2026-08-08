/**
 * GoaCard.tsx — Design 1: THE GOA
 *
 * Aesthetic: Vibrant, neon, dark-mode cinema.
 * Full-bleed photo top half with cinematic gradient, bold name over photo,
 * clean identity block below, gradient accent line, floating stack pills.
 */

import React from 'react';
import { BadgeCheck, Zap, Sparkles } from 'lucide-react';
import { FILTER_YELLOW, FILTER_WHITE, HHLogo, CardInnerProps } from './card-shared';

export const GoaCard = React.forwardRef<HTMLDivElement, CardInnerProps>(
  ({ profile, sizeClass }, ref) => {
    const displayStack =
      profile.stack?.length > 0 ? profile.stack : ['NEXT.JS', 'TYPESCRIPT', 'PYTHON'];

    return (
      <div
        ref={ref}
        className={`relative flex flex-col ${sizeClass} overflow-hidden font-mono bg-[#060B08]`}
        style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.8)' }}
      >
        {/* ── Full-bleed photo top half ─────────────────────────────── */}
        <div className="absolute inset-0 z-0">
          {profile.photo ? (
            <img
              src={profile.photo}
              alt="Builder"
              className="w-full h-[60%] object-cover object-top"
              style={{ filter: 'brightness(0.55) saturate(1.15) contrast(1.05)' }}
            />
          ) : (
            <div className="w-full h-[60%] bg-gradient-to-b from-hh-pink/15 via-hh-yellow/5 to-transparent" />
          )}
          {/* Cinematic gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(6,11,8,0.15) 20%, rgba(6,11,8,0.6) 48%, rgba(6,11,8,0.97) 68%, rgba(6,11,8,1) 80%)',
            }}
          />
          {/* Subtle pink glow at mid-point */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-[300px] h-[200px] rounded-full pointer-events-none"
            style={{ top: '45%', background: 'radial-gradient(ellipse, rgba(255,20,147,0.12) 0%, transparent 70%)' }}
          />
        </div>

        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="relative flex justify-between items-start w-full px-7 pt-7 z-20">
          <HHLogo filter={FILTER_YELLOW} />
          <div className="flex flex-col items-end gap-1">
            <img
              src="/branding/2-47.svg"
              alt="2:47 PM STUDIO"
              className="w-9 opacity-35"
              style={{ filter: FILTER_WHITE }}
            />
            {/* <span className="text-white/60 text-[9px] font-bold tracking-[0.25em] uppercase">
              2:47 PM STUDIO
            </span> */}
          </div>
        </div>

        {/* ── Identity block ─── sits over the photo/gradient ─────── */}
        <div className="relative z-20 mt-auto px-7 pb-7">
          {/* Accent gradient line */}
          <div
            className="w-14 h-[2px] mb-4"
            style={{ background: 'linear-gradient(to right, #FFE14D, #FF1493)' }}
          />

          {/* Role */}
          <p className="font-mono text-[9px] font-bold text-hh-yellow uppercase tracking-[0.3em] mb-2">
            {profile.role || 'FULL STACK DEVELOPER'}
          </p>

          {/* Name */}
          <div className="flex items-end gap-3 mb-5">
            <h2
              className="font-bodoni text-5xl md:text-6xl text-white uppercase leading-[0.9] tracking-tight break-words"
              style={{ textShadow: '0 2px 20px rgba(255,20,147,0.2)' }}
            >
              {profile.name || 'YOUR NAME'}
            </h2>
            <BadgeCheck className="w-6 h-6 text-hh-yellow fill-hh-yellow/20 flex-shrink-0 mb-1" />
          </div>

          {/* Stack pills */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {displayStack.map((t: string, i: number) => (
              <span
                key={i}
                className="font-mono text-[9px] font-bold text-white/70 uppercase tracking-widest border border-white/12 bg-white/5 px-3 py-1 rounded-full"
              >
                {t}
              </span>
            ))}
          </div>

          {/* Hairline divider */}
          <div className="w-full h-px bg-white/10 mb-5" />

          {/* Builder Title + meta row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[8px] text-white/35 uppercase tracking-[0.25em]">
                ✦ Builder Title ✦
              </span>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-hh-yellow fill-hh-yellow flex-shrink-0" />
                <span
                  className="font-bodoni text-xl md:text-2xl text-hh-pink uppercase tracking-wide"
                  style={{ textShadow: '0 0 20px rgba(255,20,147,0.55)' }}
                >
                  {profile.builderTitle || 'AGENT ARCHITECT'}
                </span>
                <Zap className="w-4 h-4 text-hh-yellow fill-hh-yellow flex-shrink-0" />
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-hh-pink" />
                <span className="font-mono text-[8px] font-bold text-hh-yellow uppercase tracking-widest">
                  GOA, INDIA
                </span>
              </div>
              <span className="font-mono text-[7px] text-white/50 uppercase tracking-widest">
                28–31 OCT 2026
              </span>
              <span className="font-mono text-[7px] text-white/35 uppercase tracking-widest">
                #FRAMEINGOA
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

GoaCard.displayName = 'GoaCard';
