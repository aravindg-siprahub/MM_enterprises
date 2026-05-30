'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowRight } from 'lucide-react'

export default function Newsletter() {
  return (
    <div className="w-full py-16 sm:py-24">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden premium-gradient text-white p-8 sm:p-16 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-black opacity-10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

          <div className="relative z-10 flex-1 max-w-xl text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Get the latest deals and <span className="text-white/80">exclusive offers.</span>
            </h2>
            <p className="text-white/80 text-base sm:text-lg">
              Subscribe to our newsletter to receive early access to upcoming sales, new product launches, and special discounts right to your inbox.
            </p>
          </div>

          <div className="relative z-10 w-full md:w-auto max-w-md flex-shrink-0">
            <form className="relative flex items-center w-full bg-white/10 p-1.5 rounded-full backdrop-blur-md border border-white/20 focus-within:border-white/50 focus-within:bg-white/20 transition-all shadow-inner">
              <Mail className="absolute left-4 w-5 h-5 text-white/70" />
              <input 
                type="email" 
                placeholder="Enter your email address" 
                required
                className="w-full bg-transparent border-none text-white placeholder:text-white/50 py-3 pl-12 pr-4 focus:outline-none focus:ring-0"
              />
              <button 
                type="submit"
                className="bg-white text-[#1E40AF] hover:bg-gray-100 flex items-center justify-center p-3 rounded-full shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
            <p className="text-white/60 text-xs text-center md:text-left mt-3">
              We care about your data. Read our Privacy Policy.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
