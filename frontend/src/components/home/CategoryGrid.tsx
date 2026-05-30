"use client";

import Link from "next/link";
import Image from "next/image";
import { Category } from "@/lib/types";
import AnimatedSection from "../ui/AnimatedSection";
import { getImageUrl } from "@/lib/imageUtils";

interface Props {
  categories: Category[];
}

export default function CategoryGrid({ categories }: Props) {
  if (!categories || categories.length === 0) return null;

  return (
    <AnimatedSection className="bg-white py-6 px-2 my-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-x-auto no-scrollbar" delay={0.1}>
      <div className="max-w-7xl mx-auto flex justify-around min-w-max gap-8 px-4">
        {categories.slice(0, 8).map((cat) => (
          <Link 
            key={cat.id} 
            href={`/products?category=${cat.slug}`}
            className="flex flex-col items-center gap-3 group min-w-[90px]"
          >
            <div className="w-20 h-20 bg-[var(--background)] rounded-full flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-[var(--primary)] group-hover:shadow-[0_10px_20px_rgba(124,58,237,0.2)] transition-all duration-300 transform group-hover:-translate-y-1">
              {cat.icon_url ? (
                <Image src={getImageUrl(cat.icon_url, 'icons')} alt={cat.name || "Category Icon"} width={48} height={48} className="object-contain h-auto w-auto group-hover:scale-110 transition-transform duration-300" />
              ) : (
                <div className="text-2xl font-black text-[var(--primary)]">{cat.name.charAt(0)}</div>
              )}
            </div>
            <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors text-center">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </AnimatedSection>
  );
}
