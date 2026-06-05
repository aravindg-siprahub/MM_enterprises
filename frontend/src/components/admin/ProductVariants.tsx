"use client";

import { useState } from "react";
import { ProductVariant } from "@/lib/types";
import { API_BASE_URL } from "@/lib/config";
import { Trash2, Plus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  productId?: string;
  initialVariants: ProductVariant[];
  onChange?: (variants: any[]) => void;
}

export default function ProductVariants({ productId, initialVariants, onChange }: Props) {
  const [variants, setVariants] = useState<any[]>(initialVariants || []);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    variant_type: "",
    variant_value: "",
    sku: "",
    price_override: "",
    stock_quantity: 0,
  });

  const handleAdd = async () => {
    if (!formData.variant_type || !formData.variant_value) {
      toast.error("Type and Value are required");
      return;
    }
    
    const newVariantData = {
      variant_type: formData.variant_type,
      variant_value: formData.variant_value,
      sku: formData.sku || null,
      price_override: formData.price_override ? parseFloat(formData.price_override) : null,
      stock_quantity: formData.stock_quantity,
      is_active: true,
      id: "temp_" + Date.now()
    };

    if (!productId) {
      const newArray = [...variants, newVariantData];
      setVariants(newArray);
      if (onChange) onChange(newArray);
      setFormData({ variant_type: "", variant_value: "", sku: "", price_override: "", stock_quantity: 0 });
      setIsAdding(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
      const res = await fetch(`${API_BASE_URL}/api/admin/products/${productId}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ...newVariantData, product_id: productId })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to add variant");
      }
      
      const newVar = await res.json();
      const newArray = [...variants, newVar];
      setVariants(newArray);
      if (onChange) onChange(newArray);
      setFormData({ variant_type: "", variant_value: "", sku: "", price_override: "", stock_quantity: 0 });
      setIsAdding(false);
      toast.success("Variant added");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this variant?")) return;
    
    if (!productId) {
      const newArray = variants.filter(v => v.id !== id);
      setVariants(newArray);
      if (onChange) onChange(newArray);
      return;
    }

    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
      const res = await fetch(`${API_BASE_URL}/api/admin/products/variants/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Failed to delete variant");
      
      const newArray = variants.filter(v => v.id !== id);
      setVariants(newArray);
      if (onChange) onChange(newArray);
      toast.success("Variant deleted");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--border)] space-y-4 mt-6">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="font-semibold text-lg">Product Variants</h3>
        <button 
          type="button" 
          onClick={() => setIsAdding(!isAdding)}
          className="text-sm flex items-center gap-1 text-[#2874f0] hover:underline"
        >
          <Plus size={16} /> Add Variant
        </button>
      </div>

      {isAdding && (
        <div className="bg-gray-50 p-4 rounded-md border space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Type (e.g., Color, RAM)</label>
              <input 
                value={formData.variant_type} 
                onChange={e => setFormData({...formData, variant_type: e.target.value})} 
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Value (e.g., Black, 8GB)</label>
              <input 
                value={formData.variant_value} 
                onChange={e => setFormData({...formData, variant_value: e.target.value})} 
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">SKU (Optional)</label>
              <input 
                value={formData.sku} 
                onChange={e => setFormData({...formData, sku: e.target.value})} 
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Price Override (₹)</label>
              <input 
                type="number"
                value={formData.price_override} 
                onChange={e => setFormData({...formData, price_override: e.target.value})} 
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Leave blank for base price"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Stock Quantity</label>
              <input 
                type="number"
                value={formData.stock_quantity} 
                onChange={e => setFormData({...formData, stock_quantity: parseInt(e.target.value) || 0})} 
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button 
              type="button" 
              onClick={handleAdd}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex justify-center disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Variant'}
            </button>
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {variants.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-2 font-medium border-b">Type</th>
                <th className="px-4 py-2 font-medium border-b">Value</th>
                <th className="px-4 py-2 font-medium border-b">SKU</th>
                <th className="px-4 py-2 font-medium border-b">Price Override</th>
                <th className="px-4 py-2 font-medium border-b">Stock</th>
                <th className="px-4 py-2 font-medium border-b w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {variants.map(v => (
                <tr key={v.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{v.variant_type}</td>
                  <td className="px-4 py-2">{v.variant_value}</td>
                  <td className="px-4 py-2 text-gray-500">{v.sku || '-'}</td>
                  <td className="px-4 py-2 text-[#2874f0] font-medium">{v.price_override ? `₹${v.price_override}` : '-'}</td>
                  <td className="px-4 py-2">{v.stock_quantity}</td>
                  <td className="px-4 py-2 text-center">
                    <button type="button" onClick={() => handleDelete(v.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-500 py-4 text-center">No variants added yet.</p>
      )}
    </div>
  );
}
