'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Smartphone, MonitorPlay, Sofa, Home } from 'lucide-react'
import { motion } from 'framer-motion'

const categories = [
  { name: 'Home', icon: Home, href: '/' },
  { name: 'Mobiles', icon: Smartphone, href: '/mobiles' },
  { name: 'Appliances', icon: MonitorPlay, href: '/appliances' },
  { name: 'Furniture', icon: Sofa, href: '/furniture' },
]

export default function CategoryPills() {
  const pathname = usePathname()

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="md:hidden sticky top-16 z-40 w-full bg-white/80 backdrop-blur-md border-b border-white/20 py-2 shadow-sm relative">
      {/* Scroll Shadow Indicators */}
      <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
      
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide snap-x px-4 pb-1">
        {categories.map((cat, index) => {
          const Icon = cat.icon
          const isActive = pathname === cat.href

          return (
            <Link key={index} href={cat.href} className="snap-start flex-shrink-0 outline-none">
              <motion.div
                whileTap={{ scale: 0.95 }}
                className={`relative rounded-full px-5 py-2 flex items-center gap-2 transition-all duration-300 ${
                  isActive 
                    ? 'premium-gradient text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] font-semibold' 
                    : 'bg-slate-50 border border-gray-100 text-gray-700 font-medium hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                <span className="text-sm tracking-tight">{cat.name}</span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
