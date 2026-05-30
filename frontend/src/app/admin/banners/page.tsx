"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import { Banner } from "@/lib/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { getImageUrl } from "@/lib/imageUtils";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
      const res = await fetch(`${API_BASE_URL}/api/admin/banners`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBanners(data.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (banner: Banner) => {
    if (!confirm(`Are you sure you want to delete ${banner.title || 'this banner'}?`)) return;
    const toastId = toast.loading("Deleting banner...");
    const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/banners/${banner.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        toast.success("Banner deleted", { id: toastId });
        setBanners(banners.filter(b => b.id !== banner.id));
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to delete banner");
      }
    } catch (error: any) {
      toast.error(error.message || "Error deleting banner", { id: toastId });
    }
  };

  const columns = [
    { key: "image_url", label: "Preview", render: (val: string) => <img src={getImageUrl(val, 'banners')} className="h-12 object-contain rounded border bg-gray-50" /> },
    { key: "title", label: "Title" },
    { key: "placement", label: "Placement", render: (val: string) => <span className="uppercase text-xs font-bold text-gray-600">{val}</span> },
    { key: "is_active", label: "Status", render: (val: boolean) => val ? <span className="text-green-600">Active</span> : <span className="text-red-500">Draft</span> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Banners</h1>
        <Link href="/admin/banners/new" className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-md">
          <Plus size={18} /> Add Banner
        </Link>
      </div>

      {isLoading ? <div className="animate-pulse bg-white h-96 rounded-lg" /> : (
        <DataTable 
          columns={columns} 
          data={banners} 
          onEdit={(b) => router.push(`/admin/banners/${b.id}/edit`)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
