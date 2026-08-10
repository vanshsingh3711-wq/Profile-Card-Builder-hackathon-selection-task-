/**
 * BuilderCard.tsx
 *
 * Main entry point for card rendering.
 *
 * IMPORTANT:
 * The same BuilderCard instance is used for:
 * - Live preview
 * - Download
 *
 * We do NOT create a second hidden export card.
 */

import React from 'react';

import { BuilderProfile, CardStyle } from '@/types/builder';

import { GoaCard } from './cards/GoaCard';
import { EditorialCard } from './cards/EditorialCard';
import { TerminalCard } from './cards/TerminalCard';

interface BuilderCardProps {
  profile: BuilderProfile;
  style?: CardStyle;
  isSatori?: boolean;
}

export const BuilderCard = React.forwardRef<
  HTMLDivElement,
  BuilderCardProps
>(({ profile, style = 'goa', isSatori }, ref) => {
  /*
   * The preview is responsive.
   *
   * The downloaded image is captured from this SAME DOM element.
   * Therefore there is no second rendering with different dimensions.
   */
  const sizeClass = 'w-full h-auto min-h-[560px] pb-4';

  if (style === 'editorial') {
    return (
      <EditorialCard
        ref={ref}
        profile={profile}
        sizeClass={sizeClass}
        isSatori={isSatori}
      />
    );
  }

  if (style === 'terminal') {
    return (
      <TerminalCard
        ref={ref}
        profile={profile}
        sizeClass={sizeClass}
        isSatori={isSatori}
      />
    );
  }

  return (
    <GoaCard
      ref={ref}
      profile={profile}
      sizeClass={sizeClass}
      isSatori={isSatori}
    />
  );
});

BuilderCard.displayName = 'BuilderCard';