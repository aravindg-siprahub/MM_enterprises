'use client'
import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/imageUtils'

export default function MidBanner({ banner }: { banner: any }) {
  if (!banner) return null

  return (
    <div className="relative w-full overflow-hidden rounded-sm shadow-sm
                    cursor-pointer hover:opacity-95 transition-opacity"
         style={{ height: 'clamp(100px, 14vw, 200px)' }}>
      <Image
        src={getImageUrl(banner.image_url, 'banners')}
        alt={banner.title || 'Offer'}
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r 
                      from-black/65 via-black/20 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-center 
                      pl-6 sm:pl-12 pr-[45%]">
        <h3 className="text-white font-black leading-tight mb-1
                       text-base sm:text-2xl md:text-3xl drop-shadow-lg">
          {banner.title}
        </h3>
        {banner.subtitle && (
          <p className="text-white/80 text-xs sm:text-sm mb-3 hidden sm:block">
            {banner.subtitle}
          </p>
        )}
        {banner.cta_text && (
          <Link href={banner.cta_link || '#'}
                className="inline-block bg-white text-[#2874f0] font-bold
                           text-xs sm:text-sm px-3 sm:px-5 py-1.5 sm:py-2
                           rounded w-fit hover:bg-[#2874f0] hover:text-white
                           transition-all border border-[#2874f0]">
            {banner.cta_text}
          </Link>
        )}
      </div>
    </div>
  )
}
