import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface MicMeterProps {
  stream: MediaStream | null;
  isMuted: boolean;
}

const MicMeter: React.FC<MicMeterProps> = ({ stream, isMuted }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    if (!stream || isMuted) {
      setVolume(0);
      return;
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateVolume = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, val) => sum + val, 0) / bufferLength;
      setVolume(average / 255);
      requestAnimationFrame(updateVolume);
    };

    updateVolume();

    return () => {
      source.disconnect();
      audioContext.close();
    };
  }, [stream, isMuted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = isMuted ? '#7A7D85' : '#9B59B6';
      ctx.fillRect(0, 0, canvas.width * volume, canvas.height);
    };

    draw();
  }, [volume, isMuted]);

  return (
    <motion.div
      className={cn('w-24 h-2 bg-neutral-600 rounded-full overflow-hidden')}
      animate={{ scale: isMuted ? 0.9 : 1 }}
    >
      <canvas ref={canvasRef} width={96} height={8} />
    </motion.div>
  );
};

export default MicMeter;