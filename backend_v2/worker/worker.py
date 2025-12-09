import os
import sys

from rq import Worker, Queue, Connection

# Ensure app is importable
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.redis_client import get_redis  # noqa: E402


listen = ["default"]


def main():
    redis_conn = get_redis()
    if not redis_conn:
        print("Redis not available. Worker cannot start.")
        return
    with Connection(redis_conn):
        worker = Worker([Queue(name) for name in listen])
        worker.work()


if __name__ == "__main__":
    main()

