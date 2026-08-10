import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { put, del } from '@vercel/blob';

export async function POST(req: NextRequest) {
  console.log("[api/share] ENTER");

  // ── Environment diagnostics (never log actual secrets) ──
  const isVercel = Boolean(process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV);
  const vercelEnv = process.env.VERCEL_ENV || 'local'; // 'production' | 'preview' | 'development' | 'local'
  const blobAuthMode = process.env.BLOB_STORE_ID ? 'oidc' : (process.env.BLOB_READ_WRITE_TOKEN ? 'token' : 'none');
  const hasBlobConfig = blobAuthMode !== 'none';
  console.log(`[api/share] ENV: isVercel=${isVercel}, vercelEnv=${vercelEnv}, blobAuthMode=${blobAuthMode}, hasBlobConfig=${hasBlobConfig}`);

  try {
    console.log("[api/share] REQUEST_RECEIVED");
    console.log("[api/share] BEFORE_PARSE");
    
    const contentLength = req.headers.get('content-length');
    console.log(`[api/share] REQUEST_SIZE: ${contentLength} bytes`);

    const body = await req.json();
    console.log("[api/share] AFTER_PARSE");
    
    console.log("[api/share] BEFORE_VALIDATION");
    const { image, profile } = body;
    
    if (!image || typeof image !== 'string') {
      console.error('[api/share] Missing or invalid image in request body');
      return NextResponse.json({ error: 'Missing or invalid image in request payload', code: 'INVALID_PAYLOAD' }, { status: 400 });
    }
    
    if (!profile) {
      console.error('[api/share] Missing profile in request body');
      return NextResponse.json({ error: 'Missing profile in request payload', code: 'INVALID_PAYLOAD' }, { status: 400 });
    }
    console.log("[api/share] AFTER_VALIDATION");

    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    
    // image is base64 string "data:image/jpeg;base64,..." or "data:image/png;base64,..."
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
    console.log(`[api/share] IMAGE_BUFFER_SIZE: ${buffer.length} bytes`);

    // ── 1. Vercel Blob (production storage) ──
    if (hasBlobConfig) {
      console.log("[api/share] BEFORE_BLOB");

      // Atomic upload: both image and JSON must succeed, or we clean up.
      let imageBlobUrl: string | null = null;
      let photoBlobUrl: string | null = null;

      try {
        // Step 1: Upload image
        const imageBlob = await put(`shares/${id}.jpeg`, buffer, { access: 'public' });
        imageBlobUrl = imageBlob.url;
        console.log("[api/share] IMAGE_UPLOADED");

        // Step 2: Upload user profile photo if it exists
        if (profile.profilePhoto && profile.profilePhoto.startsWith('data:image')) {
          const photoBase64 = profile.profilePhoto.replace(/^data:image\/\w+;base64,/, "");
          const photoBuffer = Buffer.from(photoBase64, 'base64');
          const photoBlob = await put(`shares/${id}-photo.jpeg`, photoBuffer, { access: 'public' });
          photoBlobUrl = photoBlob.url;
          console.log("[api/share] USER_PHOTO_UPLOADED");
        } else if (profile.profilePhoto) {
          // If it was already a URL (e.g. from an existing share)
          photoBlobUrl = profile.profilePhoto;
        }

        // Step 3: Upload profile JSON (Version 2)
        const profileData = {
          name: profile.name,
          role: profile.role,
          stack: profile.stack || [],
          builderTitle: profile.builderTitle,
          profilePhoto: photoBlobUrl,
          cardImageUrl: imageBlobUrl,
          createdAt: new Date().toISOString(),
          version: 2
        };

        await put(`shares/${id}.json`, JSON.stringify(profileData), { access: 'public' });
        console.log("[api/share] PROFILE_UPLOADED");

        console.log("[api/share] BEFORE_RESPONSE");
        return NextResponse.json({ id });
      } catch (blobErr) {
        console.error('[api/share] Vercel Blob upload failed:', blobErr);

        // Attempt cleanup of any partially uploaded blobs
        if (imageBlobUrl) {
          try {
            await del(imageBlobUrl);
            console.log("[api/share] CLEANUP: deleted orphaned image blob");
          } catch (cleanupErr) {
            console.error('[api/share] CLEANUP_FAILED: could not delete orphaned image blob:', cleanupErr);
          }
        }
        if (photoBlobUrl && photoBlobUrl.startsWith('https://')) {
          try {
            await del(photoBlobUrl);
            console.log("[api/share] CLEANUP: deleted orphaned photo blob");
          } catch (cleanupErr) {
            console.error('[api/share] CLEANUP_FAILED: could not delete orphaned photo blob:', cleanupErr);
          }
        }

        // Fail explicitly — do not fall through to local storage on Vercel
        if (isVercel) {
          return NextResponse.json({ error: 'Storage failure', code: 'BLOB_UPLOAD_FAILED' }, { status: 500 });
        }
      }
    }
    
    // ── 2. Vercel without token — configuration error ──
    if (isVercel) {
       console.error('[api/share] Missing BLOB_READ_WRITE_TOKEN or BLOB_STORE_ID in Vercel environment');
       return NextResponse.json({ error: 'Storage configuration error', code: 'MISSING_TOKEN' }, { status: 500 });
    }

    // ── 3. Local dev fallback: public/shares/ ──
    const sharesDir = path.join(process.cwd(), 'public', 'shares');
    
    try {
      await fs.access(sharesDir);
    } catch {
      await fs.mkdir(sharesDir, { recursive: true });
    }
    
    await fs.writeFile(path.join(sharesDir, `${id}.jpeg`), buffer);
    
    if (profile) {
      await fs.writeFile(path.join(sharesDir, `${id}.json`), JSON.stringify(profile));
    }
    
    console.log("[api/share] BEFORE_RESPONSE (Local)");
    return NextResponse.json({ id });
  } catch (error) {
    console.error('[api/share] ERROR', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ error: 'Failed to process share request', code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
