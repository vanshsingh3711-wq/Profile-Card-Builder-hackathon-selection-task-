/**
 * BuilderCard.tsx — Main entry point for card rendering.
 *
 * This file is intentionally thin: it only owns the size calculation and
 * routes to the correct card design based on the `style` prop.
 *
 * Each design lives in its own file under ./cards/:
 *   GoaCard.tsx      — Design 1: dark neon, circular photo, gradient ring
 *   EditorialCard.tsx— Design 2: cream magazine, B&W photo, inner border
 *   TerminalCard.tsx — Design 3: dark cyber, monospace, command prefixes
 */

import React from 'react';
import { BuilderProfile, CardStyle } from '@/types/builder';
import { GoaCard }      from './cards/GoaCard';
import { EditorialCard } from './cards/EditorialCard';
import { TerminalCard }  from './cards/TerminalCard';

interface BuilderCardProps {
  profile: BuilderProfile;
  /** Defaults to 'goa' */
  style?: CardStyle;
  /** Set true when exporting to PNG — renders at 800×1000 px */
  isExport?: boolean;
}

export const BuilderCard = React.forwardRef<HTMLDivElement, BuilderCardProps>(
  ({ profile, style = 'goa', isExport = false }, ref) => {
    // Fixed 4:5 aspect ratio — ideal for X / Instagram sharing
    const sizeClass = isExport
      ? 'w-[800px] h-[1000px]'
      : 'w-full max-w-[460px] aspect-[4/5]';

    if (style === 'editorial') {
      return <EditorialCard ref={ref} profile={profile} sizeClass={sizeClass} />;
    }
    if (style === 'terminal') {
      return <TerminalCard ref={ref} profile={profile} sizeClass={sizeClass} />;
    }
    // Default: 'goa'
    return <GoaCard ref={ref} profile={profile} sizeClass={sizeClass} />;
  }
);

BuilderCard.displayName = 'BuilderCard';