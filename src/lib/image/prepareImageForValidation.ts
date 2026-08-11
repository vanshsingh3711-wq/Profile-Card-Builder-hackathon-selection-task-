/**
 * Prepares an image for AI validation by resizing it to a maximum dimension
 * of 1200px (longest side) and converting it to a WebP or JPEG data URL.
 *
 * This saves bandwidth and processing time since the AI only needs to
 * detect the subject, not process the full resolution image.
 */
export async function prepareImageForValidation(
  file: File
): Promise<{ file: File; scaleFactor: number }> {
  const tStart = performance.now();
  const image = await loadImage(file);
  const MAX_SIZE = 1200;

  let { width, height } = image;
  const originalWidth = width;

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

  const scaleFactor = originalWidth / width;

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to create blob from canvas"));
        return;
      }
      const tEnd = performance.now();
      const validationFile = new File([blob], "validation.jpg", { type: "image/jpeg" });
      
      console.log(`[PERF] image resize/compression: ${(tEnd - tStart).toFixed(0)}ms`);
      console.log(`[Validation Image]
original size=${file.size}
validation size=${validationFile.size}
validation type=${validationFile.type}
width=${width}
height=${height}`);
      
      resolve({ file: validationFile, scaleFactor });
    }, "image/jpeg", 0.75);
  });
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
