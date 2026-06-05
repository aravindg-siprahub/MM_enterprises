'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, FreeMode } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/free-mode'
import ProductCard, { Product } from '../ProductCard'
import { ArrowRight, ArrowLeft } from 'lucide-react'
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] tracking-tight">{title}</h2>
          {subtitle && <p className="text-gray-500 mt-2 text-sm font-medium">{subtitle}</p>}
        </div>
        
        {viewAllLink && (
          <Link 
            href={viewAllLink}
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#0066cc] hover:text-[#0055aa] transition-colors group px-3 py-1.5 rounded-full bg-[#0066cc]/5 hover:bg-[#0066cc]/10"
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
        <button className="swiper-button-prev-product absolute -left-2 sm:-left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-11 sm:h-11 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center text-[#1d1d1f] shadow-md border border-gray-100 opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-white hover:scale-105 disabled:opacity-0 cursor-pointer">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <button className="swiper-button-next-product absolute -right-2 sm:-right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-11 sm:h-11 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center text-[#1d1d1f] shadow-md border border-gray-100 opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-white hover:scale-105 disabled:opacity-0 cursor-pointer">
          <ArrowRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>
  )
}
