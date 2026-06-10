import Link from 'next/link'
import Image from 'next/image'
import { Send } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 mt-12 relative overflow-hidden">
      {/* Decorative gradient blur in background */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2563EB] via-purple-500 to-[#10B981]"></div>
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-12 lg:gap-8 mb-16">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6 group">
              <Image 
                src="/logo.png" 
                alt="MM Enterprises Logo" 
                width={180} 
                height={45} 
                className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm">
              Your premium destination for the latest smartphones, smart appliances, and luxury furniture. Experience shopping redefined.
            </p>
            
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Subscribe to our newsletter</h4>
              <form className="flex gap-2 max-w-md">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#2563EB]/50 focus:border-[#2563EB] outline-none transition-all text-sm"
                />
                <button type="button" className="bg-[#2563EB] hover:bg-[#1E40AF] text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="text-gray-900 font-semibold text-sm mb-5">Shop Categories</h4>
            <ul className="space-y-3.5 text-sm">
              <li><Link href="#" className="text-gray-500 hover:text-[#2563EB] transition-colors">Premium Mobiles</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-[#2563EB] transition-colors">Smart Appliances</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-[#2563EB] transition-colors">Luxury Furniture</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-[#2563EB] transition-colors">Today's Deals</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-gray-900 font-semibold text-sm mb-5">Customer Service</h4>
            <ul className="space-y-3.5 text-sm">
              <li><Link href="#" className="text-gray-500 hover:text-[#2563EB] transition-colors">Help Center</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-[#2563EB] transition-colors">Track Order</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-[#2563EB] transition-colors">Returns & Refunds</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-[#2563EB] transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-gray-900 font-semibold text-sm mb-5">Contact Info</h4>
            <ul className="space-y-3.5 text-sm text-gray-500">
              <li className="leading-relaxed">
                <span className="font-medium text-gray-700 block mb-1">M.M. ENTERPRISES</span>
                #6-477/1, T.B. Road,<br/>
                Kalikiri, Annamayya Dist.,<br/>
                Andhra Pradesh - 517234
              </li>
              <li className="pt-2">
                <span className="font-medium text-gray-700 block mb-1">Phone</span>
                <a href="tel:9032320255" className="hover:text-[#2563EB] transition-colors block">90323 20255</a>
                <a href="tel:8919572478" className="hover:text-[#2563EB] transition-colors block mt-1">89195 72478</a>
              </li>
            </ul>
          </div>
          
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-[#2563EB] transition-colors">Facebook</a>
            <a href="#" className="hover:text-[#2563EB] transition-colors">Twitter</a>
            <a href="#" className="hover:text-[#2563EB] transition-colors">Instagram</a>
            <a href="#" className="hover:text-[#2563EB] transition-colors">YouTube</a>
          </div>
          
          <div className="text-sm text-gray-400 flex flex-wrap justify-center gap-x-6 gap-y-2">
            <span className="font-medium text-[#2563EB]">Best Brands. Best Prices.</span>
            <span>© {new Date().getFullYear()} MM Enterprises. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
