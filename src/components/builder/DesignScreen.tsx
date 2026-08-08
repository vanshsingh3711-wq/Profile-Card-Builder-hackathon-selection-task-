'use client';

/**
 * DesignScreen — Step 3 of the builder flow.
 *
 * Shows three live BuilderCard thumbnails (editorial / terminal / goa).
 * The user selects one style and proceeds to the Result.
 */

import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { BuilderCard } from './BuilderCard';
import { BuilderProfile, CardStyle } from '@/types/builder';

interface Props {
  profile: BuilderProfile;
  onStyleSelected: (style: CardStyle) => void;
  onBack: () => void;
}

const STYLES: { id: CardStyle; label: string; subtitle: string }[] = [
  { id: 'editorial', label: 'Editorial', subtitle: 'The Builder' },
  { id: 'terminal', label: 'Terminal', subtitle: 'The Hacker' },
  { id: 'goa',      label: 'Goa',      subtitle: 'The Resident' },
];

export const DesignScreen: React.FC<Props> = ({ profile, onStyleSelected, onBack }) => {
  const [selected, setSelected] = useState<CardStyle>('editorial');

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-hh-yellow/60 hover:text-hh-yellow text-xs uppercase tracking-widest font-mono transition-colors self-start"
        >
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-hh-yellow/30" />
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-hh-yellow">Step 03 / 04 · Choose Look</span>
          <div className="h-px flex-1 bg-hh-yellow/30" />
        </div>
        <h2 className="font-bodoni text-4xl md:text-6xl text-hh-cream uppercase leading-none">
          Choose<br /><span className="text-hh-yellow">Your Look</span>
        </h2>
        <p className="font-mono text-xs text-hh-cream/50 uppercase tracking-widest">
          All three carry the HH Goa identity. Pick the one that fits you.
        </p>
      </div>

      {/* Three card thumbnails */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {STYLES.map(({ id, label, subtitle }) => (
          <button
            key={id}
            onClick={() => setSelected(id)}
            className="flex flex-col gap-3 group text-left"
          >
            {/* Card thumbnail */}
            <div
              className={`relative overflow-hidden transition-all duration-300 w-full aspect-[4/5] rounded-sm
                ${selected === id
                  ? 'ring-4 ring-hh-yellow ring-offset-2 ring-offset-[#0A4226] scale-[1.02]'
                  : 'ring-1 ring-hh-cream/10 opacity-70 hover:opacity-100 hover:ring-hh-yellow/40'}`}
            >
              <BuilderCard profile={profile} style={id} />
              
              {/* Selection indicator */}
              {selected === id && (
                <div className="absolute top-3 right-3 z-30 w-6 h-6 bg-hh-yellow rounded-full shadow-md flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#0A4226] rounded-full" />
                </div>
              )}
            </div>

            {/* Label */}
            <div className={`flex flex-col gap-0.5 transition-colors ${selected === id ? 'text-hh-yellow' : 'text-hh-cream/50 group-hover:text-hh-cream'}`}>
              <span className="font-bodoni text-xl uppercase">{label}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest">{subtitle}</span>
            </div>
          </button>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => onStyleSelected(selected)}
          className="w-full sm:w-auto sm:self-start px-12 py-5 bg-hh-yellow text-[#0A4226] font-mono font-bold uppercase tracking-[0.2em] text-sm hover:bg-white transition-colors shadow-[4px_4px_0_0_rgba(255,20,147,0.8)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_rgba(255,20,147,0.8)] transition-all"
        >
          Generate with {STYLES.find(s => s.id === selected)?.label} Style →
        </button>
        <p className="font-mono text-[10px] text-hh-cream/30 uppercase tracking-widest">
          You can switch styles on the result screen too
        </p>
      </div>
    </div>
  );
};
