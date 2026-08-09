import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  console.log("[api/share] ENTER");
  
  // STEP 4 - RETURN A SIMPLE TEST RESPONSE
  // Bypass everything to see if Vercel routes the request properly
  const testHeader = req.headers.get('x-diagnostic-bypass');
  if (testHeader === 'true') {
    return NextResponse.json({ test: true, status: 'ok' }, { status: 200 });
  }

  try {
    console.log("[api/share] REQUEST_RECEIVED");
    console.log("[api/share] BEFORE_PARSE");
    
    // Check Content-Length to see request size
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

    const isVercel = Boolean(process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV);

    // 1. Try Vercel Blob if BLOB_READ_WRITE_TOKEN is configured
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        console.log("[api/share] BEFORE_BLOB");
        const imageBlob = await put(`shares/${id}.jpeg`, buffer, { access: 'public' });
        if (profile) {
          // Store the generated image URL in the profile for easy access by the share page
          const profileWithImage = { ...profile, photo: imageBlob.url };
          await put(`shares/${id}.json`, JSON.stringify(profileWithImage), { access: 'public' });
        }
        console.log("[api/share] AFTER_BLOB");
        console.log("[api/share] BEFORE_RESPONSE");
        return NextResponse.json({ id });
      } catch (blobErr) {
        console.error('[api/share] Vercel Blob store failed:', blobErr);
        // Fail explicitly in production instead of silently falling to /tmp
        if (isVercel) {
           return NextResponse.json({ error: 'Storage failure', code: 'BLOB_UPLOAD_FAILED' }, { status: 500 });
        }
      }
    }
    
    // 2. Local dev fallback (ONLY if not on Vercel)
    if (isVercel) {
       console.error('[api/share] Missing BLOB_READ_WRITE_TOKEN in Vercel environment');
       return NextResponse.json({ error: 'Storage configuration error', code: 'MISSING_TOKEN' }, { status: 500 });
    }

    const sharesDir = path.join(process.cwd(), 'public', 'shares');
    
    // Ensure directory exists
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
