"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/config";

interface Category {
  slug: string;
  name: string;
}

interface Brand {
  name: string;
}

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const currentCategory = searchParams.get("category") || "";
  const currentBrand = searchParams.get("brand") || "";

  useEffect(() => {
    // Fetch categories and brands from backend
    Promise.all([
      fetch(`${API_BASE_URL}/api/categories`).then(res => res.json()),
      fetch(`${API_BASE_URL}/api/brands`).then(res => res.json())
    ])
    .then(([cats, brs]) => {
      setCategories(cats);
      setBrands(brs);
    })
    .catch(err => console.error("Error fetching filters", err));
  }, []);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/catalog?${params.toString()}`);
  };

  return (
    <div style={{ width: "250px", flexShrink: 0 }}>
      <div className="glass-card" style={{ padding: "24px", position: "sticky", top: "100px" }}>
        
        {/* Category Filter */}
        <div style={{ marginBottom: "32px" }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", color: "#f0f4ff", marginBottom: "16px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
            Categories
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "var(--text-secondary)" }}>
              <input 
                type="radio" 
                name="category" 
                checked={currentCategory === ""}
                onChange={() => updateFilters("category", "")}
                style={{ accentColor: "var(--gold-500)" }}
              />
              All Categories
            </label>
            {categories.map(cat => (
              <label key={cat.slug} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "var(--text-secondary)" }}>
                <input 
                  type="radio" 
                  name="category" 
                  checked={currentCategory === cat.slug}
                  onChange={() => updateFilters("category", cat.slug)}
                  style={{ accentColor: "var(--gold-500)" }}
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>

        {/* Brand Filter */}
        <div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", color: "#f0f4ff", marginBottom: "16px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
            Brands
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "var(--text-secondary)" }}>
              <input 
                type="radio" 
                name="brand" 
                checked={currentBrand === ""}
                onChange={() => updateFilters("brand", "")}
                style={{ accentColor: "var(--gold-500)" }}
              />
              All Brands
            </label>
            {brands.map(brand => (
              <label key={brand.name} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "var(--text-secondary)" }}>
                <input 
                  type="radio" 
                  name="brand" 
                  checked={currentBrand === brand.name}
                  onChange={() => updateFilters("brand", brand.name)}
                  style={{ accentColor: "var(--gold-500)" }}
                />
                {brand.name}
              </label>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}
