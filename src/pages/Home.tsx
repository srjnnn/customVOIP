import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createRoom } from '../lib/api';
import Button from '../components/ui/Button';
import { cn } from '../lib/utils';
import { Calendar, Clock } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [error, setError] = useState('');

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const room = await createRoom({
        name: roomName,
        capacity: 11,
        startAt,
        endAt,
        timezone,
        recurring: false,
      });
      navigate(`/lobby/${room.id}`);
    } catch (err) {
      setError('Failed to create room');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-screen p-4"
    >
      <div className="glass-effect p-8 rounded-xl max-w-md w-full">
        <h1 className="text-3xl font-heading text-neutral-100 mb-6">Create a Room</h1>
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <div>
            <label className="block text-neutral-100 mb-1">Room Name</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full p-2 rounded-lg bg-neutral-600 text-neutral-100"
              required
            />
          </div>
          <div>
            <label className="block text-neutral-100 mb-1">Start Time</label>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="w-full p-2 rounded-lg bg-neutral-600 text-neutral-100"
              required
            />
          </div>
          <div>
            <label className="block text-neutral-100 mb-1">End Time</label>
            <input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="w-full p-2 rounded-lg bg-neutral-600 text-neutral-100"
              required
            />
          </div>
          <div>
            <label className="block text-neutral-100 mb-1">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full p-2 rounded-lg bg-neutral-600 text-neutral-100"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Europe/London">Europe/London</option>
            </select>
          </div>
          {error && <p className="text-error">{error}</p>}
          <Button type="submit" variant="primary" className="w-full">
            Create Room
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default Home;