
import { useState, useEffect, useRef } from 'react';

export const useAnimatedNumber = (endValue: number, duration: number = 500): number => {
  const [currentValue, setCurrentValue] = useState(0);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const startValueRef = useRef(0);

  useEffect(() => {
    startValueRef.current = currentValue; // Start from the last animated value
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) return;
      
      const elapsedTime = currentTime - startTimeRef.current;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Ease-out function
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      const nextValue = startValueRef.current + (endValue - startValueRef.current) * easedProgress;

      setCurrentValue(nextValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentValue(endValue); // Ensure it ends exactly on the target value
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [endValue, duration]);

  return currentValue;
};
