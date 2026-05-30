"use client";

import BannerForm from "@/components/admin/BannerForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewBannerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/banners" className="p-2 rounded hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Add New Banner</h1>
      </div>
      <BannerForm />
    </div>
  );
}
