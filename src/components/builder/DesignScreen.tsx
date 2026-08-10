'use client';

/**
 * DesignScreen — Step 3 of the builder flow.
 *
 * Shows three live BuilderCard thumbnails (editorial / terminal / goa).
 * The user selects one style and proceeds to the Result.
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { BuilderCard } from './BuilderCard';
import { BuilderProfile, CardStyle } from '@/types/builder';

interface Props {
  profile: BuilderProfile;
  selectedStyle: CardStyle;
  onStyleSelected: (style: CardStyle) => void;
  onBack: () => void;
}

const STYLES: { id: CardStyle; label: string; subtitle: string }[] = [
  { id: 'editorial', label: 'Editorial', subtitle: 'The Builder' },
  { id: 'terminal', label: 'Terminal', subtitle: 'The Hacker' },
  { id: 'goa',      label: 'Goa',      subtitle: 'The Resident' },
];

export const DesignScreen: React.FC<Props> = ({ profile, selectedStyle, onStyleSelected, onBack }) => {

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-hh-yellow/60 hover:text-hh-yellow text-[10px] font-bold uppercase tracking-[0.2em] font-mono transition-colors self-start mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return
        </button>
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-hh-yellow/20" />
          <div className="flex items-center gap-2 px-3 py-1 bg-hh-yellow/5 border border-hh-yellow/20">
            <div className="w-1.5 h-1.5 bg-hh-yellow animate-pulse" />
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-hh-yellow font-bold">
              SYS.INIT // 03:04
            </span>
          </div>
          <div className="h-px flex-1 bg-hh-yellow/20" />
        </div>
        <div className="text-center mt-2 mb-2">
          <h2 className="font-bodoni text-5xl md:text-6xl text-hh-yellow uppercase leading-[0.85]">
            Select
            <br />
            <span className="text-white">Design</span>
          </h2>
          <p className="mt-4 font-mono text-xs md:text-sm text-hh-cream/60 uppercase tracking-widest max-w-lg mx-auto leading-relaxed">
            Identity generated successfully. Choose how it will look.
          </p>
        </div>
      </div>

      {/* Three card thumbnails */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {STYLES.map(({ id, label, subtitle }) => (
          <button
            key={id}
            onClick={() => onStyleSelected(id)}
            className={`flex flex-col gap-4 group text-left p-4 md:p-5 transition-all duration-300 relative border ${
              selectedStyle === id 
                ? 'bg-[#041008] border-hh-yellow shadow-[4px_4px_0_0_rgba(255,223,0,0.2)] scale-[1.02]' 
                : 'bg-black/20 border-transparent hover:border-hh-yellow/30 hover:bg-black/40'
            }`}
          >
            {/* Header Area */}
            <div className="flex items-start justify-between w-full h-8">
               <div className={`font-bodoni text-xl md:text-2xl uppercase transition-colors ${selectedStyle === id ? 'text-hh-yellow' : 'text-white group-hover:text-hh-cream'}`}>
                  {label}
               </div>
               {selectedStyle === id && (
                 <span className="font-mono text-[9px] uppercase tracking-[0.2em] bg-hh-yellow text-[#0A4226] px-2 py-1 font-bold animate-in fade-in zoom-in duration-200">
                   Selected
                 </span>
               )}
            </div>
            
            {/* Description */}
            <div className="font-mono text-[10px] uppercase tracking-widest text-hh-cream/50 -mt-2">
              {subtitle}
            </div>

            {/* Card thumbnail */}
            <div className="relative w-full aspect-[4/5] mt-2 border border-black shadow-xl">
              <BuilderCard profile={profile} style={id} />
              
              {/* Dark overlay for unselected cards */}
              {selectedStyle !== id && (
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-30" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-4 mt-6">
        <button
          onClick={() => onStyleSelected(selectedStyle)}
          className="w-full sm:w-[400px] py-6 bg-hh-pink text-white font-mono font-bold uppercase tracking-[0.2em] text-sm hover:bg-white hover:text-hh-pink transition-all shadow-[0_0_20px_rgba(255,20,147,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
        >
          Confirm Design →
        </button>
      </div>
    </div>
  );
};
