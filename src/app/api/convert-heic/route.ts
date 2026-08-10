import { NextRequest, NextResponse } from 'next/server';
import heicConvert from 'heic-convert';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert using heic-convert (which uses a full WASM build of libheif)
    const convertedBuffer = await heicConvert({
      buffer: buffer,
      format: 'JPEG',
      quality: 0.85
    });

    return new NextResponse(Buffer.from(convertedBuffer), {
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });
  } catch (error: any) {
    console.error('API HEIC Conversion Error:', error?.message || error);
    return NextResponse.json(
      { error: 'Failed to convert HEIC image' },
      { status: 500 }
    );
  }
}
