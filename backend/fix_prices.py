import psycopg2
conn = psycopg2.connect('postgresql://postgres.rvgbmufelqtcthjhfmii:AIengineer%409915@aws-1-ap-south-1.pooler.supabase.com:5432/postgres')
cursor = conn.cursor()
cursor.execute("UPDATE products SET original_price=41999, selling_price=34000 WHERE slug='oppo-reno-15-c'")
conn.commit()
print('Updated prices')
