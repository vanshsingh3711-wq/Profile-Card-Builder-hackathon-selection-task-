import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { image, profile } = await req.json();
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    
    // image is base64 string "data:image/png;base64,..."
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
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
