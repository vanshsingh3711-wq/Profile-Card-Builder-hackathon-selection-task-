import React from 'react';

import { BuilderProfile, CardStyle } from '@/types/builder';

import { GoaBackCard } from './GoaBackCard';
import { EditorialBackCard } from './EditorialBackCard';
import { TerminalBackCard } from './TerminalBackCard';

interface BackCardProps {
  profile: BuilderProfile;
  style?: CardStyle;
  isSatori?: boolean;
}

export const BackCard = React.forwardRef<HTMLDivElement, BackCardProps>(
  ({ profile, style = 'goa', isSatori }, ref) => {
    if (style === 'editorial') {
      return <EditorialBackCard ref={ref} profile={profile} isSatori={isSatori} />;
    }

    if (style === 'terminal') {
      return <TerminalBackCard ref={ref} profile={profile} isSatori={isSatori} />;
    }

    return <GoaBackCard ref={ref} profile={profile} isSatori={isSatori} />;
  }
);

BackCard.displayName = 'BackCard';
