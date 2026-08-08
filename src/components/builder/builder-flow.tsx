'use client';

/**
 * BuilderFlow — Root orchestrator for the 4-step builder experience.
 *
 * Steps:
 *   photo     → Upload a real photo
 *   identity  → AI assistant extracts name / role / stack / title
 *   design    → Choose one of 3 card styles
 *   result    → Preview, download, share
 *
 * State:
 *   step        — current screen
 *   profile     — BuilderProfile (photo + identity data)
 *   cardStyle   — 'editorial' | 'terminal' | 'goa'
 */

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { BuilderProfile, CardStyle } from '@/types/builder';
import { PhotoScreen }    from '../upload/PhotoScreen';
import { IdentityScreen } from './IdentityScreen';
import { DesignScreen }   from './DesignScreen';
import { ResultScreen }   from './ResultScreen';

type Step = 'photo' | 'identity' | 'design' | 'result';

const EMPTY_PROFILE: BuilderProfile = {
  name:         '',
  role:         '',
  stack:        [],
  builderTitle: '',
  photo:        null,
};

export const BuilderFlow = () => {
  const [step,      setStep]      = useState<Step>('photo');
  const [profile,   setProfile]   = useState<BuilderProfile>(EMPTY_PROFILE);
  const [cardStyle, setCardStyle] = useState<CardStyle>('editorial');

  const isProfileComplete = (p: BuilderProfile): boolean => {
    return Boolean(
      p.photo &&
      p.name?.trim() &&
      p.role?.trim() &&
      p.stack &&
      p.stack.length > 0 &&
      p.builderTitle?.trim()
    );
  };

  // ── handlers ─────────────────────────────────────────────────────────────

  const handlePhotoSelected = (photoUrl: string) => {
    setProfile(prev => ({ ...prev, photo: photoUrl }));
    setStep('identity');
  };

  // Called when AI (or manual form) produces a complete profile
  // → go to design selection, not directly to result
  const handleProfileGenerated = (partial: Partial<BuilderProfile>) => {
    const updated = { ...profile, ...partial };
    setProfile(updated);
    if (isProfileComplete(updated)) {
      setStep('design');
    }
  };

  const handleStyleSelected = (style: CardStyle) => {
    if (!isProfileComplete(profile)) {
      setStep(profile.photo ? 'identity' : 'photo');
      return;
    }
    setCardStyle(style);
    setStep('result');
  };

  const handleEditProfile = (updated: BuilderProfile) => {
    if (isProfileComplete(updated)) {
      setProfile(updated);
    }
  };

  const handleRestart = () => {
    setProfile(EMPTY_PROFILE);
    setCardStyle('editorial');
    setStep('photo');
  };

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="w-full min-h-screen px-4 py-4 md:px-8 md:py-8 bg-[#0A4226]">
      {/* Top navigation */}
      <div className="flex items-center justify-between gap-4 mb-8 md:mb-12 max-w-6xl mx-auto w-full px-2">
        <Link
          href="/"
          className="flex items-center gap-2 text-hh-cream/50 hover:text-hh-yellow text-xs uppercase tracking-widest font-mono transition-colors shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Home
        </Link>

        {/* HH Goa logo lockup */}
        <div className="relative flex justify-center items-center w-[140px] sm:w-[170px] md:w-[200px] max-w-full shrink-0">
          <Image
            src="/branding/Hacker house.png"
            alt="HACKER HOUSE"
            width={200}
            height={55}
            className="w-full h-auto object-contain drop-shadow-md"
            priority
          />
          <Image
            src="/branding/goa_hindi.svg"
            alt="GOA"
            width={50}
            height={25}
            className="absolute z-10 w-[24%] top-[48%] left-[48%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_8px_rgba(255,20,147,0.5)]"
          />
        </div>
      </div>

      {/* Step screens */}
      <div className="w-full">
        {step === 'photo' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PhotoScreen onPhotoSelected={handlePhotoSelected} />
          </div>
        )}

        {step === 'identity' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <IdentityScreen
              onProfileGenerated={handleProfileGenerated}
              onBack={() => setStep('photo')}
            />
          </div>
        )}

        {step === 'design' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DesignScreen
              profile={profile}
              onStyleSelected={handleStyleSelected}
              onBack={() => setStep('identity')}
            />
          </div>
        )}

        {step === 'result' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ResultScreen
              profile={profile}
              cardStyle={cardStyle}
              onCardStyleChange={setCardStyle}
              onEditProfile={handleEditProfile}
              onRestart={handleRestart}
            />
          </div>
        )}
      </div>
    </div>
  );
};