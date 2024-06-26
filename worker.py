import os
import redis
from rq import Worker, Queue, Connection
from dotenv import load_dotenv
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

# Queue names to listen for jobs
listen = ['portfolio-tasks']

# Redis connection URL
redis_url = os.getenv('REDIS_URL', 'redis://192.168.1.81:6379')
logger.debug(f'Redis URL: {redis_url}')

# Create a Redis connection
try:
    conn = redis.from_url(redis_url, socket_timeout=20, socket_connect_timeout=20)
    logger.debug('Connected to Redis')
except redis.ConnectionError as e:
    logger.error(f'Failed to connect to Redis: {e}')
    raise

# Initialize and start the RQ worker
try:
    if __name__ == '__main__':
        with Connection(conn):
            worker = Worker(list(map(Queue, listen)))
            logger.debug('Worker initialized and starting')
            worker.work()
except Exception as e:
    logger.error(f'Error while starting worker: {e}')
    raise
