/**
 * Simple in-memory cache with TTL support
 */
class Cache<T> {
  private cache: Map<string, { value: T; expiry: number }> = new Map();

  set(key: string, value: T, ttl: number = 60000): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    this.cleanup();
    return this.cache.size;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new Cache<any>();

/**
 * Fetch with caching
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 60000
): Promise<T> {
  if (cache.has(key)) {
    return cache.get(key) as T;
  }

  const data = await fetcher();
  cache.set(key, data, ttl);
  return data;
}

/**
 * Invalidate cache by pattern
 */
export function invalidateCache(pattern: string): void {
  const keys = Array.from((cache as any).cache.keys()) as string[];
  keys.forEach((key) => {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  });
}
