import React, { useCallback } from 'react';
import { UploadCloud } from 'lucide-react';
import { convertHeicToJpeg } from "@/lib/image/convertHeic";

interface PhotoUploaderProps {
  onPhotoSelected: (photoDataUrl: string) => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onPhotoSelected }) => {
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) return;

    if (
      file.name.toLowerCase().endsWith('.heic') || 
      file.name.toLowerCase().endsWith('.heif') || 
      file.type === 'image/heic' || 
      file.type === 'image/heif'
    ) {
      try {
        file = await convertHeicToJpeg(file);
      } catch (convertError) {
        console.error('HEIC conversion failed:', convertError);
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onPhotoSelected(result);
      }
    };
    reader.readAsDataURL(file);
  }, [onPhotoSelected]);

  return (
    <div className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-hh-yellow/50 bg-hh-yellow/5 hover:bg-hh-yellow/10 transition-colors rounded-xl cursor-pointer relative group">
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        onChange={handleFileChange}
      />
      <UploadCloud className="w-12 h-12 text-hh-yellow mb-4 group-hover:scale-110 transition-transform" />
      <h3 className="text-xl font-bodoni text-hh-cream mb-2 uppercase">Upload Photo</h3>
      <p className="text-hh-cream/60 text-sm text-center">
        JPG, PNG, or WEBP.<br />
        Square or portrait works best.
      </p>
    </div>
  );
};
