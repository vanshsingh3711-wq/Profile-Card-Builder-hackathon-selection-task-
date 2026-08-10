import { ImageResponse } from 'next/og';
import { getSharedProfile } from '@/lib/share-profile';
import { resolvePhotoForSatori } from '@/lib/og-image-utils';

export const runtime = 'nodejs';
export const alt = 'Hacker House Goa 2026 - Builder Identity';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Image({ params }: Props) {
  const { id } = await params;

  console.log(`[twitter-image] START id=${id}`);

  const result = await getSharedProfile(id);

  // If no profile found, render a fallback error card
  if (!result.ok) {
    const isNotFound = result.error === 'not_found';
    console.log(`[twitter-image] PROFILE_NOT_FOUND id=${id} error=${result.error}`);
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
              {result.message}
            </div>
          )}
        </div>
      ),
      {
        ...size,
      }
    );
  }

  console.log(`[twitter-image] PROFILE_FOUND id=${id}`);

  const { name, role, builderTitle, stack, profilePhoto } = result.profile;

  // Pre-fetch the profile photo server-side so Satori receives a data URI
  const photoSrc = await resolvePhotoForSatori(profilePhoto, '[twitter-image]');

  console.log(`[twitter-image] IMAGE_RESPONSE_START id=${id}`);

  const response = new ImageResponse(
    (
      <div
        style={{
          background: '#042f18',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          padding: 60,
          fontFamily: 'monospace',
        }}
      >
        {/* Decorative Grid / Lines */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 12, background: '#FF1493', display: 'flex' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 12, background: '#FFDF00', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 12, background: '#FFDF00', display: 'flex' }} />
        
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, width: '100%', paddingLeft: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#FFDF00', fontSize: 24, letterSpacing: 4, textTransform: 'uppercase' }}>HACKER HOUSE GOA 2026</span>
            <span style={{ color: '#FF1493', fontSize: 18, letterSpacing: 2, textTransform: 'uppercase', marginTop: 10 }}>BUILD YOUR BUILDER IDENTITY</span>
          </div>
          <div style={{ display: 'flex', border: '2px solid #FFDF00', padding: '10px 20px', background: 'rgba(255, 223, 0, 0.1)' }}>
            <span style={{ color: '#FFDF00', fontSize: 20, textTransform: 'uppercase', letterSpacing: 2 }}>STATUS: SECURED</span>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ display: 'flex', flex: 1, gap: 60, paddingLeft: 20 }}>
          {/* Left Column: Photo */}
          <div style={{ display: 'flex', flexDirection: 'column', width: 300 }}>
            {photoSrc ? (
              <img
                src={photoSrc}
                style={{
                  width: 300,
                  height: 300,
                  objectFit: 'cover',
                  border: '4px solid #FFDF00',
                  boxShadow: '10px 10px 0 rgba(255, 20, 147, 1)',
                }}
              />
            ) : (
              <div style={{ width: 300, height: 300, background: 'rgba(255,255,255,0.1)', border: '4px solid #FFDF00', display: 'flex' }} />
            )}
            
            <div style={{ display: 'flex', marginTop: 30, flexDirection: 'column', borderTop: '2px dashed rgba(255,223,0,0.3)', paddingTop: 20 }}>
              <span style={{ color: 'rgba(255,223,0,0.7)', fontSize: 14, letterSpacing: 2, textTransform: 'uppercase' }}>Designated Role</span>
              <span style={{ color: '#FFDF00', fontSize: 24, textTransform: 'uppercase', marginTop: 8 }}>{role || '—'}</span>
            </div>
          </div>

          {/* Right Column: Details */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            
            <span style={{ color: 'rgba(255,223,0,0.7)', fontSize: 14, letterSpacing: 2, textTransform: 'uppercase' }}>Subject Name</span>
            <span style={{ color: '#FFF', fontSize: 64, textTransform: 'uppercase', marginTop: 10, lineHeight: 1 }}>{name || '—'}</span>

            <span style={{ color: 'rgba(255,223,0,0.7)', fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', marginTop: 40 }}>Generated Title</span>
            <span style={{ color: '#FF1493', fontSize: 42, textTransform: 'uppercase', marginTop: 10 }}>{builderTitle || '—'}</span>

            <span style={{ color: 'rgba(255,223,0,0.7)', fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', marginTop: 40, marginBottom: 16 }}>Tech Stack</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {stack && stack.length > 0 ? (
                stack.map((t: string) => (
                  <div key={t} style={{ display: 'flex', padding: '8px 16px', border: '2px solid #FF1493', background: 'transparent' }}>
                    <span style={{ color: '#FF1493', fontSize: 18, textTransform: 'uppercase', letterSpacing: 2 }}>{t}</span>
                  </div>
                ))
              ) : (
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>
              )}
            </div>

          </div>
        </div>

      </div>
    ),
    {
      ...size,
    }
  );

  console.log(`[twitter-image] IMAGE_RESPONSE_SUCCESS id=${id}`);
  return response;
}
