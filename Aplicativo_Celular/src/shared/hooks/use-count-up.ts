import { useEffect, useState } from "react";

export function useCountUp(target: number, decimals = 0, delay = 0, duration = 900) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let animationFrame = 0;
    const timeout = setTimeout(() => {
      const startedAt = Date.now();

      const animate = () => {
        const progress = Math.min((Date.now() - startedAt) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        setCurrent(target * easedProgress);

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animate();
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(animationFrame);
    };
  }, [delay, duration, target]);

  return current.toFixed(decimals).replace(".", ",");
}
