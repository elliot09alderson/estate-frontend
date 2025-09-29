import { useEffect } from 'react';

export const useSmoothScroll = () => {
  useEffect(() => {
    let rafId: number | null = null;
    let lastTime = 0;

    const raf = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      // Just maintain the RAF loop without modifying scroll behavior
      // This creates a smooth 60fps render loop
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);
};