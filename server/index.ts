import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { WebSocketServer } from 'ws';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { format } from 'date-fns';
import sanitizeHtml from 'sanitize-html';

const app = express();
const prisma = new PrismaClient();
const wss = new WebSocketServer({ port: 8080 });

app.use(express.json());

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

app.post('/rooms', async (req, res) => {
  try {
    const data = RoomSchema.parse(req.body);
    const room = await prisma.room.create({
      data: {
        id: nanoid(10),
        ...data,
        state: 'scheduled',
      },
    });
    res.json(room);
  } catch (error) {
    res.status(400).json({ error: 'Invalid room data' });
  }
});

app.get('/rooms/:id', async (req, res) => {
  const room = await prisma.room.findUnique({
    where: { id: req.params.id },
  });
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json(room);
});

app.post('/rooms/:id/tokens', async (req, res) => {
  try {
    const data = TokenSchema.parse(req.body);
    const room = await prisma.room.findUnique({
      where: { id: req.params.id },
    });
    if (!room || room.state === 'closed') {
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
  } catch (error) {
    res.status(400).json({ error: 'Invalid token data' });
  }
});

app.post('/rooms/:id/close', async (req, res) => {
  const room = await prisma.room.update({
    where: { id: req.params.id },
    data: { state: 'closed' },
  });
  res.json(room);
});

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log('Received:', message.toString());
  });
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});