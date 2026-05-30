import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME = "MM Enterprises Digital Commerce API"
    VERSION = "1.0.0"
    
    DATABASE_URL = os.getenv("DATABASE_URL")
    JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-change-in-production")
    ADMIN_INVITE_CODE = os.getenv("ADMIN_INVITE_CODE", "MM-ADMIN-2024")
    
settings = Settings()
