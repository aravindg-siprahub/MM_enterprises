import time
import functools
import json

class TTLCache:
    def __init__(self, ttl_seconds: int = 300):
        self.ttl = ttl_seconds
        self._cache = {}

    def get(self, key: str):
        if key in self._cache:
            value, timestamp = self._cache[key]
            if time.time() - timestamp < self.ttl:
                print(f"CACHE HIT: {key}")
                return value
            else:
                del self._cache[key]
        print(f"CACHE MISS: {key}")
        return None

    def set(self, key: str, value: any):
        self._cache[key] = (value, time.time())

# Global cache instance for public API endpoints (5 minutes TTL)
api_cache = TTLCache(ttl_seconds=300)

def generate_cache_key(prefix: str, *args, **kwargs):
    """Generate a consistent cache key based on function arguments."""
    # Convert args and kwargs to a string representation that is consistent
    key_parts = [prefix]
    for arg in args:
        # Avoid caching raw DB connections or non-serializable objects
        if not hasattr(arg, 'cursor') and not isinstance(arg, tuple): 
            key_parts.append(str(arg))
    
    for k, v in sorted(kwargs.items()):
        # Same here, avoid DB objects
        if k != 'db' and v is not None:
            key_parts.append(f"{k}={v}")
            
    return "|".join(key_parts)
