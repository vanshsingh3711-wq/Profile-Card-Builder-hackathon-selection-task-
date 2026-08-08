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

export async function validateImageFile(
  file: File
): Promise<ImageDimensions> {
  /*
   * File type
   */
  if (!SUPPORTED_TYPES.includes(file.type)) {
    throw new Error(
      "Unsupported image format. Please use JPG, PNG, or WEBP."
    );
  }

  /*
   * File size
   */
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      "Image is too large. Please choose an image smaller than 10MB."
    );
  }

  if (file.size === 0) {
    throw new Error("This image appears to be empty or corrupted.");
  }

  /*
   * Read dimensions.
   */
  const dimensions = await getImageDimensions(file);

  if (
    dimensions.width < MIN_WIDTH ||
    dimensions.height < MIN_HEIGHT
  ) {
    throw new Error(
      `Image is too small. Please upload an image at least ${MIN_WIDTH}×${MIN_HEIGHT}px.`
    );
  }

  return dimensions;
}

function getImageDimensions(
  file: File
): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);

      if (!image.naturalWidth || !image.naturalHeight) {
        reject(
          new Error(
            "Could not determine image dimensions."
          )
        );
        return;
      }

      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);

      reject(
        new Error(
          "This image could not be opened. It may be corrupted or unsupported."
        )
      );
    };

    image.src = url;
  });
}