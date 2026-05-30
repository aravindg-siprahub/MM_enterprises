import os
import glob
import re

files_to_update = [
    "src/app/admin/banners/page.tsx",
    "src/app/admin/banners/[id]/edit/page.tsx",
    "src/app/admin/brands/page.tsx",
    "src/app/admin/categories/page.tsx",
    "src/app/admin/deals/page.tsx",
    "src/app/admin/inquiries/page.tsx",
    "src/app/admin/login/page.tsx",
    "src/app/admin/page.tsx",
    "src/app/admin/products/new/page.tsx",
    "src/app/admin/products/page.tsx",
    "src/app/admin/products/[id]/edit/page.tsx",
    "src/app/catalog/[id]/page.tsx",
    "src/components/admin/BannerForm.tsx",
    "src/components/admin/ImageUploader.tsx",
    "src/components/admin/ProductForm.tsx",
    "src/components/FilterSidebar.tsx",
    "src/components/ProductGrid.tsx",
    "src/lib/api.ts"
]

for filepath in files_to_update:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if '127.0.0.1:8000' not in content:
        continue
        
    # We need to add the import if it's missing
    # Calculate relative path to src/lib/config
    # src/app/admin/banners/page.tsx -> ../../../../lib/config
    # Actually, Next.js supports '@/lib/config' alias!
    import_statement = 'import { API_BASE_URL } from "@/lib/config";\n'
    
    if 'API_BASE_URL' not in content:
        # Find the last import statement or use top of file
        parts = content.split('\n')
        last_import = -1
        for i, line in enumerate(parts):
            if line.startswith('import '):
                last_import = i
        
        if last_import != -1:
            parts.insert(last_import + 1, import_statement.strip())
        else:
            parts.insert(0, import_statement.strip())
            
        content = '\n'.join(parts)
    
    # Replace "http://127.0.0.1:8000/..." with `${API_BASE_URL}/...`
    # Replace 'http://127.0.0.1:8000/...' with `${API_BASE_URL}/...`
    # Replace `http://127.0.0.1:8000/...` with `${API_BASE_URL}/...`
    
    # Regex replacement for strings starting with http://127.0.0.1:8000
    # For double quotes
    content = re.sub(r'"http://127\.0\.0\.1:8000([^"]*)"', r'`${API_BASE_URL}\1`', content)
    # For single quotes
    content = re.sub(r"'http://127\.0\.0\.1:8000([^']*)'", r'`${API_BASE_URL}\1`', content)
    # For backticks
    content = content.replace('http://127.0.0.1:8000', '${API_BASE_URL}')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filepath}")
