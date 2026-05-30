from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.auth import get_current_admin
import os
import json
import logging
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

router = APIRouter(dependencies=[Depends(get_current_admin)])

class ProductDescRequest(BaseModel):
    name: str
    category: str
    brand: str

class ProductSeoRequest(BaseModel):
    name: str
    category: str

class CategorySeoRequest(BaseModel):
    name: str

class BannerCopyRequest(BaseModel):
    placement: str
    target_audience: str = "General audience"

def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY is not configured on the server. AI features are currently unavailable.")
    return Groq(api_key=api_key)

def call_groq_json(prompt: str, error_context: str):
    client = get_groq_client()
    model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You return strictly valid JSON."},
                {"role": "user", "content": prompt}
            ],
            model=model,
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        content = chat_completion.choices[0].message.content
        if not content:
            raise ValueError("AI generated an empty response")
            
        return json.loads(content.strip())
    except Exception as e:
        logger.error(f"Groq API Error in {error_context}: {str(e)}", exc_info=True)
        err_msg = str(e)
        if "model_decommissioned" in err_msg or "invalid_request_error" in err_msg:
            raise HTTPException(status_code=502, detail="AI Provider Error: The selected model is decommissioned or unavailable.")
        elif "rate_limit" in err_msg.lower():
            raise HTTPException(status_code=429, detail="AI rate limit exceeded. Please wait a moment and try again.")
        elif "JSONDecodeError" in str(type(e)):
            raise HTTPException(status_code=502, detail="AI returned malformed data. Please try again.")
        raise HTTPException(status_code=500, detail=f"Failed to {error_context}. Please try again.")

@router.post("/ai/product-description")
def generate_product_description(payload: ProductDescRequest):
    prompt = f"""
    You are an expert copywriter for a premium ecommerce platform.
    Generate compelling details for the following product:
    Name: {payload.name}
    Category: {payload.category}
    Brand: {payload.brand}

    Please return a JSON object with the following exact structure:
    {{
      "description": "A detailed, premium, engaging paragraph describing the product.",
      "features": ["feature 1", "feature 2", "feature 3", "feature 4"]
    }}
    """
    return call_groq_json(prompt, "generate AI content")

@router.post("/ai/seo")
def generate_product_seo(payload: ProductSeoRequest):
    prompt = f"""
    You are an expert SEO specialist for a premium ecommerce platform.
    Generate highly relevant SEO metadata for the following product:
    Name: {payload.name}
    Category: {payload.category}

    Please return a JSON object with the following exact structure:
    {{
      "seo_keywords": "comma, separated, list, of, high-value, search, keywords"
    }}
    """
    return call_groq_json(prompt, "generate AI SEO tags")

@router.post("/ai/category-seo")
def generate_category_seo(payload: CategorySeoRequest):
    prompt = f"""
    You are an expert SEO specialist for a premium ecommerce platform.
    Generate highly relevant SEO metadata and descriptions for the following product category:
    Name: {payload.name}

    Please return a JSON object with the following exact structure:
    {{
      "description": "A compelling, keyword-rich category description.",
      "seo_keywords": "comma, separated, list, of, high-value, keywords",
      "seo_suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
    }}
    """
    return call_groq_json(prompt, "generate Category SEO")

@router.post("/ai/banner-copy")
def generate_banner_copy(payload: BannerCopyRequest):
    prompt = f"""
    You are an expert copywriter for a premium ecommerce platform.
    Generate engaging, high-conversion copy for a promotional banner.
    Placement: {payload.placement}
    Target Audience: {payload.target_audience}

    Please return a JSON object with the following exact structure:
    {{
      "title": "A catchy, short headline (max 5 words).",
      "subtitle": "A compelling supporting subtitle (max 12 words).",
      "cta_text": "Short actionable button text (e.g., Shop Now)."
    }}
    """
    return call_groq_json(prompt, "generate Banner Copy")
