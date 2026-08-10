import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { SubjectBox } from '@/types/builder';
import { CropControls } from './CropControls';
import { autoFrameSubject } from '@/lib/image/autoFrameSubject';
import { cropImage, PixelCrop } from '@/lib/image/cropImage';
import { Loader2 } from 'lucide-react';

interface PhotoCropEditorProps {
  imageSrc: string;
  subjectBox: SubjectBox | null;
  onConfirm: (processedImage: string) => void;
  onTriggerUpload?: () => void;
  onTriggerCamera?: () => void;
}

export const PhotoCropEditor: React.FC<PhotoCropEditorProps> = ({
  imageSrc,
  subjectBox,
  onConfirm,
  onTriggerUpload,
  onTriggerCamera,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  
  const [mediaSize, setMediaSize] = useState<{ width: number; height: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // When image loads in the cropper, we get its natural dimensions
  const onMediaLoaded = useCallback((mediaSize: { width: number; height: number }) => {
    setMediaSize(mediaSize);
    
    const EXPECTED_SIZE = 400;
    
    const initialFrame = autoFrameSubject(
      mediaSize.width,
      mediaSize.height,
      subjectBox,
      EXPECTED_SIZE,
      EXPECTED_SIZE
    );
    
    setCrop({ x: initialFrame.x, y: initialFrame.y });
    setZoom(initialFrame.zoom);
  }, [subjectBox]);

  const handleAutoFrame = useCallback(() => {
    if (!mediaSize) return;
    
    const initialFrame = autoFrameSubject(
      mediaSize.width,
      mediaSize.height,
      subjectBox,
      400,
      400
    );
    
    setCrop({ x: initialFrame.x, y: initialFrame.y });
    setZoom(initialFrame.zoom);
  }, [mediaSize, subjectBox]);

  const handleReset = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  const onCropComplete = useCallback((_croppedArea: unknown, croppedAreaPixels: PixelCrop) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    
    try {
      setIsProcessing(true);
      const finalImage = await cropImage(imageSrc, croppedAreaPixels);
      onConfirm(finalImage);
    } catch (e) {
      console.error("Failed to crop image", e);
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 animate-in fade-in duration-500">
      {/* EDITOR */}
      <div className="flex flex-col gap-4">
        <div className="text-center mb-2 flex flex-col items-center gap-2">
          <span className="font-mono text-[10px] font-bold text-hh-yellow uppercase tracking-widest border border-hh-yellow/30 bg-hh-yellow/10 px-2.5 py-1">
            Circle Frame
          </span>
          <h2 className="font-bodoni text-3xl md:text-4xl text-hh-yellow uppercase mt-2">
            Adjust Your Frame
          </h2>
          <p className="font-mono text-xs text-hh-cream/50 uppercase tracking-widest mt-1">
            Position your subject exactly how you want them.
          </p>
        </div>

        <div className="relative w-full max-w-[420px] aspect-square mx-auto bg-black border-2 border-hh-yellow/40 rounded-sm overflow-hidden shadow-2xl">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            onMediaLoaded={onMediaLoaded}
            showGrid={false}
            style={{
              containerStyle: { backgroundColor: '#050A05' }
            }}
          />
        </div>

        <p className="text-center font-mono text-[10px] text-hh-cream/40 uppercase tracking-widest mt-1">
          Drag to position &middot; Scroll to zoom
        </p>

        <CropControls 
          zoom={zoom} 
          setZoom={setZoom} 
          onReset={handleReset} 
          onAutoFrame={handleAutoFrame} 
        />
      </div>

      {/* ACTIONS */}
      <div className="w-full max-w-[420px] mx-auto mt-2 flex flex-col gap-3">
        <button
          onClick={handleConfirm}
          disabled={isProcessing || !croppedAreaPixels}
          className="
            relative w-full py-5 bg-hh-pink text-white font-mono font-bold uppercase tracking-[0.2em] text-sm
            border-2 border-hh-pink shadow-[5px_5px_0_0_rgba(255,223,0,1)]
            hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_0_rgba(255,223,0,1)]
            transition-all disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center gap-3
          "
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Perfecting...</span>
            </>
          ) : (
            <span>Use This Photo &rarr;</span>
          )}
        </button>

        {(onTriggerUpload || onTriggerCamera) && (
          <div className="flex items-center gap-3 w-full">
            {onTriggerUpload && (
              <button
                onClick={onTriggerUpload}
                disabled={isProcessing}
                className="flex-1 py-3 bg-[#060B08] border border-white/20 text-white font-mono text-[10px] sm:text-xs uppercase tracking-widest hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Upload New
              </button>
            )}
            {onTriggerCamera && (
              <button
                onClick={onTriggerCamera}
                disabled={isProcessing}
                className="flex-1 py-3 bg-[#060B08] border border-white/20 text-white font-mono text-[10px] sm:text-xs uppercase tracking-widest hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Take New
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
