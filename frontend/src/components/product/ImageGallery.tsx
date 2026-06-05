'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { getImageUrl } from '@/lib/imageUtils'

interface ImageGalleryProps {
  images: any[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  
  const displayImages = images?.length 
    ? images.map(img => ({ ...img, image_url: getImageUrl(img.image_url, 'products') })) 
    : [{ image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800' }]

  const handleDragEnd = (e: any, info: any) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      setSelectedIndex((prev) => (prev + 1) % displayImages.length);
    } else if (info.offset.x > threshold) {
      setSelectedIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    }
  };

  // No mouse move handler needed for lightbox

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Image */}
      <div 
        className="w-full relative bg-white rounded-3xl sm:rounded-[2rem] overflow-hidden aspect-square cursor-zoom-in shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-shadow group"
        onClick={() => setIsLightboxOpen(true)}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            drag={displayImages.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 w-full h-full touch-pan-y"
            style={{ touchAction: "pan-y" }}
          >
            <div 
              className="w-full h-full relative overflow-hidden rounded-3xl sm:rounded-[2rem]"
            >
              <motion.div
                className="w-full h-full relative"
              >
                <Image
                  src={displayImages[selectedIndex].image_url}
                  alt={displayImages[selectedIndex].alt_text || 'Product image'}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain pointer-events-none p-6 sm:p-10"
                  priority
                  unoptimized={displayImages[selectedIndex].image_url.includes('supabase.co')}
                />
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 pt-2 scrollbar-hide w-full px-2">
          {displayImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white transition-all snap-center cursor-pointer
                ${selectedIndex === index 
                  ? 'border border-gray-300 shadow-sm opacity-100 scale-[1.02]' 
                  : 'border border-transparent opacity-50 hover:opacity-100 hover:shadow-sm hover:scale-[1.01]'
                }`}
            >
              <Image
                src={img.image_url}
                alt={img.alt_text || 'Thumbnail'}
                fill
                sizes="96px"
                className="object-contain p-2"
                unoptimized={img.image_url.includes('supabase.co')}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 sm:p-8" 
            onClick={() => setIsLightboxOpen(false)}
          >
            <button 
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 p-3 rounded-full backdrop-blur-md transition-all z-[110]" 
              onClick={() => setIsLightboxOpen(false)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full h-full max-w-5xl max-h-[85vh]" 
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={displayImages[selectedIndex].image_url}
                alt={displayImages[selectedIndex].alt_text || 'Product image zoomed'}
                fill
                className="object-contain"
                unoptimized={displayImages[selectedIndex].image_url.includes('supabase.co')}
                priority
              />
              
              {displayImages.length > 1 && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length) }}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-3 sm:p-4 rounded-full backdrop-blur-md transition-all"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedIndex((prev) => (prev + 1) % displayImages.length) }}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-3 sm:p-4 rounded-full backdrop-blur-md transition-all"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                </>
              )}
            </motion.div>
            
            {/* Lightbox Thumbnails */}
            {displayImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 overflow-x-auto max-w-full px-4 scrollbar-hide">
                {displayImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); setSelectedIndex(index) }}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden bg-white transition-all ${
                      selectedIndex === index ? 'ring-2 ring-white scale-110 opacity-100' : 'opacity-40 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img.image_url}
                      alt={img.alt_text || 'Thumbnail'}
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                      unoptimized={img.image_url.includes('supabase.co')}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  )
}
