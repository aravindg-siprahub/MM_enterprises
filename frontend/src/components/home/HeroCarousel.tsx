'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { getImageUrl } from '@/lib/imageUtils'

// Dummy fallback banners if none provided
const fallbackBanners = [
  {
    id: 1,
    image_url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cd561?q=80&w=1920&auto=format&fit=crop',
    title: 'Premium Smartphones',
    subtitle: 'Experience the Next Generation of Mobile Tech',
    link: '/mobiles'
  },
  {
    id: 2,
    image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1920&auto=format&fit=crop',
    title: 'Smart Home Appliances',
    subtitle: 'Upgrade Your Kitchen with Modern Solutions',
    link: '/appliances'
  },
  {
    id: 3,
    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1920&auto=format&fit=crop',
    title: 'Luxury Furniture',
    subtitle: 'Transform Your Living Space Today',
    link: '/furniture'
  }
]

export default function HeroCarousel({ banners = fallbackBanners }: { banners?: any[] }) {
  const displayBanners = banners?.length > 0 ? banners : fallbackBanners;

  return (
    <div className="w-full relative h-[340px] sm:h-[400px] md:h-[500px] lg:h-[600px] group rounded-3xl overflow-hidden shadow-xl mb-4">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination, Navigation]}
        effect="fade"
        speed={1000}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          renderBullet: function (index, className) {
            return `<span class="${className} w-3 h-3 md:w-4 md:h-4 rounded-full bg-white/50 backdrop-blur-md mx-1 shadow-sm transition-all hover:bg-white"></span>`;
          },
        }}
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        className="w-full h-full"
        loop={true}
      >
        {displayBanners.map((banner, index) => (
          <SwiperSlide key={index} className="relative w-full h-full">
            {({ isActive }) => (
              <Link href={banner.cta_link || banner.link_url || banner.link || '#'} className="block relative w-full h-full cursor-pointer group/slide">
                <div className="absolute inset-0 bg-black/20 z-10 backdrop-blur-[1px]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
                <Image
                  src={getImageUrl(banner.image_url, 'banners')}
                  alt={banner.title || 'Banner'}
                  fill
                  sizes="100vw"
                  className="object-cover transition-transform duration-[10000ms] ease-linear scale-100 transform-gpu group-hover/slide:scale-105"
                  style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)' }}
                  priority={true}
                />
                
                <div className="absolute inset-0 z-20 flex flex-col justify-end pb-12 md:pb-20 px-5 md:px-12 max-w-[1600px] mx-auto">
                  <div className="max-w-2xl">
                    <motion.h2 
                      initial={{ y: 20, opacity: 0 }}
                      animate={isActive ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="text-[28px] sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2 leading-[1.1] drop-shadow-xl"
                    >
                      {banner.title}
                    </motion.h2>
                    
                    {banner.subtitle && (
                      <motion.p 
                        initial={{ y: 15, opacity: 0 }}
                        animate={isActive ? { y: 0, opacity: 1 } : { y: 15, opacity: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-sm md:text-lg text-white/90 font-medium mb-6 max-w-lg drop-shadow-md tracking-wide"
                      >
                        {banner.subtitle}
                      </motion.p>
                    )}
                    
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={isActive ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                    >
                      <span 
                        className="inline-flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 md:px-8 md:py-3.5 rounded-full font-bold text-sm md:text-base hover:scale-105 hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl"
                      >
                        Explore Deals <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                      </span>
                    </motion.div>
                  </div>
                </div>
              </Link>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
      
      {/* Custom Navigation */}
      <button className="swiper-button-prev-custom absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-14 md:h-14 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all border border-white/20">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <button className="swiper-button-next-custom absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-14 md:h-14 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all border border-white/20">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
      </button>

      {/* Internal CSS overrides for swiper pagination active color */}
      <style dangerouslySetInnerHTML={{__html: `
        .swiper-pagination-bullet-active {
          background-color: #ffffff !important;
          width: 24px !important;
          border-radius: 8px !important;
        }
      `}} />
    </div>
  )
}
