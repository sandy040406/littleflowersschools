"""
Tiny in-memory rate limiter (sliding window, per client IP).

Good enough for a single backend instance. If we ever run multiple
instances, swap this for a Redis-backed limiter.

Usage:
    enquiry_limit = RateLimiter(max_requests=5, window_seconds=600)

    @router.post("", dependencies=[Depends(enquiry_limit)])
"""

import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import HTTPException, Request, status

from app.core.config import get_settings


def client_ip(request: Request) -> str:
    """
    Best-effort client IP.

    X-Forwarded-For is only used when TRUST_PROXY_HEADERS is enabled. We take
    the rightmost entry: that's the one appended by our own proxy, whereas the
    leftmost entries can be forged by the client.
    """
    if get_settings().TRUST_PROXY_HEADERS:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[-1].strip()
    return request.client.host if request.client else "unknown"


class RateLimiter:
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def __call__(self, request: Request) -> None:
        key = client_ip(request)
        now = time.monotonic()
        with self._lock:
            hits = self._hits[key]
            while hits and now - hits[0] > self.window:
                hits.popleft()
            if len(hits) >= self.max_requests:
                retry_after = int(self.window - (now - hits[0])) + 1
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many submissions. Please try again in a few minutes.",
                    headers={"Retry-After": str(retry_after)},
                )
            hits.append(now)

    def reset(self) -> None:
        """Clear all counters (used by tests / admin tooling)."""
        with self._lock:
            self._hits.clear()
