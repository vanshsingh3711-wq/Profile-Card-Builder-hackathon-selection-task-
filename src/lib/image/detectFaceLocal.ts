import * as faceapi from '@vladmandic/face-api';
import { SubjectBox } from '@/types/builder';

let loadPromise: Promise<void> | null = null;

export async function detectFaceLocal(
  imageSrc: string
): Promise<SubjectBox | null> {
  // Prevent race conditions with concurrent loads and ensure TF is ready
  const tStart = performance.now();
  let wasCached = true;
  try {
    if (!loadPromise) {
      wasCached = false;
      loadPromise = (async () => {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      })();
    }
    await loadPromise;
  } catch (e) {
    console.error('Failed to load face detection models:', e);
    loadPromise = null;
    throw new Error('Failed to load face detection models. Please refresh and try again.');
  }
  const tLoad = performance.now();
  if (!wasCached) {
    console.log(`[PERF] model loading: ${(tLoad - tStart).toFixed(0)}ms`);
  }

  // Create an image element to feed into the detector
  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = (err) => {
      console.error('Failed to load image element:', err);
      reject(new Error('Failed to load image for face detection.'));
    };
    img.src = imageSrc;
  });

  // Await decoding to ensure the image data is ready for canvas processing
  // This is critical for iOS Safari where onload might fire before the image is fully parsed
  try {
    await img.decode();
  } catch (e) {
    console.warn('Image decode failed or not supported, proceeding anyway:', e);
  }

  try {
    // Detect a single face using the lightweight tinyFaceDetector
    const detection = await faceapi.detectSingleFace(
      img,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 })
    );

    console.log('detectFaceLocal: detection result =', detection);

    if (!detection) {
      return null;
    }

    // Return the bounding box relative to the original image pixels
    return {
      x: detection.box.x,
      y: detection.box.y,
      width: detection.box.width,
      height: detection.box.height,
    };
  } catch (err) {
    console.error('detectSingleFace error:', err);
    throw new Error('Face detection model encountered an error while processing the image.');
  }
}
