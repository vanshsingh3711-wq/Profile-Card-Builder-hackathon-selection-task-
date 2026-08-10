import React from 'react';

import { BuilderProfile, CardStyle } from '@/types/builder';

import { GoaBackCard } from './GoaBackCard';
import { EditorialBackCard } from './EditorialBackCard';
import { TerminalBackCard } from './TerminalBackCard';

interface BackCardProps {
  profile: BuilderProfile;
  style?: CardStyle;
}

export const BackCard = React.forwardRef<HTMLDivElement, BackCardProps>(
  ({ profile, style = 'goa' }, ref) => {
    if (style === 'editorial') {
      return <EditorialBackCard ref={ref} profile={profile} />;
    }

    if (style === 'terminal') {
      return <TerminalBackCard ref={ref} profile={profile} />;
    }

    return <GoaBackCard ref={ref} profile={profile} />;
  }
);

BackCard.displayName = 'BackCard';
