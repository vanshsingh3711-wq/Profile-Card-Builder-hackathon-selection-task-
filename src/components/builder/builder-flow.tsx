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

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { BuilderProfile, CardStyle, BuilderDraft, DEFAULT_DRAFT, Step } from '@/types/builder';
import { PhotoScreen }    from '../upload/PhotoScreen';
import { IdentityScreen } from './IdentityScreen';
import { DesignScreen }   from './DesignScreen';
import { ResultScreen }   from './ResultScreen';

export const BuilderFlow = () => {
  const [isRestored, setIsRestored] = useState(false);
  const [draft, setDraft] = useState<BuilderDraft>(DEFAULT_DRAFT);

  // Restore draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('builder-draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.step && parsed.profile) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setDraft({
            ...DEFAULT_DRAFT,
            ...parsed,
            identity: { ...DEFAULT_DRAFT.identity, ...(parsed.identity || {}) },
            chat: { ...DEFAULT_DRAFT.chat, ...(parsed.chat || {}) },
            result: { ...DEFAULT_DRAFT.result, ...(parsed.result || {}) },
          });
        }
      }
    } catch (e) {
      console.error('Failed to parse builder draft', e);
      localStorage.removeItem('builder-draft');
    } finally {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsRestored(true);
    }
  }, []);

  // Autosave draft when state changes
  useEffect(() => {
    if (!isRestored) return;
    try {
      localStorage.setItem('builder-draft', JSON.stringify(draft));
    } catch (e) {
      console.error('Failed to save builder draft', e);
    }
  }, [draft, isRestored]);

  // Reset scroll position to top when switching steps
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [draft.step]);

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
    setDraft(prev => ({
      ...prev,
      profile: { ...prev.profile, photo: photoUrl },
      step: 'identity'
    }));
  };

  const handleProfileGenerated = (partial: Partial<BuilderProfile>) => {
    setDraft(prev => {
      const updatedProfile = { ...prev.profile, ...partial };
      return {
        ...prev,
        profile: updatedProfile,
        step: isProfileComplete(updatedProfile) ? 'design' : prev.step
      };
    });
  };

  const handleStyleSelected = (style: CardStyle) => {
    if (!isProfileComplete(draft.profile)) {
      setDraft(prev => ({
        ...prev,
        step: prev.profile.photo ? 'identity' : 'photo'
      }));
      return;
    }
    setDraft(prev => ({
      ...prev,
      cardStyle: style,
      step: 'result'
    }));
  };

  const handleEditProfile = (updated: BuilderProfile) => {
    if (isProfileComplete(updated)) {
      setDraft(prev => ({ ...prev, profile: updated }));
    }
  };

  const handleRestart = () => {
    setDraft(DEFAULT_DRAFT);
    localStorage.removeItem('builder-draft');
  };

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div 
      className={`w-full min-h-screen px-4 py-4 md:px-8 md:py-8 bg-[#0A4226] transition-opacity duration-300 ${isRestored ? 'opacity-100' : 'opacity-0'}`}
    >
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
        {draft.step === 'photo' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PhotoScreen 
              existingPhoto={draft.profile.photo}
              onPhotoSelected={handlePhotoSelected} 
              onResetPhoto={() => setDraft(prev => ({ ...prev, profile: { ...prev.profile, photo: null } }))}
            />
          </div>
        )}

        {draft.step === 'identity' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <IdentityScreen
              profile={draft.profile}
              identityDraft={draft.identity}
              chatDraft={draft.chat}
              onIdentityDraftChange={(updates) => setDraft(prev => ({ ...prev, identity: { ...prev.identity, ...updates } }))}
              onChatDraftChange={(updates) => setDraft(prev => ({ ...prev, chat: { ...prev.chat, ...updates } }))}
              onProfileGenerated={handleProfileGenerated}
              onBack={() => setDraft(prev => ({ ...prev, step: 'photo' }))}
            />
          </div>
        )}

        {draft.step === 'design' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DesignScreen
              profile={draft.profile}
              selectedStyle={draft.cardStyle}
              onStyleSelected={handleStyleSelected}
              onBack={() => setDraft(prev => ({ ...prev, step: 'identity' }))}
            />
          </div>
        )}

        {draft.step === 'result' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ResultScreen
              profile={draft.profile}
              cardStyle={draft.cardStyle}
              resultDraft={draft.result}
              onResultDraftChange={(updates) => setDraft(prev => ({ ...prev, result: { ...prev.result, ...updates } }))}
              onCardStyleChange={(style) => setDraft(prev => ({ ...prev, cardStyle: style }))}
              onEditProfile={handleEditProfile}
              onRestart={handleRestart}
            />
          </div>
        )}
      </div>
    </div>
  );
};