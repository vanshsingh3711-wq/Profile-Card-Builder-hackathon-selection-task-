import { SubjectBox } from "@/types/builder";

export interface CropState {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Calculates an optimal initial crop position (x, y, zoom) 
 * for react-easy-crop based on the AI subject box.
 * 
 * react-easy-crop coordinates:
 * x and y are the translation of the image center from the container center.
 * zoom is the scale factor (1 = fit within container, >1 = zoomed in).
 * 
 * Target aspect ratio: 800 / 800 (1:1)
 */
export function autoFrameSubject(
  imageWidth: number,
  imageHeight: number,
  subjectBox: SubjectBox | null,
  containerWidth: number = 800,
  containerHeight: number = 800
): CropState {
  // If no subject, just use default center fit (zoom = 1, x=0, y=0)
  // Well, react-easy-crop's default zoom = 1 means it fits or covers depending on mode.
  // Assuming objectFit="cover" and we want default crop.
  if (!subjectBox) {
    return { x: 0, y: 0, zoom: 1 };
  }

  const TARGET_RATIO = containerWidth / containerHeight;
  const imageRatio = imageWidth / imageHeight;

  // react-easy-crop's base zoom (zoom=1) sizes the image to cover the container.
  let baseScale: number;
  if (imageRatio > TARGET_RATIO) {
    // Image is wider than container, height determines base scale
    baseScale = containerHeight / imageHeight;
  } else {
    // Image is taller than container, width determines base scale
    baseScale = containerWidth / imageWidth;
  }

  // Desired height of the subject in the final crop: ~70% of the container height
  const desiredSubjectHeightInContainer = containerHeight * 0.7;
  const currentSubjectHeightInContainer = subjectBox.height * baseScale;

  let zoom = desiredSubjectHeightInContainer / currentSubjectHeightInContainer;
  
  // Don't zoom out past the base cover (zoom < 1)
  zoom = Math.max(1, zoom);
  
  // Don't zoom in too much either, say max 3x
  zoom = Math.min(3, zoom);

  // Now calculate the required translation (x, y).
  // The center of the image in pixel space:
  const imageCenterX = imageWidth / 2;
  const imageCenterY = imageHeight / 2;

  // The center of the subject in pixel space:
  const subjectCenterX = subjectBox.x + subjectBox.width / 2;
  // We want the subject slightly higher than center (e.g., face focus)
  const subjectCenterY = subjectBox.y + subjectBox.height * 0.4;

  // The difference between image center and desired subject center
  const diffX = imageCenterX - subjectCenterX;
  const diffY = imageCenterY - subjectCenterY;

  // Scale the difference to the container size (incorporating zoom)
  const x = diffX * baseScale * zoom;
  const y = diffY * baseScale * zoom;

  return { x, y, zoom };
}
