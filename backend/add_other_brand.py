import psycopg2
import uuid
conn = psycopg2.connect('postgresql://postgres.rvgbmufelqtcthjhfmii:AIengineer%409915@aws-1-ap-south-1.pooler.supabase.com:5432/postgres')
cursor = conn.cursor()
cursor.execute("INSERT INTO brands (id, name, slug, is_active) VALUES (%s, %s, %s, %s) ON CONFLICT (slug) DO NOTHING", (str(uuid.uuid4()), 'Other', 'other', True))
conn.commit()
print('Added Other brand')
