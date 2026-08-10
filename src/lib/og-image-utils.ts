/**
 * og-image-utils.ts
 *
 * Server-side utilities for the OG / Twitter image routes.
 *
 * Satori (used by next/og ImageResponse) is unreliable when
 * fetching remote images — especially Vercel Blob URLs.
 *
 * This module provides a helper that pre-fetches remote images
 * and converts them to data URIs so Satori always receives
 * a deterministic, inline image source.
 */

/**
 * Resolve a profile photo URL into a Satori-safe image source.
 *
 * Handles three cases:
 *  1. Already a `data:` URI → returned as-is
 *  2. Remote URL (https://) → fetched server-side, returned as data URI
 *  3. Null / empty → returns null (caller should render placeholder)
 *
 * Never throws — returns null on failure so the OG card
 * can still render without the photo.
 */
export async function resolvePhotoForSatori(
  url: string | null | undefined,
  logPrefix = '[og-image]'
): Promise<string | null> {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    console.log(`${logPrefix} PHOTO_SOURCE=none`);
    return null;
  }

  // Already a data URI — use directly
  if (url.startsWith('data:')) {
    console.log(`${logPrefix} PHOTO_SOURCE=data_uri`);
    return url;
  }

  // Must be a remote URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    console.log(`${logPrefix} PHOTO_SOURCE=invalid scheme=${url.substring(0, 20)}`);
    return null;
  }

  console.log(`${logPrefix} PHOTO_SOURCE=remote`);
  console.log(`${logPrefix} PHOTO_FETCH_START`);

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      console.log(
        `${logPrefix} PHOTO_FETCH_FAILURE status=${response.status}`
      );
      return null;
    }

    const contentType =
      response.headers.get('content-type') ?? 'image/jpeg';

    const arrayBuffer = await response.arrayBuffer();

    if (arrayBuffer.byteLength === 0) {
      console.log(`${logPrefix} PHOTO_FETCH_FAILURE reason=empty_body`);
      return null;
    }

    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUri = `data:${contentType};base64,${base64}`;

    console.log(
      `${logPrefix} PHOTO_FETCH_SUCCESS bytes=${arrayBuffer.byteLength}`
    );

    return dataUri;
  } catch (err) {
    console.log(
      `${logPrefix} PHOTO_FETCH_FAILURE reason=${err instanceof Error ? err.message : String(err)}`
    );
    return null;
  }
}
