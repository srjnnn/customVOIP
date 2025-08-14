import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/Toaster';
import Lobby from './pages/Lobby';
import Room from './pages/Room';
import Home from './pages/Home';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby/:roomId" element={<Lobby />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;