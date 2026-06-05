from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.routers.public import homepage, products, categories, brands, auth, banners
from app.routers.admin import (
    products as admin_products,
    categories as admin_categories,
    brands as admin_brands,
    banners as admin_banners,
    deals as admin_deals,
    ai as admin_ai,
    upload as admin_upload,
    stats as admin_stats
)

app = FastAPI(title="MM Enterprises Digital Commerce API")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://mm-enterprises-pearl.vercel.app",
    "https://mm-enterprises-git-main-aravindg-siprahubs-projects.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
def read_root():
    return {"message": "Welcome to MM Enterprises API"}

# Public API routes
app.include_router(auth.router, prefix="/api", tags=["public"])
app.include_router(homepage.router, prefix="/api", tags=["public"])
app.include_router(products.router, prefix="/api", tags=["public"])
app.include_router(categories.router, prefix="/api", tags=["public"])
app.include_router(brands.router, prefix="/api", tags=["public"])
app.include_router(banners.router, prefix="/api", tags=["public"])

from app.routers import chat

# Admin API routes
app.include_router(admin_products.router, prefix="/api/admin", tags=["admin"])
app.include_router(admin_categories.router, prefix="/api/admin", tags=["admin"])
app.include_router(admin_brands.router, prefix="/api/admin", tags=["admin"])
app.include_router(admin_banners.router, prefix="/api/admin", tags=["admin"])
app.include_router(admin_deals.router, prefix="/api/admin", tags=["admin_deals"])
app.include_router(admin_ai.router, prefix="/api/admin", tags=["admin_ai"])
app.include_router(admin_upload.router, prefix="/api/admin", tags=["admin"])
app.include_router(admin_stats.router, prefix="/api/admin", tags=["admin"])
app.include_router(chat.router, prefix="/api")
