import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWebRTC } from '../hooks/useWebRTC';
import { useMediaDevices } from '../hooks/useMediaDevices';
import MicMeter from '../components/ui/MicMeter';
import Button from '../components/ui/Button';
import VirtualBackground from '../components/layouts/VirtualBackground';
import { toast } from '../components/ui/Toaster';
import { cn } from '../lib/utils';
import { Mic, Headphones, Hand, Lock, Users } from 'lucide-react';

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token') || '';
  
  // Pass the role as the third argument
  const { room, participants, isConnected, isMuted, isDeafened, toggleMute, toggleDeafen } =
    useWebRTC(roomId!, token, 'participant');

  const { devices, selectedAudioDevice, setSelectedAudioDevice } = useMediaDevices();
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isBackgroundEnabled, setIsBackgroundEnabled] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const getStream = async () => {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: selectedAudioDevice },
          video: isBackgroundEnabled,
        });
        setStream(newStream);
      } catch (err) {
        toast.error('Failed to access media devices');
      }
    };
    getStream();
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [selectedAudioDevice, isBackgroundEnabled]);

  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
    toast.success(isHandRaised ? 'Hand lowered' : 'Hand raised');
  };

  const handleLockRoom = () => {
    setIsLocked(!isLocked);
    toast.success(isLocked ? 'Room unlocked' : 'Room locked');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col min-h-screen p-4"
    >
      <VirtualBackground stream={stream} isEnabled={isBackgroundEnabled} />
      <div className="glass-effect p-6 rounded-xl max-w-4xl mx-auto w-full relative z-10">
        <h1 className="text-2xl font-heading text-neutral-100 mb-4">
          Room: {roomId} {isConnected ? '(Connected)' : '(Disconnected)'}
        </h1>

        <div className="flex items-center space-x-4 mb-6">
          <MicMeter stream={stream} isMuted={isMuted} />
          <Button onClick={toggleMute} variant={isMuted ? 'accent' : 'primary'}>
            <Mic className="w-5 h-5 mr-2" />
            {isMuted ? 'Unmute' : 'Mute'}
          </Button>
          <Button onClick={toggleDeafen} variant={isDeafened ? 'accent' : 'primary'}>
            <Headphones className="w-5 h-5 mr-2" />
            {isDeafened ? 'Undeafen' : 'Deafen'}
          </Button>
          <Button onClick={toggleHandRaise} variant={isHandRaised ? 'accent' : 'primary'}>
            <Hand className="w-5 h-5 mr-2" />
            {isHandRaised ? 'Lower Hand' : 'Raise Hand'}
          </Button>
          <Button onClick={() => setIsBackgroundEnabled(!isBackgroundEnabled)}>
            {isBackgroundEnabled ? 'Disable Background' : 'Enable Background'}
          </Button>
        </div>

        <div className="mb-6">
          <label className="block text-neutral-100 mb-1">Audio Device</label>
          <select
            value={selectedAudioDevice}
            onChange={(e) => setSelectedAudioDevice(e.target.value)}
            className="p-2 rounded-lg bg-neutral-600 text-neutral-100"
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-heading text-neutral-100 mb-2">Participants</h2>
          <div className="space-y-2">
            {participants.map((participant) => (
              <div
                key={participant.sid}
                className="flex items-center justify-between p-2 bg-neutral-600 rounded-lg"
              >
                <span className="text-neutral-100">
                  {participant.identity} {participant.isSpeaking && '(Speaking)'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-4">
          <Button onClick={handleLockRoom} variant={isLocked ? 'accent' : 'primary'}>
            <Lock className="w-5 h-5 mr-2" />
            {isLocked ? 'Unlock Room' : 'Lock Room'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default Room;
