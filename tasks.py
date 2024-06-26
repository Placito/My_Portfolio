import time
import redis
from rq import get_current_job

def example(seconds):
    print('Starting task')
    job = get_current_job()
    for i in range(seconds):
        print(i)
        time.sleep(0.1)  # Adjusted sleep duration
        if job and job.is_canceled:
            print('Task canceled')
            return
    print('Task completed')

r = redis.Redis(host='localhost', port=6379, db=0)