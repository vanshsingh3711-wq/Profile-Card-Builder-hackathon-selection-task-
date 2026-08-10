import * as faceapi from '@vladmandic/face-api';
import { SubjectBox } from '@/types/builder';

let modelsLoaded = false;

export async function detectFaceLocal(
  imageSrc: string
): Promise<SubjectBox | null> {
  // Load the model if not already loaded
  if (!modelsLoaded) {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      modelsLoaded = true;
    } catch (e) {
      console.error('Failed to load face detection models:', e);
      throw new Error('Failed to load face detection models. Please refresh and try again.');
    }
  }

  // Create an image element to feed into the detector
  const img = new Image();
  img.src = imageSrc;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  // Detect a single face using the lightweight tinyFaceDetector
  const detection = await faceapi.detectSingleFace(
    img,
    new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 })
  );

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
}
