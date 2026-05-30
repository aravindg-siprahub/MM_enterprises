"use client";

import { useEffect, useState } from "react";
import { Deal } from "@/lib/types";
import DataTable from "@/components/admin/DataTable";
import toast from "react-hot-toast";
import { API_BASE_URL } from "@/lib/config";

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDeal, setCurrentDeal] = useState<Partial<Deal>>({ product_id: "", deal_type: "", deal_price: 0, is_active: true });

  useEffect(() => {
    fetchDeals();
    fetchProducts();
  }, []);

  const getAuthToken = () => document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];

  const fetchDeals = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/deals`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDeals(data.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/products?limit=1000`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      const method = isEditing && currentDeal.id ? "PUT" : "POST";
      const url = isEditing && currentDeal.id 
        ? `${API_BASE_URL}/api/admin/deals/${currentDeal.id}` 
        : `${API_BASE_URL}/api/admin/deals`;
        
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(currentDeal)
      });
      
      if (!res.ok) throw new Error("Failed to save deal");
      
      toast.success(isEditing ? "Deal updated" : "Deal added");
      setCurrentDeal({ product_id: "", deal_type: "", deal_price: 0, is_active: true });
      setIsEditing(false);
      fetchDeals();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (deal: Deal) => {
    if (!confirm("Are you sure you want to delete this deal?")) return;
    const toastId = toast.loading("Deleting deal...");
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/deals/${deal.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Deal deleted", { id: toastId });
        fetchDeals();
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to delete deal");
      }
    } catch (error: any) {
      toast.error(error.message || "Error deleting deal", { id: toastId });
    }
  };

  const columns = [
    { key: "product", label: "Product ID", render: (_: any, item: Deal) => item.product?.name || item.product_id },
    { key: "deal_type", label: "Deal Type", render: (val: string) => <span className="uppercase text-xs font-bold px-2 py-1 bg-yellow-100 text-yellow-800 rounded">{val}</span> },
    { key: "deal_price", label: "Deal Price", render: (val: number) => val ? `₹${val.toLocaleString()}` : "N/A" },
    { key: "is_active", label: "Status", render: (val: boolean) => val ? "Active" : "Inactive" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Deals</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--border)]">
        <h2 className="text-lg font-semibold mb-4">{isEditing ? "Edit Deal" : "Add New Deal"}</h2>
        <form onSubmit={handleSave} className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Product</label>
            <select 
              required 
              className="w-full border rounded-md px-3 py-2" 
              value={currentDeal.product_id || ""} 
              onChange={e => setCurrentDeal({...currentDeal, product_id: e.target.value})}
            >
              <option value="">Select a product...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium mb-1">Deal Type</label>
            <input 
              type="text" 
              className="w-full border rounded-md px-3 py-2" 
              value={currentDeal.deal_type || ""} 
              placeholder="e.g. top_deal"
              onChange={e => setCurrentDeal({...currentDeal, deal_type: e.target.value})}
            />
          </div>
          <div className="flex-1 min-w-[100px]">
            <label className="block text-sm font-medium mb-1">Deal Price</label>
            <input 
              type="number" 
              className="w-full border rounded-md px-3 py-2" 
              value={currentDeal.deal_price || ""} 
              onChange={e => setCurrentDeal({...currentDeal, deal_price: parseFloat(e.target.value)})}
            />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <input 
              type="checkbox" 
              id="isActiveDeal"
              checked={currentDeal.is_active || false} 
              onChange={e => setCurrentDeal({...currentDeal, is_active: e.target.checked})}
            />
            <label htmlFor="isActiveDeal" className="text-sm">Active</label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              {isEditing ? "Update" : "Add"}
            </button>
            {isEditing && (
              <button type="button" onClick={() => { setIsEditing(false); setCurrentDeal({ product_id: "", deal_type: "", deal_price: 0, is_active: true }); }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {isLoading ? (
        <div className="animate-pulse bg-white h-96 rounded-lg" />
      ) : (
        <DataTable 
          columns={columns} 
          data={deals} 
          searchPlaceholder="Search deals..."
          onEdit={(deal) => { setIsEditing(true); setCurrentDeal(deal); }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
