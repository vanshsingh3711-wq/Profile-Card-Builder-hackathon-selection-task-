import { ImageResponse } from 'next/og';
import { getSharedProfile } from '@/lib/share-profile';
import { resolvePhotoForSatori } from '@/lib/og-image-utils';
import { BuilderCard } from '@/components/builder/BuilderCard';
import { BackCard } from '@/components/builder/cards/BackCard';

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

  const builderProfile = {
    name,
    role,
    builderTitle,
    stack,
    photo: photoSrc || null,
  };

  const response = new ImageResponse(
    (
      <div
        style={{
          background: '#060B08',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '40px',
        }}
      >
        <div style={{ display: 'flex', width: '450px', height: '562px', transform: 'scale(1)', transformOrigin: 'center' }}>
          <BuilderCard profile={builderProfile} style="goa" />
        </div>
        <div style={{ display: 'flex', width: '450px', height: '562px', transform: 'scale(1)', transformOrigin: 'center' }}>
          <BackCard profile={builderProfile} style="goa" />
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
