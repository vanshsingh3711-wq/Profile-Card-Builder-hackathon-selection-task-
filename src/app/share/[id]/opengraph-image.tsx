import { ImageResponse } from 'next/og';
import { getSharedProfile } from '@/lib/share-profile';

export const runtime = 'nodejs'; // Use Node.js to allow fs access for fallback
export const alt = 'Hacker House Goa 2026 - Builder Identity';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Image({ params }: Props) {
  const { id } = await params;
  const { profile } = await getSharedProfile(id);

  // If no profile found, render a fallback error card or generic card
  if (!profile) {
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
            fontSize: '48px',
          }}
        >
          HACKER HOUSE GOA 2026
          <div style={{ color: '#FF1493', marginTop: 20, fontSize: '32px' }}>
            Builder Profile Not Found
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  }

  const { name, role, builderTitle, stack, photo } = profile;

  return new ImageResponse(
    (
      <div
        style={{
          background: '#042f18',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          padding: '60px',
          fontFamily: 'monospace',
        }}
      >
        {/* Decorative Grid / Lines */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '12px', background: '#FF1493' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '12px', background: '#FFDF00' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '12px', background: '#FFDF00' }} />
        
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', width: '100%', paddingLeft: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#FFDF00', fontSize: '24px', letterSpacing: '4px', textTransform: 'uppercase' }}>HACKER HOUSE GOA 2026</span>
            <span style={{ color: '#FF1493', fontSize: '18px', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '10px' }}>BUILD YOUR BUILDER IDENTITY</span>
          </div>
          <div style={{ display: 'flex', border: '2px solid #FFDF00', padding: '10px 20px', background: 'rgba(255, 223, 0, 0.1)' }}>
            <span style={{ color: '#FFDF00', fontSize: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>STATUS: SECURED</span>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ display: 'flex', flex: 1, gap: '60px', paddingLeft: '20px' }}>
          {/* Left Column: Photo */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
            {photo ? (
              <img
                src={photo}
                width="300"
                height="300"
                style={{
                  objectFit: 'cover',
                  border: '4px solid #FFDF00',
                  boxShadow: '10px 10px 0px 0px rgba(255, 20, 147, 1)'
                }}
              />
            ) : (
              <div style={{ width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', border: '4px solid #FFDF00' }} />
            )}
            
            <div style={{ display: 'flex', marginTop: '30px', flexDirection: 'column', borderTop: '2px dashed rgba(255,223,0,0.3)', paddingTop: '20px' }}>
              <span style={{ color: 'rgba(255,223,0,0.7)', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>Designated Role</span>
              <span style={{ color: '#FFDF00', fontSize: '24px', textTransform: 'uppercase', marginTop: '8px' }}>{role || '—'}</span>
            </div>
          </div>

          {/* Right Column: Details */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            
            <span style={{ color: 'rgba(255,223,0,0.7)', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>Subject Name</span>
            <span style={{ color: '#FFF', fontSize: '64px', textTransform: 'uppercase', marginTop: '10px', lineHeight: 1 }}>{name || '—'}</span>

            <span style={{ color: 'rgba(255,223,0,0.7)', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '40px' }}>Generated Title</span>
            <span style={{ color: '#FF1493', fontSize: '42px', textTransform: 'uppercase', marginTop: '10px' }}>{builderTitle || '—'}</span>

            <span style={{ color: 'rgba(255,223,0,0.7)', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '40px', marginBottom: '16px' }}>Tech Stack</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {stack && stack.length > 0 ? (
                stack.map((t: string) => (
                  <div key={t} style={{ display: 'flex', padding: '8px 16px', border: '2px solid #FF1493', background: 'transparent' }}>
                    <span style={{ color: '#FF1493', fontSize: '18px', textTransform: 'uppercase', letterSpacing: '2px' }}>{t}</span>
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
}
