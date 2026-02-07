import { useState, useEffect, useCallback, useRef } from 'react';

type SoundEffect = 'blip' | 'success' | 'error' | 'gameover' | 'eat' | 'paddle' | 'score' | 'click';

interface AudioContextState {
  ctx: AudioContext | null;
  gainNode: GainNode | null;
  bgmGain: GainNode | null;
}

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

// Improved BGM Generator (Arcade Synthwave)
const createBgmOscillators = (ctx: AudioContext, gainNode: GainNode) => {
  // Bassline (Sawtooth, low pass)
  const bassFreqs = [65.41, 65.41, 65.41, 65.41, 77.78, 77.78, 77.78, 77.78, 58.27, 58.27, 58.27, 58.27, 43.65, 43.65, 43.65, 43.65]; // C2 -> Eb2 -> Bb1 -> F1

  // Arpeggio / Melody (Square, high pass)
  const arpFreqs = [523.25, 659.25, 783.99, 1046.50]; // C Major 7th ish

  let step = 0;

  const playStep = () => {
    const t = ctx.currentTime;

    // 1. Bass Note
    const bassOsc = ctx.createOscillator();
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(bassFreqs[step % bassFreqs.length], t);

    const bassFilter = ctx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(600, t);
    bassFilter.Q.value = 5;

    const bassGain = ctx.createGain();
    bassGain.gain.setValueAtTime(0.3, t);
    bassGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(gainNode);
    bassOsc.start(t);
    bassOsc.stop(t + 0.25);

    // 2. Subtle Hi-hat (White noise approximation using high freq random)
    if (step % 2 === 0) { // Every other beat
      const hatOsc = ctx.createOscillator();
      hatOsc.type = 'square';
      hatOsc.frequency.setValueAtTime(8000 + Math.random() * 1000, t);

      const hatGain = ctx.createGain();
      hatGain.gain.setValueAtTime(0.05, t);
      hatGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      const hatFilter = ctx.createBiquadFilter();
      hatFilter.type = 'highpass';
      hatFilter.frequency.value = 5000;

      hatOsc.connect(hatFilter);
      hatFilter.connect(hatGain);
      hatGain.connect(gainNode);
      hatOsc.start(t);
      hatOsc.stop(t + 0.05);
    }

    step++;
  };

  const intervalId = setInterval(playStep, 200); // ~150 BPM

  return () => {
    clearInterval(intervalId);
  };
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
      case 'click':
        // Simulating a mechanical keyboard switch (Blue/Green switch click)
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.03);

        noteGain.gain.setValueAtTime(0.5, ctx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03); // Super short tail

        osc.stop(ctx.currentTime + 0.04);
        break;
    }

    osc.start();
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const resume = useCallback(async () => {
    if (!audioRef.current.ctx) {
      initAudio();
    } else if (audioRef.current.ctx.state === 'suspended') {
      await audioRef.current.ctx.resume();
    }
  }, [initAudio]);

  return { isMuted, toggleMute, playSound, hasInteracted, resume };
};

export default useAudio;
