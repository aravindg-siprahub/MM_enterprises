import asyncio
from app.routers.public.homepage import get_homepage

async def main():
    try:
        await get_homepage()
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
