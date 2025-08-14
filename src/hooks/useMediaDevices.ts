import { useState, useEffect, useCallback } from 'react';

interface MediaDevice {
  deviceId: string;
  label: string;
  kind: string;
}

export const useMediaDevices = () => {
  const [devices, setDevices] = useState<MediaDevice[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');

  const fetchDevices = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = deviceList
        .filter((device) => device.kind === 'audioinput')
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 5)}`,
          kind: device.kind,
        }));
      setDevices(audioDevices);
      if (audioDevices.length > 0) {
        setSelectedAudioDevice(audioDevices[0].deviceId);
      }
    } catch (error) {
      console.error('Error fetching media devices:', error);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
    navigator.mediaDevices.addEventListener('devicechange', fetchDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', fetchDevices);
    };
  }, [fetchDevices]);

  return { devices, selectedAudioDevice, setSelectedAudioDevice };
};