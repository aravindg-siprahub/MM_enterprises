'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Navigation, Thumbs } from 'swiper/modules'
import { getImageUrl } from '@/lib/imageUtils'

import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'

interface ImageGalleryProps {
  images: any[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null)
  const [isZoomed, setIsZoomed] = useState(false)
  
  const displayImages = images?.length 
    ? images.map(img => ({ ...img, image_url: getImageUrl(img.image_url, 'products') })) 
    : [{ image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800' }]

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Image */}
      <div 
        className="w-full relative bg-slate-50 rounded-3xl overflow-hidden aspect-square border border-slate-100 cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <Swiper
          spaceBetween={10}
          navigation={true}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          modules={[FreeMode, Navigation, Thumbs]}
          className="h-full w-full"
        >
          {displayImages.map((img, index) => (
            <SwiperSlide key={index} className="flex items-center justify-center p-8">
              <motion.div
                animate={{ scale: isZoomed ? 1.5 : 1 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full relative"
              >
                <Image
                  src={img.image_url}
                  alt={img.alt_text || 'Product image'}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain mix-blend-multiply"
                  priority={index === 0}
                />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="h-24 w-full">
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={12}
            slidesPerView={4}
            freeMode={true}
            watchSlidesProgress={true}
            modules={[FreeMode, Navigation, Thumbs]}
            className="h-full w-full thumbnails-slider"
          >
            {displayImages.map((img, index) => (
              <SwiperSlide key={index} className="cursor-pointer rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 opacity-60 hover:opacity-100 transition-opacity p-2">
                <div className="w-full h-full relative">
                  <Image
                    src={img.image_url}
                    alt={'Thumbnail'}
                    fill
                    sizes="100px"
                    className="object-contain mix-blend-multiply"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .thumbnails-slider .swiper-slide-thumb-active {
          opacity: 1;
          border-color: #2563EB;
          border-width: 2px;
        }
      `}} />
    </div>
  )
}
