import { head, get, BlobNotFoundError } from '@vercel/blob';
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

/**
 * Deterministic head() lookup for the image blob.
 *
 * Tries .jpeg (canonical format) first, then .jpg and .png
 * for backward compatibility with older shares.
 *
 * Returns the HeadBlobResult (with .url) or null.
 */
async function findImageBlob(id: string) {
  const extensions = ['jpeg', 'jpg', 'png'];
  for (const ext of extensions) {
    try {
      const result = await head(`shares/${id}.${ext}`);
      return result;
    } catch (err) {
      if (err instanceof BlobNotFoundError) {
        continue; // try next extension
      }
      throw err; // unexpected error — propagate
    }
  }
  return null;
}

// ─── Main accessor ──────────────────────────────────────────────────

/**
 * Retrieve a shared builder profile by ID.
 *
 * Resolution order:
 *  1. Vercel Blob (production)  — uses deterministic head() / get() lookups
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

  console.log(`[share-profile] LOOKUP_START id=${id}`);

  // ── 1. Vercel Blob ──────────────────────────────────────────────
  const hasBlobConfig = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
  if (hasBlobConfig) {
    try {
      // Deterministic JSON lookup via get()
      const jsonResult = await get(`shares/${id}.json`, { access: 'public' });

      if (!jsonResult) {
        console.log(`[share-profile] LOOKUP_FAILURE id=${id} reason=JSON_NOT_FOUND`);
        return {
          ok: false,
          error: 'not_found',
          message: `No shared profile found in Blob for ID: ${id}`,
        };
      }

      console.log(`[share-profile] JSON_FOUND=true id=${id}`);

      if (jsonResult.statusCode !== 200 || !jsonResult.stream) {
        console.log(`[share-profile] LOOKUP_FAILURE id=${id} reason=STORAGE_ERROR status=${jsonResult.statusCode}`);
        return {
          ok: false,
          error: 'storage_error',
          message: `Unexpected response for profile JSON (status ${jsonResult.statusCode})`,
        };
      }

      // Read the stream into a string
      const chunks: Uint8Array[] = [];
      const reader = jsonResult.stream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      const jsonText = new TextDecoder().decode(
        chunks.length === 1
          ? chunks[0]
          : new Uint8Array(chunks.reduce((acc, c) => acc + c.length, 0)).map((_, i) => {
              let offset = 0;
              for (const chunk of chunks) {
                if (i < offset + chunk.length) return chunk[i - offset];
                offset += chunk.length;
              }
              return 0;
            })
      );

      let profile: unknown;
      try {
        profile = JSON.parse(jsonText);
      } catch {
        console.log(`[share-profile] LOOKUP_FAILURE id=${id} reason=JSON_MALFORMED`);
        return {
          ok: false,
          error: 'malformed',
          message: `Profile JSON for ${id} is not valid JSON`,
        };
      }

      if (!isValidProfile(profile)) {
        console.log(`[share-profile] LOOKUP_FAILURE id=${id} reason=JSON_INVALID`);
        return {
          ok: false,
          error: 'malformed',
          message: `Profile JSON for ${id} has missing or invalid fields`,
        };
      }

      // Deterministic image lookup via head()
      const imgBlob = await findImageBlob(id);

      // Determine image URL — prefer blob URL, fall back to photo in profile
      const imageUrl = imgBlob?.url || profile.photo || '';
      if (!imageUrl) {
        console.log(`[share-profile] LOOKUP_FAILURE id=${id} reason=IMAGE_MISSING`);
        return {
          ok: false,
          error: 'image_missing',
          message: `No image blob or inline photo found for ID: ${id}`,
        };
      }

      console.log(`[share-profile] IMAGE_FOUND=true id=${id}`);
      console.log(`[share-profile] LOOKUP_SUCCESS id=${id}`);

      return { ok: true, profile, imageUrl };
    } catch (err) {
      // BlobNotFoundError from the JSON get() means the share doesn't exist
      if (err instanceof BlobNotFoundError) {
        console.log(`[share-profile] LOOKUP_FAILURE id=${id} reason=BLOB_NOT_FOUND_ERROR`);
        return {
          ok: false,
          error: 'not_found',
          message: `No shared profile found in Blob for ID: ${id}`,
        };
      }

      console.error(`[share-profile] Blob storage error for ID ${id}:`, err);
      console.log(`[share-profile] LOOKUP_FAILURE id=${id} reason=BLOB_UNAVAILABLE`);
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
    console.error('[share-profile] Running on Vercel but BLOB_READ_WRITE_TOKEN and BLOB_STORE_ID are not set');
    console.log(`[share-profile] LOOKUP_FAILURE id=${id} reason=MISSING_TOKEN_ON_VERCEL`);
    return {
      ok: false,
      error: 'blob_unavailable',
      message: 'Vercel Blob is not configured (BLOB_READ_WRITE_TOKEN and BLOB_STORE_ID missing)',
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

    console.log(`[share-profile] LOOKUP_SUCCESS id=${id} (local)`);
    return { ok: true, profile, imageUrl };
  } catch {
    console.log(`[share-profile] LOOKUP_FAILURE id=${id} reason=LOCAL_NOT_FOUND`);
    return {
      ok: false,
      error: 'not_found',
      message: `No local share found for ID: ${id}`,
    };
  }
}
