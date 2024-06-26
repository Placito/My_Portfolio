import redis
from rq import Worker, Queue, Connection
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

listen = ['portfolio-tasks']
redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
conn = redis.from_url(redis_url, socket_timeout=20, socket_connect_timeout=20)

if __name__ == '__main__':
    with Connection(conn):
        worker = Worker(list(map(Queue, listen)))
        worker.work()
