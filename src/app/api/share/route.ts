import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  try {
    const { image, profile } = await req.json();
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    
    // image is base64 string "data:image/png;base64,..."
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    const isVercel = Boolean(process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV);

    // 1. Try Vercel Blob if BLOB_READ_WRITE_TOKEN is configured
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const imageBlob = await put(`shares/${id}.png`, buffer, { access: 'public' });
        if (profile) {
          // Store the generated image URL in the profile for easy access by the share page
          const profileWithImage = { ...profile, photo: imageBlob.url };
          await put(`shares/${id}.json`, JSON.stringify(profileWithImage), { access: 'public' });
        }
        return NextResponse.json({ id });
      } catch (blobErr) {
        console.error('Vercel Blob store failed:', blobErr);
        // Fail explicitly in production instead of silently falling to /tmp
        if (isVercel) {
           return NextResponse.json({ error: 'Storage failure' }, { status: 500 });
        }
      }
    }
    
    // 2. Local dev fallback (ONLY if not on Vercel)
    if (isVercel) {
       console.error('Missing BLOB_READ_WRITE_TOKEN in Vercel environment');
       return NextResponse.json({ error: 'Storage configuration error' }, { status: 500 });
    }

    const sharesDir = path.join(process.cwd(), 'public', 'shares');
    
    // Ensure directory exists
    try {
      await fs.access(sharesDir);
    } catch {
      await fs.mkdir(sharesDir, { recursive: true });
    }
    
    await fs.writeFile(path.join(sharesDir, `${id}.png`), buffer);
    
    if (profile) {
      await fs.writeFile(path.join(sharesDir, `${id}.json`), JSON.stringify(profile));
    }
    
    return NextResponse.json({ id });
  } catch (error) {
    console.error('Share generation error:', error);
    return NextResponse.json({ error: 'Failed to save share' }, { status: 500 });
  }
}
