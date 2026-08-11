export async function convertHeicToJpeg(file: File): Promise<File> {
  try {
    // Attempt client-side conversion first
    console.log('[Upload Pipeline] Attempting client-side HEIC conversion using heic2any...');
    const heic2any = (await import('heic2any')).default;
    const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 });
    const blobToUse = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    console.log('[Upload Pipeline] Client-side HEIC conversion succeeded.');
    return new File([blobToUse], file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'), { type: 'image/jpeg' });
  } catch (clientError) {
    console.warn('[Upload Pipeline] Client-side HEIC conversion failed, falling back to server-side:', clientError);
    
    // Fallback to server-side API conversion
    console.log('[Upload Pipeline] Sending original HEIC file to /api/convert-heic...');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/convert-heic', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server API returned status: ${response.status}`);
      }

      const blob = await response.blob();
      
      if (!blob || blob.size === 0 || !blob.type.includes('image')) {
        throw new Error('Server returned an empty or invalid blob');
      }

      console.log(`[Upload Pipeline] Server-side HEIC conversion succeeded. Blob size: ${blob.size}`);
      return new File([blob], file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'), { type: 'image/jpeg' });
    } catch (serverError) {
      console.error('[Upload Pipeline] Server-side HEIC conversion also failed:', serverError);
      throw new Error('Both client-side and server-side HEIC conversions failed.');
    }
  }
}
