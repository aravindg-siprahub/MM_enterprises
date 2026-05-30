import os
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
from orm_models import Category, Brand, Product, AdminUser

def seed_database():
    print("Creating tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        print("Seeding Categories...")
        cat_mobile = Category(name="Mobile Phones", slug="mobile-phones", image="https://via.placeholder.com/200x200?text=Mobiles")
        cat_laptop = Category(name="Laptops", slug="laptops", image="https://via.placeholder.com/200x200?text=Laptops")
        cat_appliance = Category(name="Home Appliances", slug="home-appliances", image="https://via.placeholder.com/200x200?text=Appliances")
        db.add_all([cat_mobile, cat_laptop, cat_appliance])
        db.commit()

        print("Seeding Brands...")
        brand_apple = Brand(name="Apple", logo="https://via.placeholder.com/150x150?text=Apple")
        brand_samsung = Brand(name="Samsung", logo="https://via.placeholder.com/150x150?text=Samsung")
        brand_lg = Brand(name="LG", logo="https://via.placeholder.com/150x150?text=LG")
        db.add_all([brand_apple, brand_samsung, brand_lg])
        db.commit()

        print("Seeding Products...")
        prod1 = Product(
            title="iPhone 15 Pro",
            description="A17 Pro chip · 256GB · Titanium finish",
            price=99999,
            images=["https://via.placeholder.com/400x400?text=iPhone+15+Pro"],
            specifications={"Storage": "256GB", "Color": "Titanium", "Chip": "A17 Pro"},
            category_id=cat_mobile.id,
            brand_id=brand_apple.id,
            is_featured=True,
            in_stock=True
        )
        
        prod2 = Product(
            title="Samsung Galaxy S24 Ultra",
            description="AI-powered · 512GB · S-Pen included",
            price=129999,
            images=["https://via.placeholder.com/400x400?text=Galaxy+S24+Ultra"],
            specifications={"Storage": "512GB", "Color": "Phantom Black", "Camera": "200MP"},
            category_id=cat_mobile.id,
            brand_id=brand_samsung.id,
            is_featured=True,
            in_stock=True
        )
        
        prod3 = Product(
            title="MacBook Pro 16\"",
            description="M3 Max · 36GB RAM · 1TB SSD",
            price=319900,
            images=["https://via.placeholder.com/400x400?text=MacBook+Pro+16"],
            specifications={"Processor": "M3 Max", "RAM": "36GB", "Storage": "1TB SSD"},
            category_id=cat_laptop.id,
            brand_id=brand_apple.id,
            is_featured=True,
            in_stock=True
        )
        
        prod4 = Product(
            title="LG Refrigerator 500L",
            description="Frost Free · Inverter · 5-star energy rating",
            price=52999,
            images=["https://via.placeholder.com/400x400?text=LG+Fridge"],
            specifications={"Capacity": "500L", "Type": "Double Door", "Energy Rating": "5 Star"},
            category_id=cat_appliance.id,
            brand_id=brand_lg.id,
            is_featured=False,
            in_stock=True
        )
        
        prod5 = Product(
            title="Samsung OLED 4K TV 65\"",
            description="Neural Quantum Processor · Dolby Atmos",
            price=149999,
            images=["https://via.placeholder.com/400x400?text=Samsung+OLED+TV"],
            specifications={"Size": "65 inch", "Resolution": "4K", "Smart TV": "Yes"},
            category_id=cat_appliance.id,
            brand_id=brand_samsung.id,
            is_featured=True,
            in_stock=True
        )
        
        db.add_all([prod1, prod2, prod3, prod4, prod5])
        db.commit()

        print("Database seeded successfully!")
        
    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
