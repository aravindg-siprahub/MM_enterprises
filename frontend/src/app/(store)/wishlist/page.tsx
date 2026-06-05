'use client';

import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { HeartCrack } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WishlistPage() {
  const { items } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="bg-red-50 p-6 rounded-full mb-6 text-red-400">
          <HeartCrack className="w-16 h-16" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Your Wishlist is empty</h1>
        <p className="text-gray-500 mb-8 max-w-md">
          You haven't saved any products yet. Browse our store and tap the heart icon to save items you love.
        </p>
        <Link 
          href="/"
          className="bg-[#1d1d1f] text-white px-8 py-3 rounded-full font-medium hover:bg-black transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1600px]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          My Wishlist <span className="text-gray-400 text-xl font-normal">({items.length})</span>
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        {items.map((item, idx) => (
          <ProductCard 
            key={item.id} 
            index={idx}
            product={{
              id: item.id,
              name: item.name,
              slug: item.slug,
              selling_price: item.selling_price,
              original_price: item.original_price,
              images: [item.image_url],
              discount_percent: item.discount_percent || 0
            }} 
          />
        ))}
      </div>
    </div>
  );
}
