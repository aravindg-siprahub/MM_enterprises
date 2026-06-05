'use client';

import React, { useState } from 'react';
import { ShoppingCart, Heart, MessageCircle } from 'lucide-react';
import ShareButton from './ShareButton';
import ContactModal from './ContactModal';
import ChatModal from './ChatModal';

interface ProductActionsProps {
  productName: string;
}

export default function ProductActions({ productName }: ProductActionsProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Extract productId from URL or props (since it's not passed, we'd ideally pass it, but for now we'll pass a dummy or get it from page.tsx)
  // To avoid breaking changes, let's just use the product slug from URL as a temporary ID if not passed, but we should pass productId.
  // Wait, ProductActions doesn't have productId. Let's add it to the interface.


  return (
    <>
      {/* Desktop Actions */}
      <div className="hidden sm:flex flex-row items-center gap-3 mb-10">
        <button 
          onClick={() => window.location.href = '#chat'}
          className="flex-1 h-14 bg-gray-100/80 text-[#1d1d1f] hover:bg-gray-200 font-medium rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <MessageCircle className="w-5 h-5" />
          Chat With Seller
        </button>
        <button 
          onClick={() => setIsContactModalOpen(true)}
          className="flex-1 h-14 bg-[#1d1d1f] text-white hover:bg-black font-medium rounded-2xl transition-all shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 flex items-center justify-center cursor-pointer"
        >
          Buy Now
        </button>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={`w-14 h-14 rounded-2xl transition-all flex items-center justify-center cursor-pointer shadow-sm ${isWishlisted ? 'text-red-500 bg-red-50' : 'text-gray-500 bg-white hover:text-[#1d1d1f] hover:bg-gray-50'}`}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
          </button>
          <ShareButton productName={productName} />
        </div>
      </div>

      {/* Mobile Actions (Inline) */}
      <div className="sm:hidden flex flex-col gap-3 mb-8">
        <div className="flex gap-3">
          <button 
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={`flex-1 h-[52px] rounded-2xl transition-all shadow-sm flex items-center justify-center cursor-pointer ${isWishlisted ? 'text-red-500 bg-red-50' : 'text-gray-500 bg-white border border-gray-200/60 hover:bg-gray-50'}`}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
          </button>
          <div className="flex-1">
             <ShareButton productName={productName} />
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.location.href = '#chat'}
            className="flex-1 h-[52px] bg-white border border-gray-200/60 text-[#1d1d1f] font-medium rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer shadow-sm"
          >
            <MessageCircle className="w-5 h-5" />
            Chat
          </button>
          <button 
            onClick={() => setIsContactModalOpen(true)}
            className="flex-[1.5] h-[52px] bg-[#1d1d1f] text-white font-medium rounded-2xl shadow-md active:scale-95 transition-transform cursor-pointer"
          >
            Buy Now
          </button>
        </div>
      </div>

      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
        productName={productName} 
      />
    </>
  );
}
