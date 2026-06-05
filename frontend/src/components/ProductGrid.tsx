import Link from "next/link";
import ProductCard, { Product } from "./ProductCard";
import { ArrowRight } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

export default async function ProductGrid({ 
  title,
  subtitle,
  viewAllLink,
  featured = false,
  category,
  brand,
  search,
  staticProducts = [] // Optional fallback/static injection
}: { 
  title?: string;
  subtitle?: string;
  viewAllLink?: string;
  featured?: boolean;
  category?: string;
  brand?: string;
  search?: string;
  staticProducts?: Product[];
}) {
  let products: Product[] = staticProducts;
  
  if (products.length === 0) {
    try {
      // Determine URL based on featured flag
      const url = new URL(`${API_BASE_URL}/api/products${featured ? '/featured' : ''}`);
      if (category) url.searchParams.append('category', category);
      if (brand) url.searchParams.append('brand', brand);
      if (search) url.searchParams.append('search', search);

      // Fetch data from FastAPI backend
      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (res.ok) {
        const jsonRes = await res.json();
        products = Array.isArray(jsonRes) ? jsonRes : (jsonRes.data || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  // If we still have no products, render empty state instead of hiding
  if (!products || products.length === 0) {
    return (
      <div className="w-full py-16 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <section className={`w-full ${featured ? 'py-16 bg-gray-50 rounded-3xl' : 'py-8'}`}>
      <div className={`${featured ? 'px-6 md:px-12' : ''}`}>
        
        {/* Header */}
        {(title || subtitle) && (
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              {title && <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{title}</h2>}
              {subtitle && <p className="text-gray-500 mt-2">{subtitle}</p>}
            </div>
            
            {viewAllLink && (
              <Link 
                href={viewAllLink}
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#2563EB] hover:text-[#1E40AF] transition-colors group bg-white/50 px-4 py-2 rounded-full hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200"
              >
                Explore All
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

      </div>
    </section>
  );
}
