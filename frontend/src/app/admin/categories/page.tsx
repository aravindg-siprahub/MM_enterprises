"use client";

import { useEffect, useState } from "react";
import { Category } from "@/lib/types";
import DataTable from "@/components/admin/DataTable";
import toast from "react-hot-toast";
import { API_BASE_URL } from "@/lib/config";
import { getImageUrl } from "@/lib/imageUtils";
import ImageUploader from "@/components/admin/ImageUploader";
import { Sparkles, Loader2 } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({ name: "", slug: "", parent_id: "", is_active: true });
  const [images, setImages] = useState<any[]>([]);
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
  
  // UI-only state for AI generated content (Not saved to DB)
  const [aiDescription, setAiDescription] = useState("");
  const [aiKeywords, setAiKeywords] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const getAuthToken = () => document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];

  const fetchCategories = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/categories`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.data || []);
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
      const method = isEditing && currentCategory.id ? "PUT" : "POST";
      const url = isEditing && currentCategory.id 
        ? `${API_BASE_URL}/api/admin/categories/${currentCategory.id}` 
        : `${API_BASE_URL}/api/admin/categories`;
        
      const payload = {
        ...currentCategory,
        parent_id: currentCategory.parent_id || null,
        icon_url: images.length > 0 ? (images[0].path || images[0].url) : null
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Failed to save category");
      
      toast.success(isEditing ? "Category updated" : "Category added");
      setCurrentCategory({ name: "", slug: "", parent_id: "", is_active: true });
      setImages([]);
      setIsEditing(false);
      setAiDescription("");
      setAiKeywords("");
      setAiSuggestions([]);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete ${category.name}?`)) return;
    const toastId = toast.loading("Deleting category...");
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/categories/${category.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Category deleted", { id: toastId });
        fetchCategories();
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to delete category");
      }
    } catch (error: any) {
      toast.error(error.message || "Error deleting category", { id: toastId });
    }
  };

  const handleGenerateSEO = async () => {
    if (!currentCategory.name) {
      toast.error("Please enter a category name first.");
      return;
    }

    setIsGeneratingSEO(true);
    const token = getAuthToken();
    const toastId = toast.loading("Generating Category SEO...");
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/ai/category-seo`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ name: currentCategory.name })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to generate category SEO");
      }
      const data = await res.json();
      
      if (data.description) setAiDescription(data.description);
      if (data.seo_keywords) setAiKeywords(data.seo_keywords);
      if (data.seo_suggestions) setAiSuggestions(data.seo_suggestions);
      
      toast.success("Category SEO generated! (UI Only)", { id: toastId });
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsGeneratingSEO(false);
    }
  };

  const columns = [
    { key: "icon_url", label: "Icon", render: (val: string) => val ? <img src={getImageUrl(val, 'icons')} className="h-8 object-contain bg-white border rounded p-1" /> : <span className="text-gray-400 text-xs">No Icon</span> },
    { key: "name", label: "Category Name" },
    { key: "slug", label: "Slug" },
    { key: "parent_id", label: "Parent", render: (val: string) => val ? categories.find(c => c.id === val)?.name || "Unknown" : "None" },
    { key: "is_active", label: "Status", render: (val: boolean) => val ? "Active" : "Inactive" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Categories</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{isEditing ? "Edit Category" : "Add New Category"}</h2>
          <button 
            type="button" 
            onClick={handleGenerateSEO}
            disabled={isGeneratingSEO}
            className="flex items-center gap-1 text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
          >
            {isGeneratingSEO ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} AI SEO Generator
          </button>
        </div>
        
        <div className="mb-6 max-w-sm">
          <label className="block text-sm font-medium mb-2">Category Icon</label>
          <ImageUploader images={images} onChange={(newImgs) => setImages(newImgs.slice(0, 1))} bucket="icons" />
        </div>

        <form onSubmit={handleSave} className="flex gap-4 items-end flex-wrap">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input 
              required 
              type="text" 
              className="w-full border rounded-md px-3 py-2" 
              value={currentCategory.name || ""} 
              onChange={e => setCurrentCategory({...currentCategory, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')})}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input 
              required 
              type="text" 
              className="w-full border rounded-md px-3 py-2" 
              value={currentCategory.slug || ""} 
              onChange={e => setCurrentCategory({...currentCategory, slug: e.target.value})}
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium mb-1">Parent Category</label>
            <select 
              className="w-full border rounded-md px-3 py-2" 
              value={currentCategory.parent_id || ""} 
              onChange={e => setCurrentCategory({...currentCategory, parent_id: e.target.value})}
            >
              <option value="">None (Top Level)</option>
              {categories.filter(c => c.id !== currentCategory.id).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <input 
              type="checkbox" 
              id="isActive"
              checked={currentCategory.is_active || false} 
              onChange={e => setCurrentCategory({...currentCategory, is_active: e.target.checked})}
            />
            <label htmlFor="isActive" className="text-sm">Active</label>
          </div>
          <div className="flex gap-2 w-full mt-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              {isEditing ? "Update" : "Add"}
            </button>
            {isEditing && (
              <button type="button" onClick={() => { setIsEditing(false); setCurrentCategory({ name: "", slug: "", parent_id: "", is_active: true }); setImages([]); setAiDescription(""); setAiKeywords(""); setAiSuggestions([]); }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* UI-Only AI Fields */}
        {(aiDescription || aiKeywords) && (
          <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="font-semibold text-purple-900">AI SEO Suggestions (Not saved to database)</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-800 mb-1">Generated Description</label>
                <textarea readOnly value={aiDescription} rows={3} className="w-full border border-purple-200 rounded-md px-3 py-2 text-sm bg-white text-gray-700 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-800 mb-1">SEO Keywords</label>
                <input readOnly value={aiKeywords} className="w-full border border-purple-200 rounded-md px-3 py-2 text-sm bg-white text-gray-700 outline-none" />
              </div>
              {aiSuggestions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-purple-800 mb-1">Content Suggestions</label>
                  <ul className="list-disc pl-5 text-sm text-purple-700 space-y-1">
                    {aiSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="animate-pulse bg-white h-96 rounded-lg" />
      ) : (
        <DataTable 
          columns={columns} 
          data={categories} 
          searchPlaceholder="Search categories..."
          onEdit={(cat) => { 
            setIsEditing(true); 
            setCurrentCategory(cat); 
            setImages(cat.icon_url ? [{ url: getImageUrl(cat.icon_url, 'icons'), path: cat.icon_url, is_primary: true }] : []);
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
