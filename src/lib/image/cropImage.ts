export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

const OUTPUT_WIDTH = 800;
const OUTPUT_HEIGHT = 800;

/**
 * Extracts a high-quality JPEG crop from the original image using 
 * the exact pixel coordinates provided by react-easy-crop.
 */
export async function cropImage(
  imageSrc: string,
  pixelCrop: PixelCrop,
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not create canvas context.");
  }

  canvas.width = OUTPUT_WIDTH;
  canvas.height = OUTPUT_HEIGHT;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Black background in case of transparency
  ctx.fillStyle = "#050A05";
  ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    OUTPUT_WIDTH,
    OUTPUT_HEIGHT
  );

  return canvas.toDataURL("image/jpeg", 0.92);
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });
}
