/**
 * Meta-inspired LRU Cache for fast O(1) in-memory lookups
 * Used to avoid redundant API requests for static data
 */
export class LRUCache {
    constructor(capacity = 50) {
        this.capacity = capacity;
        this.cache = new Map();
    }

    get(key) {
        if (!this.cache.has(key)) return null;

        // Get item
        const item = this.cache.get(key);

        // Check TTL (e.g. 5 mins = 300000ms)
        // Assuming items are stored as { timestamp, data }
        if (item.timestamp && Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return null;
        }

        // Refresh position (mark as recently used)
        this.cache.delete(key);
        this.cache.set(key, item);
        return item.data;
    }

    set(key, data, ttl = 300000) { // Default 5 minute TTL
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.capacity) {
            // Map iterates keys in insertion order. The first is the oldest.
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }

        // Store with timestamp for TTL expiration
        this.cache.set(key, { timestamp: Date.now(), data, ttl });
    }

    clear() {
        this.cache.clear();
    }
}

// Global shared caches
export const departmentCache = new LRUCache(20);
export const groupCache = new LRUCache(20);
export const userRoleCache = new LRUCache(50);

export const cacheConfig = {
    // Shared simple TTL constants
    FIVE_MINS: 5 * 60 * 1000,
    ONE_HOUR: 60 * 60 * 1000
};
