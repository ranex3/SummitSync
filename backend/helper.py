import time
import random

def generate_id():
    time_part = int(time.time() * 1000)
    if hasattr(time, 'perf_counter'):
        time_part += int(time.perf_counter() * 1000)
    random_part = random.randint(0, 0xFFFF)
    
    return '{:08x}-xxxx-4xxx-yxxx-{:04x}{:04x}{:04x}'.format(
        time_part & 0xFFFFFFFF,
        random.randint(0x1000, 0x4FFF),
        random.randint(0x8000, 0xBFFF),
        random_part)
