"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, PackageSearch, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/config";

// Quick debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function SmartSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch results when debounced query changes
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
        setResults([]);
        setError(null);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/products?search=${encodeURIComponent(debouncedQuery)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.data || []);
        } else {
          setError("Failed to fetch products.");
        }
      } catch (err) {
        setError("Cannot connect to server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      setIsFocused(false);
      router.push(`/catalog?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const showDropdown = isFocused && query.length >= 2;

  return (
    <div className="relative flex-1 group" ref={dropdownRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
      <input
        type="text"
        placeholder="Search products..."
        className="w-full bg-secondary/50 hover:bg-secondary focus:bg-background border border-transparent focus:border-border rounded-full py-2 pl-10 pr-4 text-sm transition-all outline-none"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onKeyDown={handleKeyDown}
      />
      {isLoading && query.length >= 2 && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
      )}

      {/* Dropdown UI */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/80 backdrop-blur-xl border border-border shadow-xl rounded-2xl overflow-hidden z-50">
          {isLoading && results.length === 0 ? (
            <div className="p-4 flex items-center justify-center text-muted-foreground text-sm">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Searching catalog...
            </div>
          ) : error ? (
            <div className="p-4 flex items-center justify-center text-red-500 text-sm font-medium">
              {error}
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsFocused(false);
                    router.push(`/products/${product.slug}`);
                  }}
                  className="flex items-center gap-3 p-3 hover:bg-black/5 transition-colors"
                >
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0].image_url}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded-md bg-secondary"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-secondary rounded-md" />
                  )}
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-sm font-semibold truncate text-foreground">{product.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{product.category?.name}</p>
                  </div>
                  <div className="text-sm font-bold text-primary">
                    ₹{product.selling_price.toLocaleString()}
                  </div>
                </Link>
              ))}
              <div 
                className="p-3 bg-secondary/30 text-center border-t border-border/50 text-sm font-medium text-primary cursor-pointer hover:bg-secondary/50 transition-colors flex items-center justify-center gap-1"
                onClick={() => {
                  setIsFocused(false);
                  router.push(`/catalog?search=${encodeURIComponent(query.trim())}`);
                }}
              >
                View all results <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ) : (
            /* Attractive Empty State */
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <PackageSearch className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-1">No exact matches found</h4>
              <p className="text-sm text-muted-foreground max-w-[200px] leading-relaxed">
                Our stock updates daily. We might restock this soon!
              </p>
              <button 
                onClick={() => {
                  setIsFocused(false);
                  router.push(`/catalog`);
                }}
                className="mt-4 text-xs font-medium bg-secondary text-foreground px-4 py-2 rounded-full hover:bg-secondary/80 transition-colors"
              >
                Browse Full Catalog
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
