'use client'
import { useState, useEffect } from 'react'
import ProductCard from '@/components/product/ProductCard'

function Countdown({ endsAt }: { endsAt?: string }) {
  const [time, setTime] = useState({ h: '00', m: '00', s: '00' })

  useEffect(() => {
    const target = endsAt ? new Date(endsAt) : new Date(Date.now() + 86400000)
    const update = () => {
      const diff = target.getTime() - Date.now()
      if (diff <= 0) return
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTime({
        h: String(h).padStart(2, '0'),
        m: String(m).padStart(2, '0'),
        s: String(s).padStart(2, '0')
      })
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [endsAt])

  return (
    <div className="flex items-center gap-1 text-[#2874f0]">
      {[time.h, time.m, time.s].map((v, i) => (
        <div key={i} className="flex items-center">
          <span className="bg-[#2874f0] text-white text-xs font-bold
                                    px-1.5 py-0.5 rounded min-w-[28px] 
                                    text-center tabular-nums">
            {v}
          </span>
          {i < 2 && <span className="text-[#2874f0] font-bold text-xs mx-1">:</span>}
        </div>
      ))}
    </div>
  )
}

export default function GrabOrGoneSection({ products }: { products: any[] }) {
  if (!products?.length) return null
  
  const soonest = products.reduce((min, p) => {
    const d = p.deals?.[0]?.ends_at || p.ends_at
    return !min || (d && d < min) ? d : min
  }, null)

  return (
    <div className="bg-white rounded-sm shadow-sm overflow-hidden">
      <div className="flex items-center justify-between 
                      px-3 sm:px-4 py-3 border-b border-yellow-100
                      bg-gradient-to-r from-yellow-50 to-white">
        <div className="flex items-center gap-2 sm:gap-3">
          <h2 className="text-base sm:text-xl font-black text-[#212121]">
            ⚡ Grab or Gone
          </h2>
          <Countdown endsAt={soonest} />
        </div>
        <span className="text-xs text-[#878787] hidden sm:block">
          Hurry, limited stock!
        </span>
      </div>
      
      <div className="flex gap-2 sm:gap-3 px-3 sm:px-4 py-3 
                      overflow-x-auto scrollbar-hide">
        {products.map(product => (
          <div key={product.id} className="w-32 sm:w-40 flex-shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  )
}
