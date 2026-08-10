/**
 * card-shared.tsx
 * Shared constants and sub-components used across all three card designs.
 * Import from here — never duplicate in individual card files.
 */

import React from 'react';
import { BuilderProfile } from '@/types/builder';

export const generateBuilderId = (name: string | null) => {
  const safeName = (name || 'BUILDER').toUpperCase().trim();
  let hash = 0;
  for (let i = 0; i < safeName.length; i++) {
    hash = (hash << 5) - hash + safeName.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(4, '0').slice(0, 4);
  return `HHG26-${hex}`;
};

// ─── CSS filter presets for SVG/PNG branding assets ───────────────────────────
export const FILTER_YELLOW =
  'brightness(0) saturate(100%) invert(86%) sepia(50%) saturate(1048%) hue-rotate(352deg) brightness(106%) contrast(104%)';

export const FILTER_GREEN =
  'brightness(0) saturate(100%) invert(14%) sepia(48%) saturate(3015%) hue-rotate(139deg) brightness(96%) contrast(101%)';

export const FILTER_WHITE =
  'brightness(0) saturate(100%) invert(100%)';

export const FILTER_PINK = 
  'brightness(0) saturate(100%) invert(24%) sepia(99%) saturate(6011%) hue-rotate(318deg) brightness(105%) contrast(107%)';

// Required for the Terminal / Hacker Card
export const FILTER_MATRIX_GREEN = 
  'brightness(0) saturate(100%) invert(58%) sepia(97%) saturate(3681%) hue-rotate(85deg) brightness(108%) contrast(106%)';

// ─── HH Goa logo lockup (Hacker House png + Hindi "Goa" SVG overlay) ─────────
export const HHLogo = ({ filter = FILTER_YELLOW }: { filter?: string }) => (
  <div className="relative flex justify-center items-center w-[130px] md:w-[150px]">
    <img
      src="/branding/Hacker house.png"
      alt="HACKER HOUSE"
      className="w-full h-auto object-contain"
      style={{ filter }}
    />
    <img
      src="/branding/goa_hindi.svg"
      alt="GOA"
      className="absolute z-10 w-[17%] top-[48%] left-[48%] -translate-x-1/2 -translate-y-1/2"
      style={{ filter: 'drop-shadow(0px 4px 10px rgba(255,20,147,0.4))' }}
    />
  </div>
);

// ─── Prop type for inner card components ──────────────────────────────────────
export interface CardInnerProps {
  profile: BuilderProfile;
  sizeClass: string;
}