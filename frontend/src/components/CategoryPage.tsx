"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Filter, X, SlidersHorizontal } from "lucide-react";
import ProductCard from "./product/ProductCard";

/* ─── Types ─────────────────────────────────────────────── */
interface Props {
  categorySlug: string;
  title?: string;
  bannerPlacement?: string;
  initialProducts?: any[];
  initialTotal?: number;
  initialBrands?: string[];
}

const PRICE_RANGES = [
  { label: "Under ₹15,000",      min: 0,     max: 15000  },
  { label: "₹15,000 – ₹30,000", min: 15000,  max: 30000  },
  { label: "₹30,000 – ₹50,000", min: 30000,  max: 50000  },
  { label: "Above ₹50,000",      min: 50000,  max: 999999 },
];

const DISCOUNT_OPTIONS = ["10% or more", "20% or more", "30% or more", "40% or more"];

const SORT_OPTIONS = [
  { key: "relevance", label: "Relevance" },
  { key: "price_asc", label: "Price ↑" },
  { key: "price_desc", label: "Price ↓" },
  { key: "discount", label: "Discount" },
  { key: "rating", label: "Rating" },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const PAGE_SIZE = 24;

/* ─── Skeleton card ─────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-sm overflow-hidden animate-pulse">
      <div className="h-40 sm:h-48 bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-4/5" />
        <div className="h-3 bg-gray-200 rounded w-3/5" />
        <div className="h-4 bg-gray-200 rounded w-2/5 mt-2" />
      </div>
    </div>
  );
}

/* ─── Filter Sidebar Content ─────────────────────────────── */
function FilterContent({
  brands,
  selectedBrands,
  toggleBrand,
  selectedPrices,
  togglePrice,
  selectedDiscounts,
  toggleDiscount,
  sortBy,
  setSortBy
}: {
  brands: string[];
  selectedBrands: string[];
  toggleBrand: (b: string) => void;
  selectedPrices: string[];
  togglePrice: (p: string) => void;
  selectedDiscounts: string[];
  toggleDiscount: (d: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
}) {
  return (
    <div className="space-y-0">
      {/* Sort By - Mobile Only */}
      <div className="border-b border-gray-100 pb-4 mb-0 p-4 lg:hidden">
        <h4 className="font-medium text-xs uppercase tracking-wider text-gray-500 mb-3">
          Sort By
        </h4>
        <div className="space-y-2.5">
          {SORT_OPTIONS.map((s) => (
            <label key={s.key} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="mobile_sort"
                checked={sortBy === s.key}
                onChange={() => setSortBy(s.key)}
                className="w-4 h-4 accent-[#2874f0] cursor-pointer"
              />
              <span className="text-sm text-[#212121] group-hover:text-[#2874f0]">
                {s.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="border-b border-gray-100 pb-4 mb-0 p-4">
        <h4 className="font-medium text-xs uppercase tracking-wider text-gray-500 mb-3">
          Price
        </h4>
        <div className="space-y-2.5">
          {PRICE_RANGES.map((r) => (
            <label key={r.label} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedPrices.includes(r.label)}
                onChange={() => togglePrice(r.label)}
                className="w-4 h-4 accent-[#2874f0] rounded cursor-pointer"
              />
              <span className="text-sm text-[#212121] group-hover:text-[#2874f0]">
                {r.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand */}
      {brands.length > 0 && (
        <div className="border-b border-gray-100 pb-4 p-4">
          <h4 className="font-medium text-xs uppercase tracking-wider text-gray-500 mb-3">
            Brand
          </h4>
          <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="w-4 h-4 accent-[#2874f0] rounded cursor-pointer"
                />
                <span className="text-sm text-[#212121] group-hover:text-[#2874f0]">
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Discount */}
      <div className="p-4">
        <h4 className="font-medium text-xs uppercase tracking-wider text-gray-500 mb-3">
          Discount
        </h4>
        <div className="space-y-2.5">
          {DISCOUNT_OPTIONS.map((d) => (
            <label key={d} className="flex items-center gap-2.5 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={selectedDiscounts.includes(d)}
                onChange={() => toggleDiscount(d)}
                className="w-4 h-4 accent-[#2874f0] rounded cursor-pointer" 
              />
              <span className="text-sm text-[#212121] group-hover:text-[#2874f0]">{d}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function CategoryPage({ categorySlug, title, initialProducts = [], initialTotal = 0, initialBrands = [] }: Props) {
  const [products, setProducts]           = useState<any[]>(initialProducts);
  const [brands, setBrands]               = useState<string[]>(initialBrands);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [sortBy, setSortBy]               = useState("relevance");
  const [page, setPage]                   = useState(1);
  const [total, setTotal]                 = useState(initialTotal);
  const [loading, setLoading]             = useState(initialProducts.length === 0);
  const [loadingMore, setLoadingMore]     = useState(false);
  const [hasMore, setHasMore]             = useState(initialProducts.length > 0 ? PAGE_SIZE < initialTotal : false);
  const [drawerOpen, setDrawerOpen]       = useState(false);
  
  const isInitialMount = useRef(true);

  const displayTitle = title || categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);

  /* ── Fetch brands once for this category ─────────────── */
  useEffect(() => {
    if (initialBrands.length > 0) return;
    fetch(`${API_BASE}/api/brands?category=${categorySlug}`)
      .then(res => res.json())
      .then(data => setBrands(data.map((b: any) => b.name)))
      .catch(console.error);
  }, [categorySlug, initialBrands]);

  /* ── Fetch products ────────────────────────────────────── */
  const fetchProducts = useCallback(
    async (pg: number, append: boolean) => {
      if (pg === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const params = new URLSearchParams({
          category: categorySlug,
          page: String(pg),
          limit: String(PAGE_SIZE),
          ...(sortBy !== "relevance" && { sort: sortBy }),
        });

        if (selectedBrands.length > 0) {
          params.append('brand', selectedBrands.join(','));
        }

        if (selectedPrices.length > 0) {
          const selectedRanges = PRICE_RANGES.filter(r => selectedPrices.includes(r.label));
          if (selectedRanges.length > 0) {
            const min_price = Math.min(...selectedRanges.map(r => r.min));
            const max_price = Math.max(...selectedRanges.map(r => r.max));
            params.append('min_price', String(min_price));
            params.append('max_price', String(max_price));
          }
        }

        if (selectedDiscounts.length > 0) {
          const min_discount = Math.min(...selectedDiscounts.map(d => parseInt(d)));
          params.append('min_discount', String(min_discount));
        }

        const res = await fetch(`${API_BASE}/api/products?${params}`);
        if (!res.ok) throw new Error("Failed");

        const data = await res.json();
        const list: any[] = Array.isArray(data) ? data : (data?.data ?? []);
        const serverTotal: number = data?.total ?? list.length;

        if (append) {
          setProducts((prev) => [...prev, ...list]);
        } else {
          setProducts(list);
        }

        setTotal(serverTotal);
        setHasMore(pg * PAGE_SIZE < serverTotal);
        setPage(pg);
      } catch {
        if (!append) setProducts([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [categorySlug, sortBy, selectedBrands, selectedPrices, selectedDiscounts]
  );

  /* Reset + refetch when filters/sort change */
  useEffect(() => {
    if (isInitialMount.current && initialProducts.length > 0) {
      isInitialMount.current = false;
      return;
    }
    fetchProducts(1, false);
  }, [fetchProducts, initialProducts]);

  /* ── Helpers ───────────────────────────────────────────── */
  const toggleBrand = (b: string) => {
    setSelectedBrands((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]
    );
  };

  const togglePrice = (p: string) => {
    setSelectedPrices((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const toggleDiscount = (d: string) => {
    setSelectedDiscounts((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const loadMore = () => fetchProducts(page + 1, true);

  const activeFilterCount = selectedBrands.length + selectedPrices.length + selectedDiscounts.length + (sortBy !== "relevance" ? 1 : 0);

  const clearAll = () => {
    setSelectedBrands([]);
    setSelectedPrices([]);
    setSelectedDiscounts([]);
    setSortBy("relevance");
  };

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="bg-[#f1f3f6] min-h-screen">
      <div className="max-w-[1450px] mx-auto px-3 sm:px-4 py-3 flex gap-3 items-start">

        {/* ── Desktop Sidebar ─────────────────────────────── */}
        <aside className="w-[260px] flex-shrink-0 hidden lg:block self-start sticky top-[112px]">
          <div className="bg-white rounded-sm shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
              <h3 className="font-bold text-base text-[#212121]">Filters</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAll}
                  className="text-sm text-[#2874f0] font-medium hover:underline"
                >
                  CLEAR ALL
                </button>
              )}
            </div>
            <FilterContent
              brands={brands}
              selectedBrands={selectedBrands}
              toggleBrand={toggleBrand}
              selectedPrices={selectedPrices}
              togglePrice={togglePrice}
              selectedDiscounts={selectedDiscounts}
              toggleDiscount={toggleDiscount}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </div>
        </aside>

        {/* ── Main Content ─────────────────────────────────── */}
        <main className="flex-1 min-w-0">

          {/* Mobile: Filter + Sort bar */}
          <div className="lg:hidden flex items-center justify-between bg-white px-3 py-2.5 rounded-sm shadow-sm mb-3">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#212121]">{displayTitle}</span>
              <span className="text-[11px] text-gray-500">{total.toLocaleString("en-IN")} products</span>
            </div>
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-1.5 bg-blue-50 text-[#2874f0] px-3 py-1.5 rounded-sm text-xs font-bold transition-colors hover:bg-blue-100"
            >
              <SlidersHorizontal size={14} />
              Filters & Sort
              {activeFilterCount > 0 && (
                <span className="bg-[#2874f0] text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Sort bar — desktop */}
          <div className="hidden lg:flex items-center justify-between bg-white shadow-sm mb-3 px-4 py-3 rounded-sm">
            <div>
              <h1 className="font-bold text-base text-[#212121] capitalize">{displayTitle}</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {loading ? "Loading…" : `${total.toLocaleString("en-IN")} products found`}
                {selectedBrands.length > 0 && ` · ${selectedBrands.join(", ")}`}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500 mr-2">Sort By</span>
              {SORT_OPTIONS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSortBy(s.key)}
                  className={`text-sm px-3 py-1.5 border-b-2 transition-colors font-medium ${
                    sortBy === s.key
                      ? "border-[#2874f0] text-[#2874f0]"
                      : "border-transparent text-[#212121] hover:text-[#2874f0]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {sortBy !== "relevance" && (
                <button
                  onClick={() => setSortBy("relevance")}
                  className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-[#2874f0] text-xs font-medium px-2.5 py-1 rounded-full shadow-sm hover:bg-blue-100 transition-colors"
                >
                  {SORT_OPTIONS.find((s) => s.key === sortBy)?.label} <X size={11} />
                </button>
              )}
              {selectedBrands.map((b) => (
                <button
                  key={b}
                  onClick={() => toggleBrand(b)}
                  className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-[#2874f0] text-xs font-medium px-2.5 py-1 rounded-full shadow-sm hover:bg-blue-100 transition-colors"
                >
                  {b} <X size={11} />
                </button>
              ))}
              {selectedPrices.map((p) => (
                <button
                  key={p}
                  onClick={() => togglePrice(p)}
                  className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-[#2874f0] text-xs font-medium px-2.5 py-1 rounded-full shadow-sm hover:bg-blue-100 transition-colors"
                >
                  {p} <X size={11} />
                </button>
              ))}
              {selectedDiscounts.map((d) => (
                <button
                  key={d}
                  onClick={() => toggleDiscount(d)}
                  className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-[#2874f0] text-xs font-medium px-2.5 py-1 rounded-full shadow-sm hover:bg-blue-100 transition-colors"
                >
                  {d} <X size={11} />
                </button>
              ))}
            </div>
          )}

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-sm shadow-sm p-16 text-center">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-gray-700 text-lg font-medium">No products found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting or clearing your filters</p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAll}
                  className="mt-6 border border-[#2874f0] text-[#2874f0] px-6 py-2 rounded-sm text-sm font-medium hover:bg-blue-50"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="bg-white border border-[#2874f0] text-[#2874f0] px-10 py-3 rounded-sm text-sm font-medium hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-[#2874f0] border-t-transparent rounded-full animate-spin" />
                        Loading…
                      </span>
                    ) : (
                      "Load More Products"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Mobile Drawer Overlay ─────────────────────────── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobile Drawer Panel ───────────────────────────── */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-[80vw] max-w-[320px] bg-white shadow-2xl transition-transform duration-300 lg:hidden overflow-y-auto flex flex-col ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[#2874f0]" />
            <h3 className="font-bold text-base text-[#212121]">Filters & Sort</h3>
            {activeFilterCount > 0 && (
              <span className="bg-[#2874f0] text-white text-[10px] rounded-full px-2 py-0.5 font-bold">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="text-gray-500 hover:text-black p-1"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1">
          <FilterContent
            brands={brands}
            selectedBrands={selectedBrands}
            toggleBrand={toggleBrand}
            selectedPrices={selectedPrices}
            togglePrice={togglePrice}
            selectedDiscounts={selectedDiscounts}
            toggleDiscount={toggleDiscount}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </div>

        <div className="sticky bottom-0 border-t border-gray-200 p-3 bg-white flex gap-3">
          <button
            onClick={clearAll}
            className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-sm text-sm hover:bg-gray-50"
          >
            Clear All
          </button>
          <button
            onClick={() => setDrawerOpen(false)}
            className="flex-1 bg-[#2874f0] text-white font-bold py-2.5 rounded-sm text-sm hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
