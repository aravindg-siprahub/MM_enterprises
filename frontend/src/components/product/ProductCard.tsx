'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { getImageUrl } from '@/lib/imageUtils'
import { useWishlist } from '@/context/WishlistContext'

export default function ProductCard({ product }: { product: any }) {
  const router = useRouter()
  const [imgError, setImgError] = useState(false)
  const { toggleWishlist, isWishlisted } = useWishlist()

  const imagesArray = product.product_images || product.images || []
  let primaryImage = imagesArray.find(
    (img: any) => img.is_primary
  )?.image_url ?? imagesArray[0]?.image_url ?? null

  primaryImage = getImageUrl(primaryImage, 'products')

  const handleClick = () => {
    if (product?.slug) router.push(`/products/${product.slug}`)
  }

  const activeDeal = product.deals?.find((d: any) => d.is_active !== false)
  const sellingPrice = activeDeal ? Number(activeDeal.deal_price) : Number(product.selling_price) || 0
  const originalPrice = Number(product.original_price) || 0
  
  let discount = Number(product.discount_percent) || 0
  if (activeDeal && originalPrice > sellingPrice) {
    discount = Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)
  }

  const rating = Number(product.rating) || 0

  const wishlisted = isWishlisted(product.id)

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleWishlist({
      id: product.id,
      name: product.name,
      slug: product.slug,
      selling_price: sellingPrice,
      original_price: originalPrice,
      image_url: primaryImage || '',
      discount_percent: discount
    })
  }

  return (
    <div onClick={handleClick}
         className="bg-white rounded cursor-pointer group relative
                    border border-transparent hover:border-[#2874f0]/20
                    hover:shadow-xl transition-all duration-200
                    hover:-translate-y-0.5 overflow-hidden flex flex-col h-full">

      {/* Deal / Discount badges */}
      <div className="absolute top-1.5 left-1.5 z-10 flex flex-col gap-1 pointer-events-none">
        {activeDeal?.deal_type && (
          <div className="bg-[#ff9f00] text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded uppercase shadow-sm pointer-events-auto">
            {activeDeal.deal_type.replace(/_/g, ' ')}
          </div>
        )}
        {discount > 0 && !activeDeal?.deal_type && (
          <div className="bg-[#388e3c] text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm pointer-events-auto">
            {discount}% OFF
          </div>
        )}
      </div>

      {/* Image */}
      <div className="relative bg-white flex items-center justify-center
                      aspect-[4/3] p-2 sm:p-4 mb-2"
           style={{ position: 'relative' }}>
        {primaryImage && !imgError ? (
          <Image
            src={primaryImage}
            alt={product.name || 'Product'}
            fill
            className="object-contain p-2 hover:scale-105 transition-transform duration-300"
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 200px"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center
                          bg-gray-50">
            <span className="text-gray-300 text-xs text-center px-2 leading-tight">
              {product.name}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-2 pb-3 pt-1 flex flex-col flex-grow">
        <p className="text-[10px] sm:text-xs text-[#878787] truncate mb-0.5">
          {product.brands?.name}
        </p>
        <p className="text-xs sm:text-sm text-[#212121] font-medium 
                      line-clamp-2 leading-tight mb-1.5">
          {product.name}
        </p>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1 mb-1.5 mt-auto">
            <span className="bg-[#388e3c] text-white text-[9px] sm:text-[10px]
                             font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
              {rating} ★
            </span>
            {product.review_count > 0 && (
              <span className="text-[9px] sm:text-[10px] text-[#878787]">
                ({product.review_count?.toLocaleString('en-IN')})
              </span>
            )}
          </div>
        )}
        
        {/* Placeholder for spacing if no rating */}
        {rating <= 0 && <div className="mt-auto"></div>}

        {/* Price */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 mt-auto">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-bold text-[#212121]">
                ₹{sellingPrice.toLocaleString('en-IN')}
              </span>
              {originalPrice > sellingPrice && (
                <span className="text-[10px] sm:text-xs text-[#878787] line-through">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {discount > 0 && (
                <span className="text-[10px] sm:text-xs text-[#388e3c] font-medium">
                  {discount}% off
                </span>
              )}
            </div>
            
            <button onClick={handleWishlistClick}
                    className={`p-1.5 transition-colors rounded-full shadow-sm border border-slate-100
                               ${wishlisted ? 'bg-red-50 text-red-500' : 'bg-white text-gray-400 hover:bg-slate-50 hover:text-red-500'}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} 
                   stroke="currentColor" strokeWidth="2" className="transition-transform active:scale-90">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
