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
  const TARGET_RATIO = containerWidth / containerHeight;
  const imageRatio = imageWidth / imageHeight;

  // react-easy-crop defaults to objectFit="contain", meaning it fits the image 
  // entirely inside the container. The base scale (zoom=1) is determined by the 
  // dimension that restricts the size first.
  let baseScale: number;
  if (imageRatio > TARGET_RATIO) {
    // Image is wider than container, width determines base scale
    baseScale = containerWidth / imageWidth;
  } else {
    // Image is taller than container, height determines base scale
    baseScale = containerHeight / imageHeight;
  }

  // To prevent black bars, the final scale (baseScale * zoom) must be large enough
  // so that both width and height cover the container dimensions.
  const minScaleX = containerWidth / imageWidth;
  const minScaleY = containerHeight / imageHeight;
  const minRequiredScale = Math.max(minScaleX, minScaleY);
  
  // The minimum zoom required to cover the container completely
  const minZoomToCover = minRequiredScale / baseScale;

  if (!subjectBox) {
    return { x: 0, y: 0, zoom: minZoomToCover };
  }

  // Desired height of the subject in the final crop: ~45% of the container height
  // (Since the AI now returns ONLY the face, we want the face to take up 45% of the circle)
  const desiredSubjectHeightInContainer = containerHeight * 0.45;
  const currentSubjectHeightInContainer = subjectBox.height * baseScale;

  let zoom = desiredSubjectHeightInContainer / currentSubjectHeightInContainer;
  
  // Enforce minimum zoom so we don't have black bars (must cover the frame)
  zoom = Math.max(minZoomToCover, zoom);
  
  // Don't zoom in too much either, say max 4x of the minZoomToCover
  zoom = Math.min(minZoomToCover * 4, zoom);

  // Now calculate the required translation (x, y).
  // The center of the image in pixel space:
  const imageCenterX = imageWidth / 2;
  const imageCenterY = imageHeight / 2;

  // The center of the subject in pixel space:
  const subjectCenterX = subjectBox.x + subjectBox.width / 2;
  // Since the box is exactly the face, we use 0.5 to center it perfectly.
  const subjectCenterY = subjectBox.y + subjectBox.height * 0.5;

  // The difference between the desired subject center and the image center.
  // In react-easy-crop, a negative translation moves the image down/right, 
  // effectively shifting the "camera" up/left towards the subject.
  const diffX = subjectCenterX - imageCenterX;
  const diffY = subjectCenterY - imageCenterY;

  // Scale the translation to the base container size. 
  // CRITICAL: react-easy-crop handles the `zoom` scale internally during rendering, 
  // so we ONLY scale by baseScale, NOT by zoom.
  const x = diffX * baseScale;
  const y = diffY * baseScale;

  return { x, y, zoom };
}
