import { useState, useEffect, useCallback } from 'react';
import { Room, RoomEvent, Participant, LocalTrackPublication } from 'livekit-client';
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

  const connect = useCallback(async () => {
    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
      audioCaptureDefaults: getAudioConfig().audio as any,
    });

    try {
      await room.connect('wss://your-livekit-server.com', token, {
        autoSubscribe: true,
      });
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

      room.on(RoomEvent.ConnectionStateChanged, (state) => {
        if (state === 'reconnecting') {
          toast.info('Reconnecting...');
        } else if (state === 'disconnected') {
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
    if (state.room) {
      state.room.localParticipant.setMicrophoneEnabled(!state.isMuted);
      setState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
    }
  }, [state.room]);

  // const toggleDeafen = useCallback(() => {
  //   if (state.room) {
  //     state.room.localParticipant.setAudioOutputEnabled(!state.isDeafened);
  //     setState((prev) => ({ ...prev, isDeafened: !prev.isDeafened }));
  //   }
  // }, [state.room]);
  const toggleDeafen = useCallback(() => {
  if (!state.room) return;

  state.room.participants.forEach((participant) => {
    participant.audioTracks.forEach((publication) => {
      const track = publication.track;
      if (track && track.kind === "audio") {
        // Get the HTML audio elements attached to this track
        const attachedElements = track.detach(); // detach returns the HTMLMediaElement[]
        attachedElements.forEach((el) => {
          if (el instanceof HTMLAudioElement) {
            el.muted = !state.isDeafened; // mute/unmute
          }
          // Re-attach to keep rendering
          track.attach();
        });
      }
    });
  });

  setState((prev) => ({ ...prev, isDeafened: !prev.isDeafened }));
}, [state.room, state.isDeafened]);


  useEffect(() => {
    if (token && roomId) {
      connect();
    }
    return () => {
      state.room?.disconnect();
    };
  }, [token, roomId, connect]);

  return {
    ...state,
    toggleMute,
    toggleDeafen,
  };
};