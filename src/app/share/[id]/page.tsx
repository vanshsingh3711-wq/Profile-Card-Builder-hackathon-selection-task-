import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { head } from '@vercel/blob';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

type Props = {
  params: Promise<{ id: string }>;
};



export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Hacker House Goa 2026 — Builder Identity',
    description: 'Meet a builder heading to Hacker House Goa 2026. #FrameInGoa',
    openGraph: {
      title: 'Hacker House Goa 2026 — Builder Identity',
      description: 'Meet a builder heading to Hacker House Goa 2026. #FrameInGoa',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Hacker House Goa 2026 — Builder Identity',
      description: 'Meet a builder heading to Hacker House Goa 2026. #FrameInGoa',
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { id } = await params;
  const cleanId = id.replace(/\.png$/, '');
  
  let imageEndpoint = '';

  // 1. Check Vercel Blob first (if configured)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blobInfo = await head(`shares/${cleanId}.png`);
      if (blobInfo && blobInfo.url) {
        imageEndpoint = blobInfo.url;
      }
    } catch (error) {
      console.warn('Vercel Blob fetch failed for page render:', error);
    }
  }

  // 2. Check local public/shares directory (Local dev or pre-built assets)
  if (!imageEndpoint) {
    const publicPath = path.join(process.cwd(), 'public', 'shares', `${cleanId}.png`);
    try {
      await fs.access(publicPath);
      imageEndpoint = `/shares/${cleanId}.png`;
    } catch {
      // Not found in public directory
    }
  }

  // 3. Check os.tmpdir()/shares directory (Vercel serverless /tmp fallback)
  if (!imageEndpoint) {
    const tmpPath = path.join(os.tmpdir(), 'shares', `${cleanId}.png`);
    try {
      const file = await fs.readFile(tmpPath);
      const base64 = file.toString('base64');
      imageEndpoint = `data:image/png;base64,${base64}`;
    } catch {
      // Not found in tmp directory
    }
  }

  // Fallback if not found anywhere (this will likely result in a broken image, but prevents a crash)
  if (!imageEndpoint) {
    imageEndpoint = ''; // Could be a placeholder image if desired
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-hh-green text-hh-cream relative overflow-hidden bg-pattern">
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-hh-pink/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-hh-yellow/10 blur-3xl pointer-events-none" />

      <div className="z-10 flex flex-col items-center max-w-2xl w-full">
        <h1 className="font-bodoni text-3xl md:text-5xl text-hh-yellow uppercase text-center mb-2">
          Builder Identity
        </h1>
        <p className="text-hh-cream/70 mb-8 uppercase tracking-widest text-sm text-center">
          Hacker House Goa 2026
        </p>

        <div className="relative w-full max-w-[400px] mb-8 shadow-2xl shadow-black/50 border border-hh-yellow/20">
          <Image
            src={imageEndpoint}
            alt="Builder Card"
            width={800}
            height={1000}
            className="w-full h-auto object-contain"
            priority
            unoptimized
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-[400px]">
          <Link
            href="/create"
            className="flex-1 flex items-center justify-center px-6 py-4 bg-hh-yellow text-hh-green font-bold uppercase tracking-wider text-sm hover:bg-white transition-colors text-center"
          >
            Create Your Own
          </Link>
          <a
            href={imageEndpoint}
            download={`HH-Goa-2026-${id}.png`}
            className="flex-1 flex items-center justify-center px-6 py-4 bg-hh-pink text-white font-bold uppercase tracking-wider text-sm hover:bg-pink-600 transition-colors text-center"
          >
            Download
          </a>
        </div>
      </div>
    </main>
  );
}
