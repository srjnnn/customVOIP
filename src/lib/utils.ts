import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import sanitizeHtml from 'sanitize-html';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeName(name: string): string {
  return sanitizeHtml(name, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim().slice(0, 50);
}

export function formatDateTime(date: string, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: timezone,
  }).format(new Date(date));
}

export function calculateLatency(start: number, end: number): number {
  return Math.round(end - start);
}

export function getAudioConfig(): MediaStreamConstraints {
  return {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 48000,
      channelCount: 1,
    },
    video: false,
  };
}