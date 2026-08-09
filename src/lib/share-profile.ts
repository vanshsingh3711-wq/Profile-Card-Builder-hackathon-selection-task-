import { list } from '@vercel/blob';
import path from 'path';
import fs from 'fs/promises';

// ─── Types ──────────────────────────────────────────────────────────

export interface SharedProfile {
  name: string;
  role: string;
  stack: string[];
  builderTitle: string;
  photo: string | null;
}

/**
 * Discriminated-union result from getSharedProfile.
 *
 * Callers can match on `ok` to distinguish success from
 * classified failure — no silent null returns.
 */
export type ShareResult =
  | {
      ok: true;
      profile: SharedProfile;
      imageUrl: string;
    }
  | {
      ok: false;
      error:
        | 'not_found'
        | 'blob_unavailable'
        | 'malformed'
        | 'image_missing'
        | 'storage_error';
      message: string;
    };

// ─── Helpers ────────────────────────────────────────────────────────

const ID_PATTERN = /^[a-z0-9]+$/i;

/** Sanitise the share ID to prevent path traversal / injection. */
function sanitizeId(raw: string): string | null {
  const clean = raw.replace(/\.png$/, '').replace(/\.json$/, '');
  if (!clean || !ID_PATTERN.test(clean)) return null;
  return clean;
}

/** Type-guard: does `obj` look like a valid SharedProfile? */
function isValidProfile(obj: unknown): obj is SharedProfile {
  if (!obj || typeof obj !== 'object') return false;
  const p = obj as Record<string, unknown>;
  return (
    typeof p.name === 'string' &&
    typeof p.role === 'string' &&
    typeof p.builderTitle === 'string' &&
    Array.isArray(p.stack)
  );
}

// ─── Main accessor ──────────────────────────────────────────────────

/**
 * Retrieve a shared builder profile by ID.
 *
 * Resolution order:
 *  1. Vercel Blob (production)  — uses list() with prefix matching
 *  2. public/shares/ (local dev only)
 *
 * /tmp is intentionally NOT used — it is ephemeral on Vercel
 * and cannot be treated as durable storage.
 */
export async function getSharedProfile(rawId: string): Promise<ShareResult> {
  const id = sanitizeId(rawId);
  if (!id) {
    return { ok: false, error: 'not_found', message: `Invalid share ID: "${rawId}"` };
  }

  // ── 1. Vercel Blob ──────────────────────────────────────────────
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      // list() with prefix finds blobs by pathname — no need for full URLs
      const { blobs } = await list({ prefix: `shares/${id}.`, limit: 10 });

      const jsonBlob = blobs.find((b) => b.pathname === `shares/${id}.json`);
      const imgBlob = blobs.find((b) => b.pathname === `shares/${id}.jpeg` || b.pathname === `shares/${id}.jpg` || b.pathname === `shares/${id}.png`);

      if (!jsonBlob) {
        // Blob store is reachable but this share doesn't exist
        return {
          ok: false,
          error: 'not_found',
          message: `No shared profile found in Blob for ID: ${id}`,
        };
      }

      // Fetch the JSON profile from the blob URL
      const res = await fetch(jsonBlob.url, { cache: 'no-store' });
      if (!res.ok) {
        return {
          ok: false,
          error: 'storage_error',
          message: `Failed to fetch profile JSON from Blob (HTTP ${res.status})`,
        };
      }

      let profile: unknown;
      try {
        profile = await res.json();
      } catch {
        return {
          ok: false,
          error: 'malformed',
          message: `Profile JSON for ${id} is not valid JSON`,
        };
      }

      if (!isValidProfile(profile)) {
        return {
          ok: false,
          error: 'malformed',
          message: `Profile JSON for ${id} has missing or invalid fields`,
        };
      }

      // Determine image URL — prefer imgBlob URL, fall back to photo in profile
      const imageUrl = imgBlob?.url || profile.photo || '';
      if (!imageUrl) {
        return {
          ok: false,
          error: 'image_missing',
          message: `No image blob or inline photo found for ID: ${id}`,
        };
      }

      return { ok: true, profile, imageUrl };
    } catch (err) {
      console.error(`[share-profile] Blob storage error for ID ${id}:`, err);
      return {
        ok: false,
        error: 'blob_unavailable',
        message: `Vercel Blob is unreachable or returned an error: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  // ── 2. Local dev fallback: public/shares/ ──────────────────────
  const isVercel = Boolean(process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV);
  if (isVercel) {
    // On Vercel without BLOB_READ_WRITE_TOKEN — this is a config error
    console.error('[share-profile] Running on Vercel but BLOB_READ_WRITE_TOKEN is not set');
    return {
      ok: false,
      error: 'blob_unavailable',
      message: 'Vercel Blob is not configured (BLOB_READ_WRITE_TOKEN missing)',
    };
  }

  // Local development — read from public/shares/
  const publicJsonPath = path.join(process.cwd(), 'public', 'shares', `${id}.json`);
  const publicImgPathJpeg = path.join(process.cwd(), 'public', 'shares', `${id}.jpeg`);
  const publicImgPathPng = path.join(process.cwd(), 'public', 'shares', `${id}.png`);

  try {
    const file = await fs.readFile(publicJsonPath, 'utf8');
    let profile: unknown;
    try {
      profile = JSON.parse(file);
    } catch {
      return {
        ok: false,
        error: 'malformed',
        message: `Local profile JSON for ${id} is not valid JSON`,
      };
    }

    if (!isValidProfile(profile)) {
      return {
        ok: false,
        error: 'malformed',
        message: `Local profile JSON for ${id} has missing or invalid fields`,
      };
    }

    // Check if image file exists locally
    let imageUrl = '';
    try {
      await fs.access(publicImgPathJpeg);
      imageUrl = `/shares/${id}.jpeg`;
    } catch {
      try {
         await fs.access(publicImgPathPng);
         imageUrl = `/shares/${id}.png`;
      } catch {
         // No local image — try inline photo from profile
         imageUrl = profile.photo || '';
      }
    }

    if (!imageUrl) {
      return {
        ok: false,
        error: 'image_missing',
        message: `No local image found for ID: ${id}`,
      };
    }

    return { ok: true, profile, imageUrl };
  } catch {
    return {
      ok: false,
      error: 'not_found',
      message: `No local share found for ID: ${id}`,
    };
  }
}
