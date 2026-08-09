import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Hacker House Goa 2026 — Builder Identity';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A4226',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'serif',
        }}
      >
        {/* Background decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,20,147,0.15) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            left: '-100px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,20,147,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Subtle grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.04,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Top date line */}
        <div
          style={{
            position: 'absolute',
            top: '36px',
            left: '48px',
            display: 'flex',
            color: '#FFD700',
            fontSize: '14px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            fontFamily: 'monospace',
            opacity: 0.8,
          }}
        >
          GOA, INDIA · 28 – 31 OCT 2026
        </div>

        {/* Top right branding */}
        <div
          style={{
            position: 'absolute',
            top: '36px',
            right: '48px',
            display: 'flex',
            color: '#FFD700',
            fontSize: '14px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            fontFamily: 'monospace',
            opacity: 0.8,
          }}
        >
          2:47 PM STUDIO
        </div>

        {/* Main title block */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* HACKER HOUSE */}
          <div
            style={{
              fontSize: '96px',
              fontWeight: 900,
              color: '#FFD700',
              letterSpacing: '-0.02em',
              lineHeight: 0.9,
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            HACKER HOUSE
          </div>

          {/* GOA */}
          <div
            style={{
              fontSize: '140px',
              fontWeight: 900,
              color: '#FF1493',
              letterSpacing: '-0.02em',
              lineHeight: 0.85,
              textTransform: 'uppercase',
              marginTop: '-8px',
              display: 'flex',
              textShadow: '0 0 40px rgba(255,20,147,0.4)',
            }}
          >
            GOA
          </div>

          {/* 2026 */}
          <div
            style={{
              fontSize: '48px',
              fontWeight: 700,
              color: '#FFF8DC',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              marginTop: '4px',
              display: 'flex',
              opacity: 0.9,
            }}
          >
            2026
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            marginTop: '28px',
            fontSize: '18px',
            color: '#FFF8DC',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            fontFamily: 'monospace',
            display: 'flex',
            opacity: 0.7,
          }}
        >
          BUILD YOUR BUILDER IDENTITY
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          {/* Hashtag */}
          <div
            style={{
              fontSize: '16px',
              color: '#FF1493',
              letterSpacing: '0.15em',
              fontFamily: 'monospace',
              fontWeight: 700,
              display: 'flex',
            }}
          >
            #FrameInGoa
          </div>

          {/* Divider dot */}
          <div
            style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              backgroundColor: '#FFD700',
              display: 'flex',
              opacity: 0.5,
            }}
          />

          {/* CTA */}
          <div
            style={{
              fontSize: '14px',
              color: '#FFF8DC',
              letterSpacing: '0.2em',
              fontFamily: 'monospace',
              display: 'flex',
              opacity: 0.6,
            }}
          >
            GET YOUR BADGE →
          </div>
        </div>

        {/* Decorative border lines */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            right: '20px',
            bottom: '20px',
            border: '1px solid rgba(255,215,0,0.12)',
            display: 'flex',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
