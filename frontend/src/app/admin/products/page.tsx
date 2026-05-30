"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import { Product } from "@/lib/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { getImageUrl } from "@/lib/imageUtils";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (attempt = 1) => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
      const res = await fetch(`${API_BASE_URL}/api/admin/products?limit=100`, { 
        cache: "no-store",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.data);
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (error) {
      if (attempt < 3) {
        // Retry up to 2 more times with a short delay (backend may be starting up)
        setTimeout(() => fetchProducts(attempt + 1), 1500);
        return;
      }
      console.error("Failed to load products after retries:", error);
      toast.error("Could not connect to backend. Is the server running?");
    } finally {
      if (attempt >= 3 || true) setIsLoading(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete ${product.name}?`)) return;

    const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
    const toastId = toast.loading("Deleting product...");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/products/${product.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        toast.success("Product deleted", { id: toastId });
        setProducts(products.filter(p => p.id !== product.id));
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to delete product");
      }
    } catch (error: any) {
      toast.error(error.message || "Error deleting product", { id: toastId });
    }
  };

  const handleBulkAction = async (action: string, ids: string[]) => {
    const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/products/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ action, ids })
      });
      
      if (res.ok) {
        const data = await res.json();
        toast.success(`Successfully applied '${action}' to ${data.count} products`);
        fetchProducts(); // Refresh
      } else {
        toast.error(`Failed to execute bulk action: ${action}`);
      }
    } catch (error) {
      toast.error("Error executing bulk action");
    }
  };

  const columns = [
    { key: "name", label: "Product Name", render: (val: string, item: Product) => (
      <div className="flex items-center gap-3">
        {item.images && item.images.length > 0 && (
          <img 
            src={getImageUrl(item.images.find(i => i.is_primary)?.image_url || item.images[0].image_url, 'products')} 
            alt={val} 
            className="w-10 h-10 object-contain bg-white border rounded" 
          />
        )}
        <span className="font-medium line-clamp-1">{val}</span>
      </div>
    )},
    { key: "category", label: "Category", render: (_: any, item: Product) => item.category?.name || "N/A" },
    { key: "selling_price", label: "Price", render: (val: number) => `₹${val.toLocaleString()}` },
    { key: "stock_qty", label: "Stock", render: (val: number) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${val > 10 ? 'bg-green-100 text-green-700' : val > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
        {val} in stock
      </span>
    )},
    { key: "is_active", label: "Status", render: (val: boolean) => (
      val ? <span className="text-green-600 font-medium">Active</span> : <span className="text-red-500 font-medium">Draft</span>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Products</h1>
        <Link 
          href="/admin/products/new" 
          className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {isLoading ? (
        <div className="animate-pulse bg-white h-96 rounded-lg border border-[var(--border)]" />
      ) : (
        <DataTable 
          columns={columns} 
          data={products} 
          onEdit={(p) => router.push(`/admin/products/${p.id}/edit`)}
          onDelete={handleDelete}
          searchPlaceholder="Search products by name..."
          selectable={true}
          bulkActions={[
            { label: "Activate", action: "activate", className: "bg-green-600 hover:bg-green-700" },
            { label: "Deactivate", action: "deactivate", className: "bg-yellow-600 hover:bg-yellow-700" },
            { label: "Delete", action: "delete", className: "bg-red-600 hover:bg-red-700" }
          ]}
          onBulkAction={handleBulkAction}
        />
      )}
    </div>
  );
}
