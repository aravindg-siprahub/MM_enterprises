'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, FreeMode } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/free-mode'
import ProductCard, { Product } from '../ProductCard'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface ProductSliderProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
}

export default function ProductSlider({ title, subtitle, products, viewAllLink }: ProductSliderProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className="w-full py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{title}</h2>
          {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
        </div>
        
        {viewAllLink && (
          <Link 
            href={viewAllLink}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#2563EB] hover:text-[#1E40AF] transition-colors group"
          >
            View All 
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      <div className="relative group/slider">
        <Swiper
          modules={[Navigation, FreeMode]}
          spaceBetween={16}
          slidesPerView={1.2}
          freeMode={true}
          navigation={{
            nextEl: '.swiper-button-next-product',
            prevEl: '.swiper-button-prev-product',
          }}
          breakpoints={{
            480: { slidesPerView: 2.2, spaceBetween: 16 },
            768: { slidesPerView: 3.2, spaceBetween: 20 },
            1024: { slidesPerView: 4.2, spaceBetween: 24 },
            1280: { slidesPerView: 5.2, spaceBetween: 24 },
          }}
          className="w-full pb-4"
        >
          {products.map((product, index) => (
            <SwiperSlide key={product.id || index} className="h-auto">
              <ProductCard product={product} index={index} />
            </SwiperSlide>
          ))}
        </Swiper>
        
        {/* Navigation buttons */}
        <button className="swiper-button-prev-product absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center text-gray-800 shadow-lg border border-gray-100 opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-gray-50 disabled:opacity-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button className="swiper-button-next-product absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center text-gray-800 shadow-lg border border-gray-100 opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-gray-50 disabled:opacity-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  )
}
