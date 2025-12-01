import { useEffect, useRef } from "react";

export function useIntersectionObserver(callback, options) {
  const targetRef = useRef(null);

  useEffect(() => {
    if (!targetRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback?.();
        }
      });
    }, options);

    observer.observe(targetRef.current);
    return () => observer.disconnect();
  }, [callback, options]);

  return targetRef;
}
