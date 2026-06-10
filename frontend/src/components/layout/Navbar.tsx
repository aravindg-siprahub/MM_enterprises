'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, User, Heart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Assuming button gets added
import SmartSearch from '@/components/ui/SmartSearch';
import NotificationBell from '@/components/ui/NotificationBell';
import { useWishlist } from '@/context/WishlistContext';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { wishlistCount } = useWishlist();

  return (
    <nav className="sticky top-0 z-50 w-full glass-nav bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left: Mobile Menu & Logo */}
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden p-2 text-foreground/80 hover:text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <Link href="/" className="flex items-center group">
            <Image 
              src="/logo.png" 
              alt="MM Enterprises Logo" 
              width={220} 
              height={55} 
              className="h-10 md:h-12 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Center: Desktop Navigation & Search */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6 flex-1 max-w-3xl px-4 lg:px-8">
          <div className="flex items-center gap-4 lg:gap-6 text-sm font-medium text-muted-foreground whitespace-nowrap">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Link href="/mobiles" className="hover:text-primary transition-colors">Mobiles</Link>
            <Link href="/appliances" className="hover:text-primary transition-colors">Appliances</Link>
            <Link href="/furniture" className="hover:text-primary transition-colors">Furniture</Link>
          </div>
          
          <SmartSearch />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            className="md:hidden p-2 text-foreground/80 hover:text-foreground"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Search className="w-5 h-5" />
          </button>
          
          <Link href="/wishlist" className="relative p-2 text-foreground/80 hover:text-primary">
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          <NotificationBell />

          <div className="hidden sm:block border-l h-6 mx-2 border-border"></div>
          
          <Link href="/admin" className="flex items-center gap-2 p-2 text-foreground/80 hover:text-primary">
            <User className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:block">Account</span>
          </Link>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-border shadow-lg">
          <div className="flex flex-col py-4 px-6 space-y-4">
            <div className="w-full pb-2 mb-2 border-b border-border">
              <SmartSearch />
            </div>
            <Link 
              href="/" 
              className="text-lg font-medium hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/mobiles" 
              className="text-lg font-medium hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Mobiles
            </Link>
            <Link 
              href="/appliances" 
              className="text-lg font-medium hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Appliances
            </Link>
            <Link 
              href="/furniture" 
              className="text-lg font-medium hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Furniture
            </Link>
            <div className="pt-4 mt-2 border-t border-border flex flex-col space-y-4">
              <Link 
                href="/wishlist" 
                className="flex items-center gap-3 text-lg font-medium hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Heart className="w-5 h-5" /> 
                <span>Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link 
                href="/admin" 
                className="flex items-center gap-3 text-lg font-medium hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-5 h-5" /> Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
