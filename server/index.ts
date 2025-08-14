import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { WebSocketServer } from 'ws';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';
import supabase from './supabase.js';

const app = express();
const wss = new WebSocketServer({ port: 8080 });

app.use(express.json());

/** Zod Schemas */
const RoomSchema = z.object({
  name: z.string().min(1).max(100),
  capacity: z.number().min(1).max(11).default(11),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  timezone: z.string(),
  recurring: z.boolean().default(false),
});

const TokenSchema = z.object({
  role: z.enum(['host', 'cohost', 'participant']),
  displayName: z.string().min(1).max(50),
});

/** Types inferred from Zod */
type RoomInput = z.infer<typeof RoomSchema>;
type TokenInput = z.infer<typeof TokenSchema>;

/** Create a Room */
app.post('/rooms', async (req: Request, res: Response) => {
  try {
    const data: RoomInput = RoomSchema.parse(req.body);
    const { data: room, error } = await supabase
      .from('rooms')
      .insert([{ id: nanoid(10), ...data, state: 'scheduled' }])
      .select()
      .single();

    if (error) throw error;
    res.json(room);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/** Get Room by ID */
app.get('/rooms/:id', async (req: Request, res: Response) => {
  const { data: room, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Room not found' });
  res.json(room);
});

/** Generate JWT Token */
app.post('/rooms/:id/tokens', async (req: Request, res: Response) => {
  try {
    const data: TokenInput = TokenSchema.parse(req.body);

    const { data: room, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !room || room.state === 'closed') {
      return res.status(400).json({ error: 'Room not available' });
    }

    const sanitizedName = sanitizeHtml(data.displayName, {
      allowedTags: [],
      allowedAttributes: {},
    });

    const token = jwt.sign(
      { roomId: req.params.id, role: data.role, identity: sanitizedName },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '15m' }
    );

    res.json({ token });
  } catch (error: any) {
    res.status(400).json({ error: 'Invalid token data' });
  }
});

/** Close Room */
app.post('/rooms/:id/close', async (req: Request, res: Response) => {
  const { data: room, error } = await supabase
    .from('rooms')
    .update({ state: 'closed' })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(room);
});

/** WebSocket Server */
wss.on('connection', (ws) => {
  ws.on('message', (message: string | Buffer) => {
    console.log('Received:', message.toString());
    // Optional: broadcast to other clients
  });
});

/** Start Express server */
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
