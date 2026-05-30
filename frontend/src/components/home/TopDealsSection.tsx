'use client'
import { useState } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/product/ProductCard'

interface Props {
  products: any[]
  title: string
  viewAllLink: string
  emoji?: string
  bgImage?: string
  bgColor?: string
}

export default function TopDealsSection({ 
  products, title, viewAllLink, emoji = '🔥', bgImage, bgColor
}: Props) {
  const brands = ['All', ...new Set(
    products.map(p => p.brands?.name).filter(Boolean)
  )] as string[]
  
  const [activeBrand, setActiveBrand] = useState('All')
  
  const filtered = activeBrand === 'All'
    ? products
    : products.filter(p => p.brands?.name === activeBrand)

  if (!products?.length) return null

  return (
    <div 
      className={`rounded-sm overflow-hidden relative flex flex-col md:flex-row ${!bgImage && !bgColor ? 'bg-white shadow-sm' : ''}`}
      style={{ backgroundColor: bgColor }}
    >
      {/* Background Image Layer */}
      {bgImage && (
        <div 
          className="absolute inset-0 z-0 opacity-20 pointer-events-none"
          style={{ 
            backgroundImage: `url(${bgImage})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'bottom' 
          }}
        />
      )}

      {/* Header sidebar (Desktop) or top bar (Mobile) when styled */}
      {(bgImage || bgColor) ? (
        <div className="relative z-10 w-full md:w-56 lg:w-64 flex-shrink-0 flex flex-col items-center justify-end md:justify-end pb-4 md:pb-8 pt-6 md:pt-0">
          <h2 className="text-2xl md:text-3xl font-black text-black text-center leading-tight mb-4 px-4 drop-shadow-md">
            {title}
          </h2>
          <Link href={viewAllLink}
                className="bg-[#2874f0] text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-sm shadow hover:bg-blue-600 transition-colors">
            VIEW ALL
          </Link>
        </div>
      ) : (
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-gray-100 w-full z-10 bg-white">
          <h2 className="text-base sm:text-xl font-black text-[#212121] flex items-center gap-2">
            {emoji && <span>{emoji}</span>}
            <span>{title}</span>
          </h2>
          <Link href={viewAllLink}
                className="bg-[#2874f0] text-white text-[10px] sm:text-xs font-medium px-3 py-1.5 rounded-sm shadow hover:bg-blue-600 transition-colors">
            VIEW ALL
          </Link>
        </div>
      )}

      {/* Product grid area */}
      <div className="relative z-10 flex-1 bg-white md:bg-transparent">

      {/* Brand filter pills */}
      {brands.length > 2 && (
        <div className="flex gap-2 px-3 sm:px-4 py-2.5 
                        overflow-x-auto scrollbar-hide border-b border-gray-50 bg-white md:bg-transparent">
          {brands.map(brand => (
            <button key={brand}
                    onClick={() => setActiveBrand(brand)}
                    className={`flex-shrink-0 text-xs font-medium px-3 py-1.5
                                rounded-full border transition-all ${
                      activeBrand === brand
                        ? 'bg-[#2874f0] text-white border-[#2874f0]'
                        : 'bg-white text-[#212121] border-gray-200 hover:border-[#2874f0] hover:text-[#2874f0]'
                    }`}>
              {brand}
            </button>
          ))}
        </div>
      )}

      {/* Product grid */}
      <div className={`p-2 sm:p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 ${bgImage || bgColor ? 'h-full items-center' : ''}`}>
        {filtered.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      </div>
    </div>
  )
}
