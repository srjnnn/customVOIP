import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getRoom, createToken } from '../lib/api';
import { toast } from '../components/ui/Toaster'; // ✅ use global toast
import Button from '../components/ui/Button';
import { cn, sanitizeName } from '../lib/utils';
import { User } from 'lucide-react';

const Lobby: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'host' | 'cohost' | 'participant'>('participant');
  const [roomState, setRoomState] = useState<string>('');

  useEffect(() => {
    if (!roomId) return;

    getRoom(roomId)
      .then((room) => setRoomState(room.state))
      .catch(() => toast.error('Failed to fetch room status')); // ✅ use toast.error
  }, [roomId]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId) return;

    const sanitizedName = sanitizeName(displayName);
    if (!sanitizedName) {
      toast.error('Invalid display name'); // ✅ use toast.error
      return;
    }

    try {
      const { token } = await createToken(roomId, { role, displayName: sanitizedName });
      toast.success('Joining room...'); // ✅ use toast.success
      navigate(`/room/${roomId}?token=${token}`);
    } catch (err) {
      toast.error('Failed to join room'); // ✅ use toast.error
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-screen p-4"
    >
      <div className="glass-effect p-8 rounded-xl max-w-md w-full">
        <h1 className="text-3xl font-heading text-neutral-100 mb-6">Join Room</h1>
        {roomState === 'closed' && (
          <p className="text-error mb-4">This room is closed.</p>
        )}
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-neutral-100 mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-2 rounded-lg bg-neutral-600 text-neutral-100"
              required
            />
          </div>
          <div>
            <label className="block text-neutral-100 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as typeof role)}
              className="w-full p-2 rounded-lg bg-neutral-600 text-neutral-100"
            >
              <option value="host">Host</option>
              <option value="cohost">Co-Host</option>
              <option value="participant">Participant</option>
            </select>
          </div>
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={roomState === 'closed'}
          >
            Join Room
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default Lobby;
