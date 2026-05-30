"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import ImageUploader from "./ImageUploader";
import { Banner } from "@/lib/types";
import { API_BASE_URL } from "@/lib/config";
import { Sparkles, Loader2 } from "lucide-react";
import { getImageUrl } from "@/lib/imageUtils";

const bannerSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  link_url: z.string().optional(),
  cta_text: z.string().optional(),
  placement: z.string().optional(),
  is_active: z.boolean(),
  sort_order: z.number().int()
});

type BannerFormData = z.infer<typeof bannerSchema>;

interface Props {
  initialData?: Banner;
}

export default function BannerForm({ initialData }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [images, setImages] = useState<any[]>(
    initialData?.image_url ? [{ url: getImageUrl(initialData.image_url, 'banners'), path: initialData.image_url, is_primary: true }] : []
  );

  const form = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: initialData?.title || "",
      subtitle: initialData?.subtitle || "",
      link_url: initialData?.link_url || "",
      cta_text: initialData?.cta_text || "",
      placement: initialData?.placement || "hero",
      is_active: initialData?.is_active ?? true,
      sort_order: initialData?.sort_order || 0
    }
  });

  const onSubmit = async (data: BannerFormData) => {
    if (images.length === 0) {
      toast.error("Please upload a banner image");
      return;
    }

    setIsSubmitting(true);
    const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
    
    const payload = {
      ...data,
      image_url: images[0].path || images[0].url
    };

    try {
      const url = initialData 
        ? `${API_BASE_URL}/api/admin/banners/${initialData.id}`
        : `${API_BASE_URL}/api/admin/banners`;
        
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save banner");

      toast.success(`Banner ${initialData ? "updated" : "created"}`);
      router.push("/admin/banners");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
      } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateCopy = async () => {
    const placement = form.getValues("placement") || "hero";

    setIsGeneratingCopy(true);
    const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
    const toastId = toast.loading("Generating banner copy...");
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/ai/banner-copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ placement, target_audience: "General audience" })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to generate banner copy");
      }
      const data = await res.json();
      
      if (data.title) form.setValue("title", data.title);
      if (data.subtitle) form.setValue("subtitle", data.subtitle);
      if (data.cta_text) form.setValue("cta_text", data.cta_text);
      
      toast.success("Banner copy generated!", { id: toastId });
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-[var(--border)] max-w-3xl">
      
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Banner Image</h3>
        <ImageUploader images={images} onChange={(newImgs) => setImages(newImgs.slice(0, 1))} bucket="banners" />
        <p className="text-xs text-gray-500">Only 1 image is allowed for a banner. Uploading a new one will replace the old.</p>
      </div>

      <div className="flex items-center justify-between border-b pb-2 mb-4">
        <h3 className="font-semibold text-lg">Banner Content</h3>
        <button 
          type="button" 
          onClick={handleGenerateCopy}
          disabled={isGeneratingCopy}
          className="flex items-center gap-1 text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
        >
          {isGeneratingCopy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} AI Generate
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input {...form.register("title")} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
          <input {...form.register("subtitle")} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
          <input {...form.register("link_url")} placeholder="/products?category=mobiles" className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CTA Text</label>
          <input {...form.register("cta_text")} placeholder="Shop Now" className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Placement</label>
          <select {...form.register("placement")} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
            <option value="hero">Hero (Top Slider)</option>
            <option value="mid">Mid Promotional</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4 border-t pt-4">
        <div className="flex items-center gap-2">
          <input type="checkbox" id="is_active" {...form.register("is_active")} className="w-4 h-4 text-blue-600 rounded" />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active</label>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={() => router.back()} className="px-6 py-2 border rounded-md text-sm font-medium hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? "Saving..." : "Save Banner"}
        </button>
      </div>
    </form>
  );
}
