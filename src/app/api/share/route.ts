import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  try {
    const { image, profile } = await req.json();
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    
    // image is base64 string "data:image/png;base64,..."
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    // 1. Try Vercel Blob if BLOB_READ_WRITE_TOKEN is configured in Vercel environment
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        await put(`shares/${id}.png`, buffer, { access: 'public' });
        if (profile) {
          await put(`shares/${id}.json`, JSON.stringify(profile), { access: 'public' });
        }
        return NextResponse.json({ id });
      } catch (blobErr) {
        console.warn('Vercel Blob store failed, using filesystem fallback:', blobErr);
      }
    }
    
    // 2. Vercel serverless / tmp directory fallback for read-only filesystem
    const isVercel = Boolean(process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV);
    const baseDir = isVercel ? os.tmpdir() : path.join(process.cwd(), 'public');
    const sharesDir = path.join(baseDir, 'shares');
    
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
