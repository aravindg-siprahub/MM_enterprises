"use client";

import { useState } from "react";
import Image from "next/image";
import { UploadCloud, X, Star } from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "@/lib/config";

interface ImageFile {
  url: string;
  path: string;
  is_primary: boolean;
}

interface Props {
  images: ImageFile[];
  onChange: (images: ImageFile[]) => void;
  bucket: string;
}

export default function ImageUploader({ images, onChange, bucket }: Props) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
    
    const newImages = [...images];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/upload/${bucket}`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData
        });

        if (!res.ok) throw new Error("Upload failed");
        
        const data = await res.json();
        newImages.push({
          url: data.url,
          path: data.path,
          is_primary: newImages.length === 0 // First image is primary by default
        });
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    onChange(newImages);
    setIsUploading(false);
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = images.filter((_, idx) => idx !== indexToRemove);
    // If we removed the primary, make the first one primary
    if (images[indexToRemove].is_primary && newImages.length > 0) {
      newImages[0].is_primary = true;
    }
    onChange(newImages);
  };

  const setPrimary = (indexToPrimary: number) => {
    const newImages = images.map((img, idx) => ({
      ...img,
      is_primary: idx === indexToPrimary
    }));
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors relative">
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={handleFileUpload} 
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <UploadCloud size={40} className="text-gray-400 mb-2" />
        <p className="text-sm font-medium text-gray-700">
          {isUploading ? "Uploading..." : "Click or drag images here to upload"}
        </p>
        <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
      </div>

      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img, idx) => (
            <div key={idx} className={`relative rounded-lg border-2 p-1 ${img.is_primary ? 'border-[var(--primary)]' : 'border-gray-200'}`}>
              <div className="relative h-24 w-full rounded bg-gray-50 overflow-hidden">
                <Image src={img.url} alt="Upload" fill sizes="(max-width:768px) 50vw, 200px" className="object-contain" />
              </div>
              
              <button 
                onClick={(e) => { e.preventDefault(); removeImage(idx); }}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-sm hover:bg-red-600"
              >
                <X size={12} />
              </button>

              <button 
                onClick={(e) => { e.preventDefault(); setPrimary(idx); }}
                className={`absolute -bottom-2 -right-2 p-1.5 rounded-full shadow-sm ${img.is_primary ? 'bg-[var(--accent)] text-white' : 'bg-white text-gray-400 hover:text-yellow-500'}`}
                title={img.is_primary ? "Primary Image" : "Set as Primary"}
              >
                <Star size={14} className={img.is_primary ? "fill-white" : ""} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
