export async function convertHeicToJpeg(file: File): Promise<File> {
  try {
    // Attempt client-side conversion first
    const heic2any = (await import('heic2any')).default;
    const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 });
    const blobToUse = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    return new File([blobToUse], file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'), { type: 'image/jpeg' });
  } catch (clientError) {
    console.warn('Client-side HEIC conversion failed, falling back to server:', clientError);
    
    // Fallback to server-side API conversion
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/convert-heic', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Server-side HEIC conversion failed');
    }

    const blob = await response.blob();
    return new File([blob], file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'), { type: 'image/jpeg' });
  }
}
