'use client'

import React, { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react'
import { getImageUrl } from '@/lib/imageUtils'
import { useWishlist } from '@/context/WishlistContext'

export interface Product {
  id: string;
  title?: string;
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  selling_price?: number;
  original_price?: number;
  images?: string[] | any[];
  product_images?: any[];
  is_featured?: boolean;
  rating?: number;
  reviews_count?: number;
  discount_percentage?: number;
  discount_percent?: number;
  deals?: any[];
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop';

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { toggleWishlist, isWishlisted } = useWishlist();

  const handleImgError = useCallback(() => setImgError(true), []);

  const displayTitle = product.title || product.name || 'Unknown Product';
  const activeDeal = product.deals?.find((d: any) => d.is_active !== false);
  const displayPrice = activeDeal?.deal_price || product.price || product.selling_price || 0;
  const displayOriginalPrice = product.original_price || 0;
  
  // Extract images correctly whether they are strings or objects, from `images` or `product_images`
  let extractedImages: string[] = [];
  const rawImages = product.images || product.product_images || [];
  if (rawImages.length > 0) {
    extractedImages = rawImages.map((img: any) => typeof img === 'string' ? img : img.image_url).filter(Boolean);
  }
  
  const displayImages = extractedImages.length > 0 ? extractedImages.map(img => getImageUrl(img, 'products')) : [FALLBACK_IMAGE];
  // Use the primary image only; fallback to FALLBACK_IMAGE if it errors
  const primaryImage = imgError ? FALLBACK_IMAGE : (displayImages[0] || FALLBACK_IMAGE);
  
  const rating = product.rating || 4.5;
  const reviews = product.reviews_count || 124;
  
  const discount = activeDeal 
    ? (displayOriginalPrice > 0 ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100) : 0)
    : (product.discount_percentage || product.discount_percent || (displayOriginalPrice > 0 ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100) : 0));

  const wishlisted = isWishlisted(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist({
      id: product.id,
      name: displayTitle,
      slug: product.slug || product.id,
      selling_price: displayPrice,
      original_price: displayOriginalPrice,
      image_url: primaryImage,
      discount_percent: discount
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white border border-slate-100 rounded-3xl overflow-hidden flex flex-col h-full relative p-3 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Badges */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
        {product.is_featured && (
          <span className="bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider backdrop-blur-md pointer-events-auto">
            Featured
          </span>
        )}
        {discount > 0 && (
          <span className="bg-destructive/90 text-destructive-foreground text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-md pointer-events-auto">
            {discount}% OFF
          </span>
        )}
      </div>

      {/* Quick Actions (Slide in on hover) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {isHovered && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="p-2 bg-background/80 hover:bg-background backdrop-blur-md rounded-full shadow-sm text-muted-foreground hover:text-primary transition-colors hidden sm:block pointer-events-auto"
            >
              <Eye className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>



      {/* Image Area */}
      <Link href={`/products/${product.slug || product.id}`} className="relative h-[220px] sm:h-[260px] w-full rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden mb-4 group-hover:bg-slate-100 transition-colors">
        <motion.div 
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.4 }}
          className="relative w-full h-full p-1"
        >
          <Image
            src={primaryImage}
            alt={displayTitle}
            fill
            priority={index < 4}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain mix-blend-multiply transition-opacity duration-500"
            onError={handleImgError}
            unoptimized={primaryImage.includes('supabase.co')}
          />
        </motion.div>
      </Link>

      {/* Content */}
      <div className="px-2 pb-2 flex flex-col flex-grow">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-semibold">{rating}</span>
          <span className="text-xs text-muted-foreground">({reviews})</span>
        </div>

        {/* Title */}
        <Link href={`/products/${product.slug || product.id}`} className="mb-1">
          <h3 className="font-semibold text-sm sm:text-base line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {displayTitle}
          </h3>
        </Link>
        
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl tracking-tight font-extrabold text-slate-900">
              ₹{displayPrice.toLocaleString('en-IN')}
            </span>
            {displayOriginalPrice > displayPrice && (
              <span className="text-[11px] text-muted-foreground line-through">
                ₹{displayOriginalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWishlistClick}
              className={`p-2.5 rounded-full transition-colors border shadow-sm ${wishlisted ? 'bg-red-50 border-red-100 text-red-500' : 'bg-white border-slate-100 text-slate-400 hover:text-red-500 hover:bg-slate-50'}`}
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500' : ''}`} />
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground p-2.5 rounded-full transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
