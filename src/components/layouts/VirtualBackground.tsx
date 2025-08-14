import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface VirtualBackgroundProps {
  stream: MediaStream | null;
  isEnabled: boolean;
}

const VirtualBackground: React.FC<VirtualBackgroundProps> = ({ stream, isEnabled }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!stream || !isEnabled) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    video.srcObject = stream;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleLoadedMetadata = async () => {
      try {
        await video.play();
      } catch (err) {
        console.warn('Video play was interrupted:', err);
      }

      const applyBlur = () => {
        if (!ctx) return;
        ctx.filter = 'blur(10px)';
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        requestAnimationFrame(applyBlur);
      };

      applyBlur();
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.pause();
      video.srcObject = null;
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      ctx.filter = 'none';
    };
  }, [stream, isEnabled]);

  return (
    <motion.div
      className={cn('absolute inset-0 overflow-hidden')}
      animate={{ opacity: isEnabled ? 1 : 0 }}
    >
      <video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} className="w-full h-full" />
    </motion.div>
  );
};

export default VirtualBackground;
