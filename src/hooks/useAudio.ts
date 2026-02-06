import { useState, useEffect, useCallback, useRef } from 'react';

type SoundEffect = 'blip' | 'success' | 'error' | 'gameover' | 'eat' | 'paddle' | 'score';

interface AudioContextState {
  ctx: AudioContext | null;
  gainNode: GainNode | null;
  bgmGain: GainNode | null;
}

// Simple 8-bit style music generator
const createBgmOscillators = (ctx: AudioContext, gainNode: GainNode) => {
  const oscillators: OscillatorNode[] = [];
  
  // Melody pattern (frequencies in Hz)
  const melody = [
    262, 294, 330, 349, 392, 349, 330, 294,
    262, 330, 392, 523, 392, 330, 294, 262,
  ];
  
  let noteIndex = 0;
  const playNote = () => {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(melody[noteIndex], ctx.currentTime);
    
    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0.08, ctx.currentTime);
    noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    
    osc.connect(noteGain);
    noteGain.connect(gainNode);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.28);
    
    noteIndex = (noteIndex + 1) % melody.length;
  };
  
  const intervalId = setInterval(playNote, 300);
  
  return () => {
    clearInterval(intervalId);
    oscillators.forEach(osc => {
      try { osc.stop(); } catch {}
    });
  };
};

const LEADERBOARD_KEY = 'arcade-drive-leaderboard';

export interface LeaderboardEntry {
  game: 'snake' | 'pong';
  score: number;
  date: string;
}

export const getLeaderboard = (): LeaderboardEntry[] => {
  try {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveScore = (game: 'snake' | 'pong', score: number) => {
  if (score <= 0) return;
  
  const entries = getLeaderboard();
  entries.push({ game, score, date: new Date().toISOString() });
  
  // Keep only top 10 per game
  const snakeScores = entries.filter(e => e.game === 'snake').sort((a, b) => b.score - a.score).slice(0, 10);
  const pongScores = entries.filter(e => e.game === 'pong').sort((a, b) => b.score - a.score).slice(0, 10);
  
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify([...snakeScores, ...pongScores]));
};

export const getTopScores = (game: 'snake' | 'pong', limit = 5): LeaderboardEntry[] => {
  return getLeaderboard()
    .filter(e => e.game === game)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

export const useAudio = () => {
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem('arcade-muted') === 'true';
    } catch {
      return false;
    }
  });
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<AudioContextState>({ ctx: null, gainNode: null, bgmGain: null });
  const bgmCleanupRef = useRef<(() => void) | null>(null);

  // Initialize audio context on first interaction
  const initAudio = useCallback(() => {
    if (audioRef.current.ctx) return;
    
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const gainNode = ctx.createGain();
    const bgmGain = ctx.createGain();
    
    gainNode.connect(ctx.destination);
    bgmGain.connect(ctx.destination);
    
    gainNode.gain.setValueAtTime(isMuted ? 0 : 0.3, ctx.currentTime);
    bgmGain.gain.setValueAtTime(isMuted ? 0 : 0.15, ctx.currentTime);
    
    audioRef.current = { ctx, gainNode, bgmGain };
    setHasInteracted(true);
    
    // Start background music
    if (!isMuted) {
      bgmCleanupRef.current = createBgmOscillators(ctx, bgmGain);
    }
  }, [isMuted]);

  // Listen for first interaction
  useEffect(() => {
    if (hasInteracted) return;
    
    const handleInteraction = () => {
      initAudio();
    };
    
    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });
    
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, [hasInteracted, initAudio]);

  // Update volume when muted changes
  useEffect(() => {
    const { ctx, gainNode, bgmGain } = audioRef.current;
    if (!ctx || !gainNode || !bgmGain) return;
    
    gainNode.gain.setValueAtTime(isMuted ? 0 : 0.3, ctx.currentTime);
    bgmGain.gain.setValueAtTime(isMuted ? 0 : 0.15, ctx.currentTime);
    
    // Toggle background music
    if (isMuted) {
      bgmCleanupRef.current?.();
      bgmCleanupRef.current = null;
    } else if (!bgmCleanupRef.current) {
      bgmCleanupRef.current = createBgmOscillators(ctx, bgmGain);
    }
    
    localStorage.setItem('arcade-muted', String(isMuted));
  }, [isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      bgmCleanupRef.current?.();
      audioRef.current.ctx?.close();
    };
  }, []);

  const playSound = useCallback((type: SoundEffect) => {
    const { ctx, gainNode } = audioRef.current;
    if (!ctx || !gainNode || isMuted) return;
    
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();
    
    osc.connect(noteGain);
    noteGain.connect(gainNode);
    
    switch (type) {
      case 'blip':
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        noteGain.gain.setValueAtTime(0.2, ctx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.stop(ctx.currentTime + 0.1);
        break;
      case 'success':
        osc.type = 'square';
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
        noteGain.gain.setValueAtTime(0.2, ctx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.stop(ctx.currentTime + 0.3);
        break;
      case 'error':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
        noteGain.gain.setValueAtTime(0.2, ctx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.stop(ctx.currentTime + 0.3);
        break;
      case 'gameover':
        osc.type = 'square';
        osc.frequency.setValueAtTime(294, ctx.currentTime);
        osc.frequency.setValueAtTime(262, ctx.currentTime + 0.15);
        osc.frequency.setValueAtTime(196, ctx.currentTime + 0.3);
        osc.frequency.setValueAtTime(147, ctx.currentTime + 0.45);
        noteGain.gain.setValueAtTime(0.25, ctx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.stop(ctx.currentTime + 0.6);
        break;
      case 'eat':
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.setValueAtTime(800, ctx.currentTime + 0.05);
        noteGain.gain.setValueAtTime(0.15, ctx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.stop(ctx.currentTime + 0.1);
        break;
      case 'paddle':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(350, ctx.currentTime);
        noteGain.gain.setValueAtTime(0.15, ctx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.stop(ctx.currentTime + 0.08);
        break;
      case 'score':
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1047, ctx.currentTime + 0.1);
        noteGain.gain.setValueAtTime(0.2, ctx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.stop(ctx.currentTime + 0.2);
        break;
    }
    
    osc.start();
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return { isMuted, toggleMute, playSound, hasInteracted };
};

export default useAudio;
