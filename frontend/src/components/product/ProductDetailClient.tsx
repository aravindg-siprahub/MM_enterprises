'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Zap, Star, ShieldCheck, Truck, RotateCcw, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import ProductCard from './ProductCard';

interface Props {
  product: any;
  similar: any[];
}

export default function ProductDetailClient({ product, similar }: Props) {
  const images: any[] = (product.product_images ?? product.images ?? [])
    .slice()
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const primaryIdx = images.findIndex((img: any) => img.is_primary);
  const [activeIdx, setActiveIdx] = useState(primaryIdx >= 0 ? primaryIdx : 0);

  const currentImage = images[activeIdx]?.image_url ?? null;

  const prevImage = () => setActiveIdx((i) => (i - 1 + images.length) % images.length);
  const nextImage = () => setActiveIdx((i) => (i + 1) % images.length);

  const sellingPrice = product.selling_price ?? 0;
  const originalPrice = product.original_price ?? 0;
  const discountPercent = product.discount_percent ?? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
  const tags: string[] = Array.isArray(product.tags)
    ? product.tags
    : typeof product.tags === 'string'
    ? product.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
    : [];

  const category = product.categories ?? product.category ?? {};
  const brand = product.brands ?? product.brand ?? {};

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      {/* Breadcrumb */}
      <div className="max-w-[1450px] mx-auto px-3 sm:px-6 pt-3 pb-1">
        <nav className="text-xs text-[#878787] flex items-center gap-1 flex-wrap">
          <Link href="/" className="hover:text-[#2874f0]">Home</Link>
          <span>/</span>
          {category.slug && (
            <>
              <Link href={`/${category.slug}`} className="hover:text-[#2874f0] capitalize">{category.name}</Link>
              <span>/</span>
            </>
          )}
          {brand.name && (
            <>
              <span className="hover:text-[#2874f0] cursor-pointer">{brand.name}</span>
              <span>/</span>
            </>
          )}
          <span className="text-[#212121] truncate max-w-[160px] sm:max-w-sm">{product.name}</span>
        </nav>
      </div>

      {/* Main Card */}
      <div className="max-w-[1450px] mx-auto px-3 sm:px-6 pb-24 sm:pb-10">
        <div className="bg-white shadow-sm border border-gray-100 flex flex-col md:flex-row">

          {/* ─── LEFT: Image Gallery ─── */}
          <div className="w-full md:w-[42%] p-4 md:p-6 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col items-center">
            {/* Main Image */}
            <div className="relative w-full max-w-[420px] h-[320px] sm:h-[420px] md:h-[500px] bg-white flex items-center justify-center group mb-4">
              {currentImage ? (
                <Image
                  src={currentImage}
                  alt={product.name}
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width:768px) 100vw, 42vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400 text-sm">No Image</div>
              )}

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white border border-gray-200 shadow-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-gray-50"
                  >
                    <ChevronLeft size={18} className="text-gray-600" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white border border-gray-200 shadow-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-gray-50"
                  >
                    <ChevronRight size={18} className="text-gray-600" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Row */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 max-w-full">
              {images.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 border-2 rounded-sm p-0.5 transition-all ${
                    activeIdx === idx ? 'border-[#2874f0]' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <Image
                    src={img.image_url}
                    alt={img.alt_text || `Image ${idx + 1}`}
                    fill
                    className="object-contain"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>

            {/* Desktop CTA buttons */}
            <div className="hidden md:flex gap-3 mt-6 w-full max-w-[380px]">
              <button className="flex-1 bg-[#ff9f00] hover:bg-[#f09000] active:bg-[#e08500] text-white font-bold h-14 rounded-sm flex items-center justify-center gap-2 uppercase text-sm tracking-wide shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-colors">
                <ShoppingCart size={20} /> Add to Cart
              </button>
              <button className="flex-1 bg-[#fb641b] hover:bg-[#f05c15] active:bg-[#e5541a] text-white font-bold h-14 rounded-sm flex items-center justify-center gap-2 uppercase text-sm tracking-wide shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-colors">
                <Zap size={20} fill="currentColor" /> Buy Now
              </button>
            </div>
          </div>

          {/* ─── RIGHT: Product Details ─── */}
          <div className="w-full md:w-[58%] p-4 md:p-8 flex flex-col overflow-y-auto">
            {/* Brand */}
            {brand.name && (
              <p className="text-sm text-[#2874f0] font-medium mb-1">{brand.name}</p>
            )}

            {/* Product Title */}
            <h1 className="text-lg sm:text-xl md:text-2xl text-[#212121] font-medium leading-snug mb-3">
              {product.name}
            </h1>

            {/* Rating Row */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="bg-[#388e3c] text-white text-xs px-2 py-0.5 rounded-sm flex items-center gap-1 font-bold">
                {product.rating ?? '4.3'} <Star size={11} fill="currentColor" />
              </span>
              <span className="text-[#878787] text-sm font-medium">
                {(product.review_count ?? 128).toLocaleString('en-IN')} Ratings &amp; Reviews
              </span>
            </div>

            {/* Pricing */}
            <div className="my-1 flex items-end gap-3 flex-wrap">
              <span className="text-3xl font-medium text-[#212121] leading-none">
                ₹{sellingPrice.toLocaleString('en-IN')}
              </span>
              {originalPrice > sellingPrice && (
                <>
                  <span className="text-base text-[#878787] line-through mb-0.5">
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-base text-[#388e3c] font-medium mb-0.5">
                    {discountPercent}% off
                  </span>
                </>
              )}
            </div>

            {/* EMI info */}
            <p className="text-sm text-[#878787] mt-1 mb-5">
              EMI from ₹{Math.round(sellingPrice / 12).toLocaleString('en-IN')}/month
            </p>

            {/* Delivery & Warranty Badges */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 mb-6 border-t border-b border-gray-100 py-5">
              <div className="flex items-start gap-2">
                <Truck size={20} className="text-[#2874f0] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#212121]">Free Delivery</p>
                  <p className="text-xs text-[#878787]">By Tomorrow</p>
                </div>
              </div>
              {product.warranty_info && (
                <div className="flex items-start gap-2">
                  <ShieldCheck size={20} className="text-[#2874f0] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#212121]">{product.warranty_info}</p>
                    <p className="text-xs text-[#878787]">Know More</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2">
                <RotateCcw size={20} className="text-[#2874f0] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#212121]">7 Days Replacement</p>
                  <p className="text-xs text-[#878787]">Know More</p>
                </div>
              </div>
            </div>

            {/* Highlights */}
            {tags.length > 0 && (
              <div className="mb-6">
                <h2 className="text-base font-medium text-[#212121] mb-3">Highlights</h2>
                <ul className="space-y-2">
                  {tags.map((tag, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-[#212121]">
                      <Check size={15} className="text-[#388e3c] flex-shrink-0 mt-0.5" />
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Seller Info */}
            <div className="mb-6 border-t border-b border-gray-100 py-5">
              <div className="flex items-start gap-2">
                <p className="text-sm text-[#878787] w-28 flex-shrink-0">Sold by</p>
                <p className="text-sm text-[#2874f0] font-medium">MM Enterprises</p>
              </div>
              <div className="flex items-start gap-2 mt-2">
                <p className="text-sm text-[#878787] w-28 flex-shrink-0">Service</p>
                <p className="text-sm text-[#212121]">6 Month Warranty | Free Installation Available</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-base font-medium text-[#212121] mb-3">Description</h2>
              <p className="text-sm text-[#212121] leading-relaxed whitespace-pre-line">
                {product.description || 'No description available for this product.'}
              </p>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similar.length > 0 && (
          <div className="mt-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="text-base font-bold text-[#212121]">Similar Products</h2>
              <span className="text-[#2874f0] text-xs font-bold flex items-center gap-1 cursor-pointer">
                VIEW ALL <ChevronRight size={14} />
              </span>
            </div>
            <div className="flex overflow-x-auto scrollbar-hide gap-0">
              {similar.map((p: any) => (
                <div key={p.id} className="min-w-[160px] sm:min-w-[190px] border-r border-gray-100 last:border-r-0">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 flex z-50 shadow-lg md:hidden">
        <button className="flex-1 bg-[#ff9f00] text-white font-bold h-14 flex items-center justify-center gap-2 uppercase text-sm tracking-wide">
          <ShoppingCart size={20} /> Add to Cart
        </button>
        <button className="flex-1 bg-[#fb641b] text-white font-bold h-14 flex items-center justify-center gap-2 uppercase text-sm tracking-wide">
          <Zap size={20} fill="currentColor" /> Buy Now
        </button>
      </div>
    </div>
  );
}
