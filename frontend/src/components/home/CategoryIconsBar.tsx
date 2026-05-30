'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ShoppingBag, Shirt, Smartphone, Sparkles, 
  Laptop, Lamp, Tv, Sofa, Baby, HeartPulse, 
  CarFront, Bike, Dumbbell, BookOpen 
} from 'lucide-react'

// Custom wrapper to add the yellow accent to Lucide icons
const IconWrapper = ({ children, yellowClasses = "" }: { children: React.ReactNode, yellowClasses?: string }) => (
  <div className="relative w-8 h-8 flex items-center justify-center">
    {/* Yellow accent element */}
    <div className={`absolute bg-[#FFD700] z-0 ${yellowClasses}`} />
    {/* The Lucide icon (with relative z-index to sit on top of the yellow accent) */}
    <div className="relative z-10 text-[#333333]">
      {children}
    </div>
  </div>
)

const CATEGORIES = [
  { name: 'For You', slug: '', Icon: () => <IconWrapper yellowClasses="w-3 h-2 bottom-1.5"><ShoppingBag strokeWidth={1.5} size={28} /></IconWrapper> },
  { name: 'Mobiles', slug: 'mobiles', Icon: () => <IconWrapper yellowClasses="w-4 h-1.5 bottom-1 rounded-sm"><Smartphone strokeWidth={1.5} size={28} /></IconWrapper> },
  { name: 'Appliances', slug: 'appliances', Icon: () => <IconWrapper yellowClasses="w-5 h-2 bottom-2"><Tv strokeWidth={1.5} size={28} /></IconWrapper> },
  { name: 'Furniture', slug: 'furniture', Icon: () => <IconWrapper yellowClasses="w-5 h-2 bottom-1.5"><Sofa strokeWidth={1.5} size={28} /></IconWrapper> },
]

export default function CategoryIconsBar({ categories }: { categories?: any[] }) {
  const pathname = usePathname()

  // Use the detailed mock array to match Flipkart's exact look
  const displayCats = CATEGORIES

  return (
    <div className="bg-white border-b border-gray-100 w-full relative z-20">
      <div className="max-w-[1600px] mx-auto flex items-center justify-around sm:justify-center sm:gap-12 lg:gap-16 overflow-x-auto scrollbar-hide px-2 sm:px-4">
        {displayCats.map((cat, i) => {
          const isActive = pathname === `/${cat.slug}` || (cat.slug === '' && pathname === '/')
          
          return (
            <Link key={i} href={`/${cat.slug}`} 
                  className={`flex flex-col items-center gap-1.5 flex-shrink-0 min-w-[64px] pt-3 pb-2 relative group`}>
              
              {/* Active Background Pill */}
              {isActive && (
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[52px] h-[52px] bg-[#eef4ff] rounded-2xl z-0" />
              )}
              
              <div className="relative z-10 transition-transform group-hover:scale-105">
                <cat.Icon />
              </div>
              
              <span className={`text-[13px] relative z-10 whitespace-nowrap ${isActive ? 'font-semibold text-black' : 'font-medium text-[#212121] group-hover:text-[#2874f0]'}`}>
                {cat.name}
              </span>

              {/* Active Underline */}
              {isActive && (
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#2874f0] rounded-t-md" />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
