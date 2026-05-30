"use client";

import { useEffect, useState } from "react";
import { Brand } from "@/lib/types";
import DataTable from "@/components/admin/DataTable";
import toast from "react-hot-toast";
import { API_BASE_URL } from "@/lib/config";
import { getImageUrl } from "@/lib/imageUtils";
import ImageUploader from "@/components/admin/ImageUploader";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBrand, setCurrentBrand] = useState<Partial<Brand>>({ name: "", slug: "", is_active: true });
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    fetchBrands();
  }, []);

  const getAuthToken = () => document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];

  const fetchBrands = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/brands`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBrands(data.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      const method = isEditing && currentBrand.id ? "PUT" : "POST";
      const url = isEditing && currentBrand.id 
        ? `${API_BASE_URL}/api/admin/brands/${currentBrand.id}` 
        : `${API_BASE_URL}/api/admin/brands`;
        
      const payload = {
        ...currentBrand,
        logo_url: images.length > 0 ? (images[0].path || images[0].url) : null
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Failed to save brand");
      
      toast.success(isEditing ? "Brand updated" : "Brand added");
      setCurrentBrand({ name: "", slug: "", is_active: true });
      setImages([]);
      setIsEditing(false);
      fetchBrands();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (brand: Brand) => {
    if (!confirm(`Are you sure you want to delete ${brand.name}?`)) return;
    const toastId = toast.loading("Deleting brand...");
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/brands/${brand.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Brand deleted", { id: toastId });
        fetchBrands();
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to delete brand");
      }
    } catch (error: any) {
      toast.error(error.message || "Error deleting brand", { id: toastId });
    }
  };

  const columns = [
    { key: "logo_url", label: "Logo", render: (val: string) => val ? <img src={getImageUrl(val, 'brands')} className="h-8 object-contain bg-white border rounded p-1" /> : <span className="text-gray-400 text-xs">No Logo</span> },
    { key: "name", label: "Brand Name" },
    { key: "slug", label: "Slug" },
    { key: "is_active", label: "Status", render: (val: boolean) => val ? "Active" : "Inactive" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Brands</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--border)]">
        <h2 className="text-lg font-semibold mb-4">{isEditing ? "Edit Brand" : "Add New Brand"}</h2>
        
        <div className="mb-6 max-w-sm">
          <label className="block text-sm font-medium mb-2">Brand Logo</label>
          <ImageUploader images={images} onChange={(newImgs) => setImages(newImgs.slice(0, 1))} bucket="brands" />
        </div>

        <form onSubmit={handleSave} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input 
              required 
              type="text" 
              className="w-full border rounded-md px-3 py-2" 
              value={currentBrand.name || ""} 
              onChange={e => setCurrentBrand({...currentBrand, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')})}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input 
              required 
              type="text" 
              className="w-full border rounded-md px-3 py-2" 
              value={currentBrand.slug || ""} 
              onChange={e => setCurrentBrand({...currentBrand, slug: e.target.value})}
            />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <input 
              type="checkbox" 
              id="isActiveBrand"
              checked={currentBrand.is_active || false} 
              onChange={e => setCurrentBrand({...currentBrand, is_active: e.target.checked})}
            />
            <label htmlFor="isActiveBrand" className="text-sm">Active</label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              {isEditing ? "Update" : "Add"}
            </button>
            {isEditing && (
              <button type="button" onClick={() => { setIsEditing(false); setCurrentBrand({ name: "", slug: "", is_active: true }); setImages([]); }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
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
          data={brands} 
          searchPlaceholder="Search brands..."
          onEdit={(brand) => { 
            setIsEditing(true); 
            setCurrentBrand(brand); 
            setImages(brand.logo_url ? [{ url: getImageUrl(brand.logo_url, 'brands'), path: brand.logo_url, is_primary: true }] : []);
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
