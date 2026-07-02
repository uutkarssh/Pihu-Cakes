// Simple in-memory cache with TTL support
// For production with multiple replicas, consider Redis

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes default

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class SimpleCache {
  private map = new Map<string, CacheEntry<any>>();

  get<T>(key: string): T | null {
    const entry = this.map.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.map.delete(key);
      return null;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs = CACHE_TTL_MS): void {
    this.map.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  delete(key: string): void {
    this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }

  // Clean up expired entries every 5 minutes
  startCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.map.entries()) {
        if (now > entry.expiresAt) {
          this.map.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }
}

// Export singleton instance
export const cache = new SimpleCache();
cache.startCleanup();
