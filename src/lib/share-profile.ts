import { head } from '@vercel/blob';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

export interface SharedProfile {
  name: string;
  role: string;
  stack: string[];
  builderTitle: string;
  photo: string | null;
}

export interface ShareData {
  profile: SharedProfile | null;
  imageEndpoint: string;
}

export async function getSharedProfile(id: string): Promise<ShareData> {
  const cleanId = id.replace(/\.png$/, '').replace(/\.json$/, '');
  
  let profile: SharedProfile | null = null;
  let imageEndpoint = '';

  // 1. Try Vercel Blob first
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const jsonBlobInfo = await head(`shares/${cleanId}.json`);
      if (jsonBlobInfo && jsonBlobInfo.url) {
        const res = await fetch(jsonBlobInfo.url);
        if (res.ok) {
          profile = await res.json();
        }
      }
    } catch (error) {
      console.warn('Vercel Blob fetch failed for JSON profile:', error);
    }
    
    try {
      const imgBlobInfo = await head(`shares/${cleanId}.png`);
      if (imgBlobInfo && imgBlobInfo.url) {
        imageEndpoint = imgBlobInfo.url;
      }
    } catch (error) {
      console.warn('Vercel Blob fetch failed for PNG image:', error);
    }
  }

  // 2. Local public directory fallback (Local dev)
  if (!profile || !imageEndpoint) {
    const publicJsonPath = path.join(process.cwd(), 'public', 'shares', `${cleanId}.json`);
    const publicImgPath = path.join(process.cwd(), 'public', 'shares', `${cleanId}.png`);
    
    try {
      if (!profile) {
        const file = await fs.readFile(publicJsonPath, 'utf8');
        profile = JSON.parse(file);
      }
      if (!imageEndpoint) {
        await fs.access(publicImgPath);
        imageEndpoint = `/shares/${cleanId}.png`;
      }
    } catch {
      // Not found
    }
  }

  // 3. Tmp directory fallback (Vercel Serverless without Blob)
  if (!profile || !imageEndpoint) {
    const tmpJsonPath = path.join(os.tmpdir(), 'shares', `${cleanId}.json`);
    const tmpImgPath = path.join(os.tmpdir(), 'shares', `${cleanId}.png`);
    
    try {
      if (!profile) {
        const file = await fs.readFile(tmpJsonPath, 'utf8');
        profile = JSON.parse(file);
      }
      if (!imageEndpoint) {
        const file = await fs.readFile(tmpImgPath);
        const base64 = file.toString('base64');
        imageEndpoint = `data:image/png;base64,${base64}`;
      }
    } catch {
      // Not found
    }
  }

  return { profile, imageEndpoint };
}
