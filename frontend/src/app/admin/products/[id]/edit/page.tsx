"use client";

import { useEffect, useState, use } from "react";
import ProductForm from "@/components/admin/ProductForm";
import { Category, Brand, Product } from "@/lib/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
        const authHeaders = { "Authorization": `Bearer ${token}` };

        const [prodRes, catRes, brandRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/products/${id}`, { headers: authHeaders }),
          fetch(`${API_BASE_URL}/api/categories`),
          fetch(`${API_BASE_URL}/api/brands`)
        ]);
        
        if (prodRes.ok) {
          setProduct(await prodRes.json());
        } else {
          console.error("Product fetch failed:", prodRes.status, await prodRes.text());
        }
        if (catRes.ok) setCategories(await catRes.json());
        if (brandRes.ok) setBrands(await brandRes.json());
      } catch (error) {
        console.error("Failed to fetch product data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);


  if (isLoading) return <div className="animate-pulse bg-white h-96 rounded-lg" />;
  if (!product) return <div className="text-center py-12 text-red-500">Product not found</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 rounded hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Edit Product: {product.name}</h1>
      </div>
      
      <ProductForm initialData={product} categories={categories} brands={brands} />
    </div>
  );
}
