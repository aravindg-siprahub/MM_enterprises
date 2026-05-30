"use client";

import { useEffect, useState, use } from "react";
import BannerForm from "@/components/admin/BannerForm";
import { Banner } from "@/lib/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

export default function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
        const res = await fetch(`${API_BASE_URL}/api/admin/banners/${id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          setBanner(await res.json());
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanner();
  }, [id]);

  if (isLoading) return <div className="animate-pulse bg-white h-96 rounded-lg" />;
  if (!banner) return <div className="text-center py-12 text-red-500">Banner not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/banners" className="p-2 rounded hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Edit Banner</h1>
      </div>
      <BannerForm initialData={banner} />
    </div>
  );
}
