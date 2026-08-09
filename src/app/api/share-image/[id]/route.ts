import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { head } from '@vercel/blob';

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: Props) {
  const { id } = await params;
  const cleanId = id.replace(/\.png$/, '');

  // 1. Check Vercel Blob first (if configured)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blobInfo = await head(`shares/${cleanId}.png`);
      if (blobInfo && blobInfo.url) {
        return NextResponse.redirect(blobInfo.url);
      }
    } catch (error) {
      // Blob not found or error, fallback to local fs
    }
  }

  // 2. Check local public/shares directory (Local dev or pre-built assets)
  const publicPath = path.join(process.cwd(), 'public', 'shares', `${cleanId}.png`);
  try {
    const file = await fs.readFile(publicPath);
    return new NextResponse(file, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    // Not found in public directory
  }

  // 2. Check os.tmpdir()/shares directory (Vercel serverless /tmp fallback)
  const tmpPath = path.join(os.tmpdir(), 'shares', `${cleanId}.png`);
  try {
    const file = await fs.readFile(tmpPath);
    return new NextResponse(file, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    // Not found in tmp directory
  }

  return NextResponse.json({ error: 'Share image not found' }, { status: 404 });
}
