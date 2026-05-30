import os
import glob
import re

files = glob.glob('src/backend/app/routers/admin/*.py')
# Wait, backend is c:\\Users\\Aravind\\Desktop\\MM_enterprises\\backend\\app\\routers\\admin\\*.py
base_dir = r"c:\Users\Aravind\Desktop\MM_enterprises\backend\app\routers\admin"
files = glob.glob(os.path.join(base_dir, "*.py"))

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if "def delete_" not in content:
        continue
        
    # Import get_super_admin if not imported
    if "get_super_admin" not in content:
        content = content.replace("get_current_admin", "get_current_admin, get_super_admin")
        
    # Regex to replace def delete_something(..., db: tuple = Depends(get_db)):
    # with def delete_something(..., db: tuple = Depends(get_db), admin: dict = Depends(get_super_admin)):
    content = re.sub(
        r'(def delete_[a-zA-Z0-9_]+\(.*db: tuple = Depends\(get_db\))(\):)',
        r'\1, admin: dict = Depends(get_super_admin)\2',
        content
    )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filepath}")
