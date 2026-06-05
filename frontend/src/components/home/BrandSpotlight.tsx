'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { getImageUrl } from '@/lib/imageUtils'

export default function BrandSpotlight({ brands }: { brands: any[] }) {
  const router = useRouter()
  if (!brands?.length) return null

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden w-full py-8 px-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Top Brands
          </h2>
          <p className="text-gray-500 mt-1">Discover products from your favorite manufacturers</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 sm:gap-6">
        {brands.map((brand, index) => (
          <motion.button 
            key={brand.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            onClick={() => router.push(`/catalog?brand=${brand.slug}`)}
            className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#2563EB]/30 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
          >
            <div className="w-16 h-12 sm:w-20 sm:h-14 flex items-center justify-center mb-3 relative">
              {brand.logo_url ? (
                <Image
                  src={getImageUrl(brand.logo_url, 'brands')}
                  alt={brand.name}
                  fill
                  className="object-contain mix-blend-multiply transition-all duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 64px, 80px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center rounded-lg bg-white border border-gray-100 group-hover:border-[#2563EB]/20 transition-colors">
                  <span className="text-[10px] sm:text-xs font-bold text-gray-400 group-hover:text-[#2563EB] text-center leading-tight transition-colors">
                    {brand.name.substring(0, 10)}
                  </span>
                </div>
              )}
            </div>
            
            <span className="text-xs text-gray-600 text-center font-medium leading-tight group-hover:text-[#2563EB] transition-colors">
              {brand.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
