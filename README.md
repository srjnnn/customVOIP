# customVOIP

# VOIP App

A high-quality audio-only VOIP application built with React, TypeScript, LiveKit, and Node.js.

## Features
- Private rooms with up to 11 participants (1 host + 10 participants)
- High-definition audio with Opus codec (48 kHz, 64–128 kbps)
- WebRTC with LiveKit SFU for low-latency (<200ms) audio
- Virtual background with blur effect
- Host controls: mute all, remove participant, lock room
- Lobby with host admit, device selection, mic meter
- JWT-based authentication with 15-minute token TTL
- Room scheduling and lifecycle management
- Error handling and reconnect logic

## Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd voip-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env`:
   ```plaintext
   VITE_LIVEKIT_URL=wss://your-livekit-server.com
   DATABASE_URL=postgresql://user:password@localhost:5432/voip
   JWT_SECRET=your_jwt_secret
   ```

4. Set up PostgreSQL and run migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Set up coturn for STUN/TURN:
   - Install coturn: `sudo apt-get install coturn`
   - Configure `/etc/turnserver.conf` with TLS and credentials
   - Start coturn: `sudo systemctl start coturn`

6. Run the backend server:
   ```bash
   npm run server
   ```

7. Run the frontend:
   ```bash
   npm run dev
   ```

## Deployment
- Use Docker for deployment:
  ```dockerfile
  FROM node:18
  WORKDIR /app
  COPY package*.json ./
  RUN npm install
  COPY . .
  RUN npm run build
  EXPOSE 5000
  CMD ["npm", "run", "server"]
  ```

## Example Scripts
**Create a Room:**
