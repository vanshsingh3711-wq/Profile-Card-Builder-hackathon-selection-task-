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

  if (result.ok && result.cardImageUrl) {
    console.log(`[og-image] FETCHING_IMAGE url=${result.cardImageUrl}`);
    try {
      const res = await fetch(result.cardImageUrl);
      if (res.ok) {
        const contentType = res.headers.get('content-type') || 'image/png';
        return new Response(res.body, {
          headers: { 'Content-Type': contentType },
        });
      } else {
        console.log(`[og-image] FETCH_FAILED status=${res.status}`);
      }
    } catch (e) {
      console.log(`[og-image] FETCH_ERROR error=${e}`);
    }
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
