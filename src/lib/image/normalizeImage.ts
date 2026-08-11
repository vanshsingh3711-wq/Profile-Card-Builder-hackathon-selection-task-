import { convertHeicToJpeg } from "./convertHeic";

export interface ImageDimensions {
  width: number;
  height: number;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MIN_WIDTH = 300;
const MIN_HEIGHT = 300;

const SUPPORTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function normalizeImage(originalFile: File): Promise<File> {
  console.log(`[Image Pipeline]
original:
name=${originalFile.name}
type=${originalFile.type}
size=${originalFile.size}`);

  let file = originalFile;

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Image is too large. Please choose an image smaller than 10MB.");
  }
  if (file.size === 0) {
    throw new Error("This image appears to be empty or corrupted.");
  }

  const lowerName = file.name.toLowerCase();
  const isHeic = 
    lowerName.endsWith('.heic') || 
    lowerName.endsWith('.heif') || 
    file.type === 'image/heic' || 
    file.type === 'image/heif';

  console.log(`[Image Pipeline] detectedFormat=${isHeic ? 'heic' : file.type}`);
  console.log(`[Image Pipeline] requiresConversion=${isHeic}`);

  if (isHeic) {
    try {
      const tHeicStart = performance.now();
      file = await convertHeicToJpeg(file);
      const tHeicEnd = performance.now();
      console.log(`[PERF] HEIC conversion: ${(tHeicEnd - tHeicStart).toFixed(0)}ms`);
      console.log(`[Image Pipeline] conversion:
success=true
type=${file.type}
size=${file.size}`);
    } catch (err) {
      console.log(`[Image Pipeline] conversion:
success=false`);
      throw new Error("This specific HEIC format is unsupported. Please convert the photo to JPG and try again.");
    }
  }

  if (!SUPPORTED_TYPES.includes(file.type)) {
    throw new Error("Couldn't read this image. Please upload a JPG, PNG, WebP, HEIC, or HEIF photo.");
  }

  // Strictly verify that the browser can decode this image
  let dimensions: ImageDimensions;
  try {
    dimensions = await verifyAndGetDimensions(file);
    console.log(`[Image Pipeline] browserDecode:
success=true`);
  } catch (err) {
    console.log(`[Image Pipeline] browserDecode:
success=false`);
    if (isHeic) {
      throw new Error("This specific HEIC format is unsupported. Please convert the photo to JPG and try again.");
    }
    throw new Error("Couldn't read this photo. Please try another image.");
  }

  if (dimensions.width < MIN_WIDTH || dimensions.height < MIN_HEIGHT) {
    throw new Error(`Image is too small. Please upload an image at least ${MIN_WIDTH}×${MIN_HEIGHT}px.`);
  }

  return file;
}

function verifyAndGetDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      if (!image.naturalWidth || !image.naturalHeight) {
        reject(new Error("Could not determine image dimensions."));
        return;
      }
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Browser could not decode image."));
    };

    image.src = url;
  });
}
