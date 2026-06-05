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
    <div className="w-full md:w-[250px] shrink-0">
      <div className="glass-card p-6 md:sticky top-[100px]">
        
        {/* Category Filter */}
        <div className="mb-8">
          <h3 className="font-poppins text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Categories
          </h3>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 hover:text-primary transition-colors">
              <input 
                type="radio" 
                name="category" 
                checked={currentCategory === ""}
                onChange={() => updateFilters("category", "")}
                className="accent-primary w-4 h-4"
              />
              All Categories
            </label>
            {categories.map(cat => (
              <label key={cat.slug} className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 hover:text-primary transition-colors">
                <input 
                  type="radio" 
                  name="category" 
                  checked={currentCategory === cat.slug}
                  onChange={() => updateFilters("category", cat.slug)}
                  className="accent-primary w-4 h-4"
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>

        {/* Brand Filter */}
        <div>
          <h3 className="font-poppins text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Brands
          </h3>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 hover:text-primary transition-colors">
              <input 
                type="radio" 
                name="brand" 
                checked={currentBrand === ""}
                onChange={() => updateFilters("brand", "")}
                className="accent-primary w-4 h-4"
              />
              All Brands
            </label>
            {brands.map(brand => (
              <label key={brand.name} className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 hover:text-primary transition-colors">
                <input 
                  type="radio" 
                  name="brand" 
                  checked={currentBrand === brand.name}
                  onChange={() => updateFilters("brand", brand.name)}
                  className="accent-primary w-4 h-4"
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
