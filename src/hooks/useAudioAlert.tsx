
import { useRef, useCallback } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const useAudioAlert = () => {
  const audioContext = useRef<AudioContext | null>(null);

  const playBeep = useCallback(async () => {
    try {
      // Haptic feedback for mobile
      await Haptics.impact({ style: ImpactStyle.Medium });
      
      // Audio beep
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContext.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (error) {
      console.error('Audio alert error:', error);
    }
  }, []);

  return { playBeep };
};
