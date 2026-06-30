import time
from collections import defaultdict
from fastapi import HTTPException, Request, Depends


class RateLimiter:
    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests = defaultdict(list)

    async def __call__(self, request: Request):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        cutoff = now - self.window_seconds

        timestamps = self._requests[client_ip]
        timestamps[:] = [t for t in timestamps if t > cutoff]

        if len(timestamps) >= self.max_requests:
            raise HTTPException(
                status_code=429,
                detail=f"Too many requests. Limit: {self.max_requests} per {self.window_seconds}s",
            )

        timestamps.append(now)


# Pre-configured instances
auth_rate_limit = RateLimiter(max_requests=5, window_seconds=60)
general_rate_limit = RateLimiter(max_requests=60, window_seconds=60)
