import { createContext, useContext, ReactNode, useCallback } from 'react';
import { useAudio } from '@/hooks/useAudio';

type SoundEffect = 'blip' | 'success' | 'error' | 'gameover' | 'eat' | 'paddle' | 'score' | 'click';

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playSound: (type: SoundEffect) => void;
  hasInteracted: boolean;
  resume: () => Promise<void>;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const audio = useAudio();
  
  // Wrap playSound to be safe even if audio isn't ready
  const safePlaySound = useCallback((type: SoundEffect) => {
    try {
      audio.playSound(type);
    } catch (e) {
      // Silently ignore - audio not ready
    }
  }, [audio]);
  
  const value: AudioContextType = {
    ...audio,
    playSound: safePlaySound,
  };
  
  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

export const useAudioContext = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudioContext must be used within AudioProvider');
  return ctx;
};
