import { useState, useEffect, useCallback, useRef } from 'react';
import { Room, RoomEvent, Participant } from 'livekit-client';
import { toast } from '../components/ui/Toaster';
import { getAudioConfig } from '../lib/utils';

interface WebRTCState {
  room: Room | null;
  participants: Participant[];
  isConnected: boolean;
  isMuted: boolean;
  isDeafened: boolean;
}

export const useWebRTC = (roomId: string, displayName: string, role: 'host' | 'cohost' | 'participant') => {
  const [state, setState] = useState<WebRTCState>({
    room: null,
    participants: [],
    isConnected: false,
    isMuted: false,
    isDeafened: false,
  });

  const roomRef = useRef<Room | null>(null);

  // Fetch LiveKit token from backend
  const fetchLiveKitToken = useCallback(async () => {
    const res = await fetch(`http://localhost:5000/rooms/${roomId}/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch token');
    return data;
  }, [roomId, displayName, role]);

  const connect = useCallback(async () => {
    try {
      const { token: livekitToken, url } = await fetchLiveKitToken();

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: getAudioConfig().audio as any,
      });

      await room.connect(url, livekitToken, { autoSubscribe: true });

      roomRef.current = room;

      setState((prev) => ({ ...prev, room, isConnected: true }));
      toast.success('Connected to room');

      room.on(RoomEvent.ParticipantConnected, (participant) => {
        setState((prev) => ({
          ...prev,
          participants: [...prev.participants, participant],
        }));
      });

      room.on(RoomEvent.ParticipantDisconnected, (participant) => {
        setState((prev) => ({
          ...prev,
          participants: prev.participants.filter((p) => p.sid !== participant.sid),
        }));
      });

      room.on(RoomEvent.ConnectionStateChanged, (connectionState) => {
        if (connectionState === 'reconnecting') {
          toast.info('Reconnecting...');
        } else if (connectionState === 'disconnected') {
          setState((prev) => ({ ...prev, isConnected: false }));
          toast.error('Disconnected from room');
        }
      });
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to connect to room');
    }
  }, [fetchLiveKitToken]);

  const toggleMute = useCallback(() => {
    setState((prev) => {
      if (prev.room) {
        prev.room.localParticipant.setMicrophoneEnabled(!prev.isMuted);
      }
      return { ...prev, isMuted: !prev.isMuted };
    });
  }, []);

  const toggleDeafen = useCallback(() => {
    setState((prev) => {
      const newDeafened = !prev.isDeafened;

      prev.room?.participants.forEach((participant) => {
        participant.audioTracks.forEach((publication) => {
          const track = publication.track;
          if (track && track.kind === 'audio') {
            const elements = track.detach();
            elements.forEach((el) => {
              if (el instanceof HTMLAudioElement) {
                el.muted = newDeafened;
              }
              track.attach(el);
            });
          }
        });
      });

      return { ...prev, isDeafened: newDeafened };
    });
  }, []);

  useEffect(() => {
    if (roomId && displayName && role) {
      connect();
    }

    return () => {
      roomRef.current?.disconnect();
    };
  }, [roomId, displayName, role, connect]);

  return {
    ...state,
    toggleMute,
    toggleDeafen,
  };
};
