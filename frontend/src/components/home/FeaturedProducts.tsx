"use client";

import Link from "next/link";
import { Product } from "@/lib/types";
import AnimatedSection from "../ui/AnimatedSection";
import ProductGrid from "../product/ProductGrid";
import ProductCard from "../product/ProductCard";

interface Props {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink: string;
  delay?: number;
}

export default function FeaturedProducts({ title, subtitle, products, viewAllLink, delay = 0.6 }: Props) {
  if (!products || products.length === 0) return null;

  return (
    <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12" delay={delay}>
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6 border border-transparent hover:border-[var(--secondary)] transition-colors duration-300">
        
        <div className="flex justify-between items-end mb-8 pb-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h2>
            {subtitle && <p className="text-sm font-semibold text-[var(--text-secondary)] mt-1">{subtitle}</p>}
          </div>
          <Link href={viewAllLink} className="bg-[var(--primary)] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[var(--text-primary)] transition-colors shadow-md cursor-pointer">
            VIEW ALL
          </Link>
        </div>
        
        <ProductGrid>
          {products.slice(0, 5).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ProductGrid>
      </div>
    </AnimatedSection>
  );
}
