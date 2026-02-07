import { useEffect } from 'react';
import { useAudioContext } from '@/contexts/AudioContext';

export const useGlobalClickSound = () => {
  const { playSound, hasInteracted } = useAudioContext();

  useEffect(() => {
    if (!hasInteracted) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Play click sound for interactive elements
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('[data-clickable]')
      ) {
        playSound('click');
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [playSound, hasInteracted]);
};

export default useGlobalClickSound;
