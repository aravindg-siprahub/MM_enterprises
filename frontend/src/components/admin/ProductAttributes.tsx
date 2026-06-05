"use client";

import { useState } from "react";
import { ProductAttribute } from "@/lib/types";
import { API_BASE_URL } from "@/lib/config";
import { Trash2, Plus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  productId?: string;
  initialAttributes: ProductAttribute[];
  onChange?: (attributes: any[]) => void;
}

export default function ProductAttributes({ productId, initialAttributes, onChange }: Props) {
  const [attributes, setAttributes] = useState<any[]>(initialAttributes || []);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!newName || !newValue) {
      toast.error("Please provide both name and value");
      return;
    }
    
    const newAttrData = {
      attribute_name: newName,
      attribute_value: newValue,
      id: "temp_" + Date.now()
    };

    if (!productId) {
      const newArray = [...attributes, newAttrData];
      setAttributes(newArray);
      if (onChange) onChange(newArray);
      setNewName("");
      setNewValue("");
      setIsAdding(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
      const res = await fetch(`${API_BASE_URL}/api/admin/products/${productId}/attributes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ...newAttrData, product_id: productId })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to add attribute");
      }
      
      const newAttr = await res.json();
      const newArray = [...attributes, newAttr];
      setAttributes(newArray);
      if (onChange) onChange(newArray);
      setNewName("");
      setNewValue("");
      setIsAdding(false);
      toast.success("Specification added");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this specification?")) return;
    
    if (!productId) {
      const newArray = attributes.filter(a => a.id !== id);
      setAttributes(newArray);
      if (onChange) onChange(newArray);
      return;
    }

    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
      const res = await fetch(`${API_BASE_URL}/api/admin/products/attributes/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Failed to delete attribute");
      
      const newArray = attributes.filter(a => a.id !== id);
      setAttributes(newArray);
      if (onChange) onChange(newArray);
      toast.success("Specification deleted");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--border)] space-y-4 mt-6">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="font-semibold text-lg">Product Specifications</h3>
        <button 
          type="button" 
          onClick={() => setIsAdding(!isAdding)}
          className="text-sm flex items-center gap-1 text-[#2874f0] hover:underline"
        >
          <Plus size={16} /> Add Specification
        </button>
      </div>

      {isAdding && (
        <div className="bg-gray-50 p-4 rounded-md border grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Key (e.g., RAM)</label>
            <input 
              value={newName} 
              onChange={e => setNewName(e.target.value)} 
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Processor"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Value (e.g., 8GB)</label>
            <input 
              value={newValue} 
              onChange={e => setNewValue(e.target.value)} 
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Snapdragon 8 Gen 2"
            />
          </div>
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={handleAdd}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex-1 flex justify-center disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
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

      {attributes.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-2 font-medium border-b">Specification Key</th>
                <th className="px-4 py-2 font-medium border-b">Value</th>
                <th className="px-4 py-2 font-medium border-b w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {attributes.map(attr => (
                <tr key={attr.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{attr.attribute_name}</td>
                  <td className="px-4 py-2">{attr.attribute_value}</td>
                  <td className="px-4 py-2 text-center">
                    <button type="button" onClick={() => handleDelete(attr.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-500 py-4 text-center">No specifications added yet.</p>
      )}
    </div>
  );
}
