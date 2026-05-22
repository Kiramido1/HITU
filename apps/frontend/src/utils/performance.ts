import { useCallback, useEffect, useRef } from 'react';

/**
 * Debounce hook to delay function execution
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

/**
 * Throttle hook to limit function execution rate
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastRunRef = useRef<number>(0);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRunRef.current >= delay) {
        callback(...args);
        lastRunRef.current = now;
      }
    },
    [callback, delay]
  );
}

/**
 * Memoize expensive calculations
 */
export function useMemoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string
): T {
  const cache = useRef<Map<string, ReturnType<T>>>(new Map());

  return ((...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    if (cache.current.has(key)) {
      return cache.current.get(key)!;
    }
    const result = fn(...args);
    cache.current.set(key, result);
    return result;
  }) as T;
}

/**
 * Lazy load images
 */
export function useLazyLoading() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            observerRef.current?.unobserve(img);
          }
        });
      },
      { rootMargin: '50px' }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const observe = useCallback((element: HTMLImageElement) => {
    observerRef.current?.observe(element);
  }, []);

  return { observe };
}

/**
 * Virtual scroll helper for large lists
 */
export function useVirtualScroll(
  itemCount: number,
  itemHeight: number,
  containerHeight: number
) {
  const scrollTopRef = useRef(0);

  const visibleRange = useCallback(() => {
    const startIndex = Math.floor(scrollTopRef.current / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      itemCount
    );
    return { startIndex, endIndex };
  }, [itemCount, itemHeight, containerHeight]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    scrollTopRef.current = e.currentTarget.scrollTop;
  }, []);

  return {
    visibleRange,
    handleScroll,
    totalHeight: itemCount * itemHeight,
  };
}
