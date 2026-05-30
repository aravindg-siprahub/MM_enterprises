"use client";

import { useEffect, useState } from "react";
import ProductForm from "@/components/admin/ProductForm";
import { Category, Brand } from "@/lib/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/categories`),
          fetch(`${API_BASE_URL}/api/brands`)
        ]);
        
        if (catRes.ok) setCategories(await catRes.json());
        if (brandRes.ok) setBrands(await brandRes.json());
      } catch (error) {
        console.error("Failed to fetch dependencies", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <div className="animate-pulse bg-white h-96 rounded-lg" />;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 rounded hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Add New Product</h1>
      </div>
      
      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}
