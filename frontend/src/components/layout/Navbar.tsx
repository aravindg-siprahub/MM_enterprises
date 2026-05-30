import Link from 'next/link';
import { Search, ShoppingBag, User, Heart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Assuming button gets added
import SmartSearch from '@/components/ui/SmartSearch';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full glass-nav">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left: Mobile Menu & Logo */}
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 text-foreground/80 hover:text-foreground">
            <Menu className="w-6 h-6" />
          </button>
          
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-xl font-bold hidden sm:block tracking-tight">Enterprises</span>
          </Link>
        </div>

        {/* Center: Desktop Navigation & Search */}
        <div className="hidden md:flex items-center gap-6 flex-1 max-w-2xl px-8">
          <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/mobiles" className="hover:text-primary transition-colors">Mobiles</Link>
            <Link href="/appliances" className="hover:text-primary transition-colors">Appliances</Link>
            <Link href="/furniture" className="hover:text-primary transition-colors">Furniture</Link>
          </div>
          
          <SmartSearch />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button className="md:hidden p-2 text-foreground/80 hover:text-foreground">
            <Search className="w-5 h-5" />
          </button>
          
          <Link href="/wishlist" className="p-2 text-foreground/80 hover:text-primary hidden sm:block">
            <Heart className="w-5 h-5" />
          </Link>
          
          <Link href="/cart" className="relative p-2 text-foreground/80 hover:text-primary">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              0
            </span>
          </Link>

          <div className="hidden sm:block border-l h-6 mx-2 border-border"></div>
          
          <Link href="/admin" className="hidden sm:flex items-center gap-2 p-2 text-foreground/80 hover:text-primary">
            <User className="w-5 h-5" />
            <span className="text-sm font-medium">Account</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
