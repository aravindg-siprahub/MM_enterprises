"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import ImageUploader from "./ImageUploader";
import { Category, Brand, Product } from "@/lib/types";
import { Sparkles, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { getImageUrl } from "@/lib/imageUtils";

const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  description: z.string().optional(),
  category_id: z.string().uuid("Please select a category"),
  brand_id: z.string().uuid("Please select a brand"),
  original_price: z.number().min(0, "Price must be positive"),
  selling_price: z.number().min(0, "Price must be positive"),
  stock_qty: z.number().int().min(0, "Stock cannot be negative"),
  warranty_info: z.string().optional(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  is_top_deal: z.boolean(),
  tags: z.string().optional() // We'll convert to array on submit
});

type ProductFormData = z.infer<typeof productSchema>;

interface Props {
  initialData?: Product;
  categories: Category[];
  brands: Brand[];
}

export default function ProductForm({ initialData, categories, brands }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
  const [images, setImages] = useState<any[]>(
    initialData?.images?.map(img => ({ 
      url: getImageUrl(img.image_url, 'products'), 
      path: img.image_url, 
      is_primary: img.is_primary 
    })) || []
  );

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      category_id: initialData?.category_id || "",
      brand_id: initialData?.brand_id || "",
      original_price: initialData?.original_price || 0,
      selling_price: initialData?.selling_price || 0,
      stock_qty: initialData?.stock_qty || 0,
      warranty_info: initialData?.warranty_info || "",
      is_active: initialData?.is_active ?? true,
      is_featured: initialData?.is_featured ?? false,
      is_top_deal: initialData?.is_top_deal ?? false,
      tags: initialData?.tags ? initialData.tags.join(", ") : ""
    }
  });

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];

    const payload = {

      ...data,
      // discount_percent is a PostgreSQL generated column — do NOT send it; the DB computes it automatically
      tags: data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      images: images.map((img, idx) => ({
        image_url: img.path || img.url, // Prioritize path over url
        is_primary: img.is_primary,
        sort_order: idx
      }))
    };


    try {
      const url = initialData 
        ? `${API_BASE_URL}/api/admin/products/${initialData.id}`
        : `${API_BASE_URL}/api/admin/products`;
        
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to save product");
      }

      toast.success(`Product ${initialData ? "updated" : "created"} successfully`);
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateDesc = async () => {
    const name = form.getValues("name");
    const categoryId = form.getValues("category_id");
    const brandId = form.getValues("brand_id");
    
    if (!name || !categoryId || !brandId) {
      toast.error("Please enter a name, category, and brand first.");
      return;
    }

    const category = categories.find(c => c.id === categoryId)?.name || "";
    const brand = brands.find(b => b.id === brandId)?.name || "";

    setIsGeneratingDesc(true);
    const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
    const toastId = toast.loading("Generating description...");
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/ai/product-description`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ name, category, brand })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to generate description");
      }
      const data = await res.json();
      
      if (data.description) {
        form.setValue("description", data.description + "\n\n" + data.features?.map((f: string) => `• ${f}`).join("\n"));
      }
      toast.success("Description generated!", { id: toastId });
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleGenerateSEO = async () => {
    const name = form.getValues("name");
    const categoryId = form.getValues("category_id");
    
    if (!name || !categoryId) {
      toast.error("Please enter a name and category first.");
      return;
    }

    const category = categories.find(c => c.id === categoryId)?.name || "";

    setIsGeneratingSEO(true);
    const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
    const toastId = toast.loading("Generating SEO tags...");
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/ai/seo`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ name, category })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to generate SEO tags");
      }
      const data = await res.json();
      
      if (data.seo_keywords) {
        form.setValue("tags", data.seo_keywords);
      }
      toast.success("SEO tags generated!", { id: toastId });
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsGeneratingSEO(false);
    }
  };

  // Auto-generate slug from name
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === "name" && type === "change" && !initialData) {
        const generatedSlug = (value.name || "").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        form.setValue("slug", generatedSlug);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, form.setValue, initialData]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold text-lg">Basic Information</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input {...form.register("name")} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                <input {...form.register("slug")} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                {form.formState.errors.slug && <p className="text-red-500 text-xs mt-1">{form.formState.errors.slug.message}</p>}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <button 
                  type="button" 
                  onClick={handleGenerateDesc}
                  disabled={isGeneratingDesc}
                  className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-2 py-1 rounded transition-colors disabled:opacity-50"
                >
                  {isGeneratingDesc ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AI Generate
                </button>
              </div>
              <textarea {...form.register("description")} rows={4} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select {...form.register("category_id")} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {form.formState.errors.category_id && <p className="text-red-500 text-xs mt-1">{form.formState.errors.category_id.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <select {...form.register("brand_id")} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Select Brand</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                {form.formState.errors.brand_id && <p className="text-red-500 text-xs mt-1">{form.formState.errors.brand_id.message}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--border)] space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Images</h3>
            <ImageUploader images={images} onChange={setImages} bucket="products" />
          </div>
        </div>

        {/* Right Column - Pricing & Metadata */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--border)] space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Pricing & Inventory</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹)</label>
              <input type="number" {...form.register("original_price", { valueAsNumber: true })} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              {form.formState.errors.original_price && <p className="text-red-500 text-xs mt-1">{form.formState.errors.original_price.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₹)</label>
              <input type="number" {...form.register("selling_price", { valueAsNumber: true })} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              {form.formState.errors.selling_price && <p className="text-red-500 text-xs mt-1">{form.formState.errors.selling_price.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
              <input type="number" {...form.register("stock_qty", { valueAsNumber: true })} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--border)] space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Visibility & Badges</h3>
            
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_active" {...form.register("is_active")} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active (Visible to customers)</label>
            </div>
            
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_featured" {...form.register("is_featured")} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">Featured Product</label>
            </div>
            
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_top_deal" {...form.register("is_top_deal")} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <label htmlFor="is_top_deal" className="text-sm font-medium text-gray-700">Top Deal</label>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--border)] space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Additional Details</h3>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Tags (Comma separated)</label>
                <button 
                  type="button" 
                  onClick={handleGenerateSEO}
                  disabled={isGeneratingSEO}
                  className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-2 py-1 rounded transition-colors disabled:opacity-50"
                >
                  {isGeneratingSEO ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AI SEO
                </button>
              </div>
              <input {...form.register("tags")} placeholder="electronics, smartphone, new" className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Info</label>
              <input {...form.register("warranty_info")} placeholder="1 Year Manufacturer Warranty" className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-[var(--border)]">
        <button 
          type="button" 
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="px-6 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : initialData ? "Update Product" : "Create Product"}
        </button>
      </div>

    </form>
  );
}
