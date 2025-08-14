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

export const useWebRTC = (roomId: string, token: string) => {
  const [state, setState] = useState<WebRTCState>({
    room: null,
    participants: [],
    isConnected: false,
    isMuted: false,
    isDeafened: false,
  });

  const roomRef = useRef<Room | null>(null);

  const connect = useCallback(async () => {
    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
      audioCaptureDefaults: getAudioConfig().audio as any,
    });

    try {
      console.log('Connecting with token:', token);
      await room.connect('wss://voipproject-wbxy14tp.livekit.cloud', token, {
        autoSubscribe: true,
      });

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
  }, [roomId, token]);

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
          // Detach elements, mute/unmute, and re-attach
          const elements = track.detach();
          elements.forEach((el) => {
            if (el instanceof HTMLAudioElement) {
              el.muted = newDeafened;
            }
            // Re-attach the element to continue rendering
            track.attach(el);
          });
        }
      });
    });

    return { ...prev, isDeafened: newDeafened };
  });
}, []);


  useEffect(() => {
    if (token && roomId) {
      connect();
    }

    return () => {
      roomRef.current?.disconnect();
    };
  }, [token, roomId, connect]);

  return {
    ...state,
    toggleMute,
    toggleDeafen,
  };
};
