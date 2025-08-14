import { z } from 'zod';
const backend = "https://customvoipbackend.onrender.com"

const RoomSchema = z.object({
  id: z.string(),
  name: z.string(),
  capacity: z.number(),
  startAt: z.string(),
  endAt: z.string(),
  timezone: z.string(),
  recurring: z.boolean(),
  state: z.enum(['scheduled', 'open', 'closed']),
});

const TokenSchema = z.object({
  token: z.string(),
});

export const createRoom = async (data: {
  name: string;
  capacity?: number;
  startAt: string;
  endAt: string;
  timezone: string;
  recurring?: boolean;
}) => {
  const response = await fetch(`${backend}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  console.log(response)
  if (!response.ok) throw new Error('Failed to create room');
  return RoomSchema.parse(await response.json());
};

export const getRoom = async (roomId: string) => {
  const response = await fetch(`${backend}/api/rooms/${roomId}`);
  if (!response.ok) throw new Error('Failed to fetch room');
  return RoomSchema.parse(await response.json());
};

export const createToken = async (roomId: string, data: {
  role: 'host' | 'cohost' | 'participant';
  displayName: string;
}) => {
  const response = await fetch(`${backend}/api/rooms/${roomId}/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create token');
  return TokenSchema.parse(await response.json());
};

export const closeRoom = async (roomId: string) => {
  const response = await fetch(`${backend}/api/rooms/${roomId}/close`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to close room');
  return await response.json();
};