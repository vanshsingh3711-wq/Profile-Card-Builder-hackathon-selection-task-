import { ImageResponse } from 'next/og';
import { getSharedProfile } from '@/lib/share-profile';

export const runtime = 'nodejs';
export const alt = 'Hacker House Goa 2026 - Builder Identity';
export const size = { width: 1200, height: 630 };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Image({ params }: Props) {
  const { id } = await params;

  console.log(`[og-image] START id=${id}`);

  const result = await getSharedProfile(id);

  const frontUrl = result.ok ? result.cardImageUrl : null;
  const backUrl = result.ok ? result.profile.profilePhoto : null;

  if (result.ok && frontUrl) {
    console.log(`[og-image] COMPOSING_IMAGE front=${frontUrl} back=${backUrl}`);
    return new ImageResponse(
      (
        <div
          style={{
            background: '#042f18',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '40px',
          }}
        >
          <img src={frontUrl} style={{ height: '550px', objectFit: 'contain' }} />
          {backUrl && <img src={backUrl} style={{ height: '550px', objectFit: 'contain' }} />}
        </div>
      ),
      { ...size }
    );
  }

  // If no profile found or fetch fails, render a fallback error card
  const isNotFound = !result.ok && result.error === 'not_found';
  const errorMessage = !result.ok ? result.message : 'Failed to load image';
  console.log(`[og-image] FALLBACK id=${id} error=${!result.ok ? result.error : 'fetch_failed'}`);
  
  return new ImageResponse(
    (
      <div
        style={{
          background: '#042f18',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          color: '#FFDF00',
          fontSize: 48,
        }}
      >
        HACKER HOUSE GOA 2026
        <div style={{ color: '#FF1493', marginTop: 20, fontSize: 32 }}>
          {isNotFound ? 'Builder Profile Not Found' : 'Profile Unavailable'}
        </div>
        {!isNotFound && (
          <div style={{ color: 'rgba(255,255,255,0.7)', marginTop: 20, fontSize: 20 }}>
            {errorMessage}
          </div>
        )}
      </div>
    ),
    {
      ...size,
    }
  );
}
