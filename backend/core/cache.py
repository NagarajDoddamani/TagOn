import time
import threading
from functools import wraps


class TTLCache:
    """Simple thread-safe in-memory cache with TTL support."""

    def __init__(self):
        self._store = {}
        self._lock = threading.Lock()

    def get(self, key: str):
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return None
            value, expiry = entry
            if expiry is not None and time.time() > expiry:
                del self._store[key]
                return None
            return value

    def set(self, key: str, value, ttl_seconds: int | None = 60):
        with self._lock:
            expiry = time.time() + ttl_seconds if ttl_seconds is not None else None
            self._store[key] = (value, expiry)

    def delete(self, key: str):
        with self._lock:
            self._store.pop(key, None)

    def clear(self):
        with self._lock:
            self._store.clear()

    def clear_pattern(self, pattern: str):
        with self._lock:
            prefix = pattern.rstrip("*")
            keys = [k for k in self._store if k.startswith(prefix)]
            for k in keys:
                del self._store[k]


cache = TTLCache()


def cached(ttl_seconds: int = 60):
    """Decorator that caches function return values by (function_name, *args, **kwargs)."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            key_parts = [func.__name__]
            key_parts.extend(str(a) for a in args)
            key_parts.extend(f"{k}={v}" for k, v in sorted(kwargs.items()))
            cache_key = ":".join(key_parts)
            result = cache.get(cache_key)
            if result is not None:
                return result
            result = func(*args, **kwargs)
            cache.set(cache_key, result, ttl_seconds)
            return result
        return wrapper
    return decorator
