/**
 * GoaCard.tsx — Design 1: THE GOA
 *
 * Aesthetic: Vibrant, neon, dark-mode cinema.
 * Equal card dimensions, standardized circular photo frame, and 100% visible content.
 */

import React from 'react';
import { BadgeCheck, Zap, Sparkles } from 'lucide-react';
import { FILTER_YELLOW, FILTER_WHITE, HHLogo, CardInnerProps, generateBuilderId, baseUrl } from './card-shared';
import { CardPhoto } from './CardPhoto';

export const GoaCard = React.forwardRef<HTMLDivElement, CardInnerProps>(
  ({ profile, sizeClass, isSatori }, ref) => {
    const displayStack =
      profile.stack?.length > 0 ? profile.stack : ['NEXT.JS', 'TYPESCRIPT', 'PYTHON'];
    const builderId = generateBuilderId(profile.name);

    return (
      <div
        ref={ref}
        className={`relative flex flex-col justify-between ${sizeClass} overflow-hidden font-mono bg-[#060B08] p-4 sm:p-5 md:p-6`}
        style={{ boxShadow: isSatori ? undefined : '0 30px 80px rgba(0,0,0,0.8)' }}
      >
        {/* Ambient background glow */}
        {!isSatori && (
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full pointer-events-none opacity-40 blur-2xl"
            style={{ background: 'radial-gradient(circle, rgba(255,20,147,0.3) 0%, rgba(255,225,77,0.15) 50%, transparent 70%)' }}
          />
        )}

        {/* ── 1. Header (Logo + Studio Branding) ────────────────── */}
        <div className="relative flex justify-between items-start w-full z-20 shrink-0">
          <HHLogo filter={FILTER_YELLOW} isSatori={isSatori} />
          <div className="flex flex-col items-end gap-0.5">
            <img
              src={`${baseUrl}/branding/2-47.svg`}
              alt="2:47 PM STUDIO"
              className="w-8 md:w-9 opacity-40"
              style={{ filter: FILTER_WHITE }}
            />
            <span className="text-white/40 text-[6.5px] md:text-[7px] font-bold tracking-[0.2em] uppercase">
              GOA 2026
            </span>
            <span className="text-hh-yellow text-[5px] md:text-[5.5px] font-bold tracking-[0.2em] uppercase mt-0.5 border border-hh-yellow/30 px-1 py-0.5 rounded-sm bg-hh-yellow/10">
              BUILDER ID // {builderId}
            </span>
          </div>
        </div>

        {/* ── 2. Circular Photo Section ────────────────────────────── */}
        <div className="relative flex justify-center items-center my-auto py-1.5 z-20 shrink-0">
          <CardPhoto photo={profile.photo} variant="goa" />
        </div>

        {/* ── 3. Identity & Details Block ──────────────────────────── */}
        <div className="relative z-20 flex flex-col gap-2.5 shrink-0">
          {/* Accent gradient line */}
          <div
            className="w-10 h-[2px]"
            style={{ background: isSatori ? '#FFE14D' : 'linear-gradient(to right, #FFE14D, #FF1493)' }}
          />

          {/* Role */}
          <p className="font-mono text-[8px] md:text-[8.5px] font-bold text-hh-yellow uppercase tracking-[0.25em]">
            {profile.role || 'FULL STACK DEVELOPER'}
          </p>

          {/* Name */}
          <div className="flex items-center gap-1.5">
            <h2
              className="font-bodoni text-2xl sm:text-3xl md:text-4xl text-white uppercase leading-[0.92] tracking-tight break-words"
              style={{ textShadow: '0 2px 15px rgba(255,20,147,0.25)' }}
            >
              {profile.name || 'YOUR NAME'}
            </h2>
            {!isSatori && <BadgeCheck className="w-4 h-4 md:w-5 md:h-5 text-hh-yellow fill-hh-yellow/20 flex-shrink-0" />}
          </div>

          {/* Stack pills */}
          <div className="flex flex-wrap items-center gap-1">
            {displayStack.map((t: string, i: number) => (
              <span
                key={i}
                className="font-mono text-[7.5px] md:text-[8.5px] font-bold text-white/80 uppercase tracking-widest border border-white/15 bg-white/5 px-2 py-0.5 rounded-full"
              >
                {t}
              </span>
            ))}
          </div>

          {/* Hairline divider */}
          <div className="w-full h-px bg-white/10" />

          {/* Builder Title + Footer Meta */}
          <div className="flex items-end justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[6.5px] md:text-[7px] text-white/40 uppercase tracking-[0.2em]">
                ✦ Builder Title ✦
              </span>
              <div className="flex items-center gap-1">
                {!isSatori && <Zap className="w-3 h-3 text-hh-yellow fill-hh-yellow flex-shrink-0" />}
                <span
                  className="font-bodoni text-base sm:text-lg md:text-xl text-hh-pink uppercase tracking-wide leading-tight"
                  style={{ textShadow: '0 0 12px rgba(255,20,147,0.55)' }}
                >
                  {profile.builderTitle || 'AGENT ARCHITECT'}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <div className="flex items-center gap-1">
                {!isSatori && <Sparkles className="w-2.5 h-2.5 text-hh-pink" />}
                <span className="font-mono text-[7.5px] md:text-[8px] font-bold text-hh-yellow uppercase tracking-widest">
                  GOA, INDIA
                </span>
              </div>
              <span className="font-mono text-[6.5px] md:text-[7px] text-white/50 uppercase tracking-widest">
                28–31 OCT 2026
              </span>
              <span className="font-mono text-[6.5px] md:text-[7px] text-white/35 uppercase tracking-widest">
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
