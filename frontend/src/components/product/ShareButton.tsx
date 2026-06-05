'use client';

import React from 'react';
import { Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareButtonProps {
  productName: string;
}

export default function ShareButton({ productName }: ShareButtonProps) {
  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: productName,
      text: `Check out ${productName} on MM Enterprises!`,
      url: url,
    };

    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or share failed
        console.log('Error sharing:', err);
      }
    } else {
      // Desktop fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      } catch (err) {
        toast.error('Failed to copy link');
      }
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="w-[52px] h-[52px] sm:w-14 sm:h-14 rounded-2xl text-gray-500 hover:text-[#1d1d1f] hover:bg-gray-50 transition-colors flex items-center justify-center bg-white shadow-sm"
      title="Share Product"
    >
      <Share2 className="w-5 h-5 sm:w-5 sm:h-5" />
    </button>
  );
}
