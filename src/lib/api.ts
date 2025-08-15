import { z } from 'zod';

// Change backend here if needed
const backend = "http://localhost:5000";

const RoomSchema = z.object({
  id: z.string(),
  name: z.string(),
  capacity: z.number(),
  start_at: z.string(),
  end_at: z.string(),
  timezone: z.string(),
  recurring: z.boolean(),
  state: z.enum(['scheduled', 'open', 'closed']),
});

const TokenSchema = z.object({
  token: z.string(),
});

async function handleResponse<T>(response: Response, schema: z.ZodSchema<T>): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request failed: ${response.status} ${errorText}`);
  }
  const json = await response.json();
  return schema.parse(json);
}
function toSnakeCase(obj: Record<string, any>) {
  const result: Record<string, any> = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = obj[key];
  }
  return result;
}

export const createRoom = async (data: {
  name: string;
  capacity?: number;
  start_at: string;
  end_at: string;
  timezone: string;
  recurring?: boolean;
}) => {
  const payload =toSnakeCase( {
    capacity: 11, // default capacity if not provided
    recurring: false,
    ...data,
  });

  console.log('Creating room with data:', payload);
  // working here

  const response = await fetch(`${backend}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  console.log("body", JSON.stringify(payload));
  console.log('Response status:', response);

  return handleResponse(response, RoomSchema);
};

export const getRoom = async (roomId: string) => {
  const response = await fetch(`${backend}/rooms/${roomId}`);
  return handleResponse(response, RoomSchema);
};

export const createToken = async (roomId: string, data: {
  role: 'host' | 'cohost' | 'participant';
  displayName: string;
}) => {
  const response = await fetch(`${backend}/rooms/${roomId}/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse(response, TokenSchema);
};

export const closeRoom = async (roomId: string) => {
  const response = await fetch(`${backend}/rooms/${roomId}/close`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Failed to close room: ${response.status} ${await response.text()}`);
  }

  return await response.json();
};
