/**
 * Prepares an image for AI validation by resizing it to a maximum dimension
 * of 1200px (longest side) and converting it to a WebP or JPEG data URL.
 *
 * This saves bandwidth and processing time since the AI only needs to
 * detect the subject, not process the full resolution image.
 */
export async function prepareImageForValidation(
  file: File
): Promise<string> {
  // If it's HEIC, we might need a special library or just fail gracefully 
  // since most browsers don't support native HEIC decoding on canvas.
  if (
    file.type === "image/heic" ||
    file.name.toLowerCase().endsWith(".heic")
  ) {
    throw new Error(
      "HEIC format is not supported by the browser. Please upload a JPG or PNG."
    );
  }

  const image = await loadImage(file);
  const MAX_SIZE = 1200;

  let { width, height } = image;

  if (width > MAX_SIZE || height > MAX_SIZE) {
    if (width > height) {
      height = Math.round((height * MAX_SIZE) / width);
      width = MAX_SIZE;
    } else {
      width = Math.round((width * MAX_SIZE) / height);
      height = MAX_SIZE;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create canvas context for image preparation.");
  }

  // Draw white background in case of transparent PNGs
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  ctx.drawImage(image, 0, 0, width, height);

  // Use WebP if possible, fallback to JPEG
  const dataUrl = canvas.toDataURL("image/webp", 0.85);
  
  if (dataUrl.startsWith("data:image/webp")) {
    return dataUrl;
  }
  
  return canvas.toDataURL("image/jpeg", 0.85);
}

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to load image."));
    };

    image.src = url;
  });
}
