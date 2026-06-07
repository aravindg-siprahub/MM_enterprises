import time
import sys

# add parent directory to path so app module can be found
sys.path.append('c:\\Users\\Aravind\\Desktop\\MM_enterprises\\backend')

from app.database import get_db

print("Starting DB test")
try:
    gen = get_db()
    t1 = time.time()
    conn, cursor = next(gen)
    t2 = time.time()
    print(f"next(gen) took {t2-t1:.4f}s")
    
    t3 = time.time()
    cursor.execute("SELECT 1")
    t4 = time.time()
    print(f"execute(SELECT 1) took {t4-t3:.4f}s")
    
    try:
        next(gen)
    except StopIteration:
        pass
    print("Done")
except Exception as e:
    print("Error:", e)
