import { createContext, useContext, ReactNode } from 'react';
import { useAudio } from '@/hooks/useAudio';

type AudioContextType = ReturnType<typeof useAudio>;

const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const audio = useAudio();
  return <AudioContext.Provider value={audio}>{children}</AudioContext.Provider>;
};

export const useAudioContext = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudioContext must be used within AudioProvider');
  return ctx;
};
