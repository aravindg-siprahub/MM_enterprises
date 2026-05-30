"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  categories: Category[];
}

export default function CategoryBar({ categories }: Props) {
  const pathname = usePathname();

  if (!categories || categories.length === 0) return null;

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm overflow-x-auto scrollbar-hide whitespace-nowrap">
      {categories.map((cat) => {
        // Handle "For You" pointing to / and others to /slug
        const path = cat.slug === 'for-you' ? '/' : `/${cat.slug}`;
        const isActive = pathname === path;
        
        return (
          <Link 
            key={cat.id}
            href={path}
            className={`inline-block px-3 py-2 text-sm transition-colors min-h-[44px] ${isActive ? 'text-[#2874f0] border-b-[3px] border-[#2874f0] font-bold' : 'text-[#212121] hover:text-[#2874f0] font-medium'}`}
          >
            {cat.name}
          </Link>
        );
      })}
    </div>
  );
}
