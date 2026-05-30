'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/imageUtils'

export default function HeroBannerSlider({ banners }: { banners: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll logic
  useEffect(() => {
    if (!banners || banners.length <= 1) return
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { clientWidth, scrollLeft, scrollWidth } = scrollRef.current
        const maxScroll = scrollWidth - clientWidth
        // If we reached the end, snap back to start. Otherwise scroll one card width.
        if (scrollLeft >= maxScroll - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          scrollRef.current.scrollTo({
            left: scrollLeft + clientWidth * 0.8,
            behavior: 'smooth'
          })
        }
      }
    }, 4000) // Scroll every 4 seconds
    return () => clearInterval(interval)
  }, [banners])
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth, scrollLeft } = scrollRef.current
      const scrollAmount = clientWidth * 0.8 // Scroll 80% of the visible width
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (!banners?.length) return null

  return (
    <div className="relative w-full bg-[#f1f3f6] group py-2 sm:py-3 px-2 sm:px-4 max-w-[1600px] mx-auto">
      
      {/* Slides Container */}
      <div 
        ref={scrollRef}
        className="flex gap-2 sm:gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
        style={{ height: 'clamp(140px, 25vw, 280px)' }}
      >
        {banners.map((banner, i) => (
          <div 
            key={i} 
            className="relative h-full flex-shrink-0 snap-center sm:snap-start rounded-md overflow-hidden cursor-pointer
                       w-[90%] sm:w-[calc(50%-6px)] lg:w-[calc(33.333%-8px)] shadow-sm bg-white"
          >
            <Link href={banner.cta_link || '#'}>
              <Image
                src={getImageUrl(banner.image_url, 'banners')}
                alt={banner.title || 'Banner'}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
                priority={i < 3}
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 33vw"
              />
            </Link>
          </div>
        ))}
      </div>

      {/* Prev/Next arrows - Flipkart style (visible on hover) */}
      {banners.length > 1 && (
        <>
          <button onClick={(e) => { e.preventDefault(); scroll('left'); }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2
                             bg-white/95 hover:bg-white rounded-r-md
                             w-8 h-12 sm:w-10 sm:h-20 flex items-center justify-center
                             shadow-[2px_0_8px_rgba(0,0,0,0.15)] text-gray-800 text-2xl font-light
                             opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-gray-100">
            ‹
          </button>
          <button onClick={(e) => { e.preventDefault(); scroll('right'); }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2
                             bg-white/95 hover:bg-white rounded-l-md
                             w-8 h-12 sm:w-10 sm:h-20 flex items-center justify-center
                             shadow-[-2px_0_8px_rgba(0,0,0,0.15)] text-gray-800 text-2xl font-light
                             opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-gray-100">
            ›
          </button>
        </>
      )}
    </div>
  )
}
