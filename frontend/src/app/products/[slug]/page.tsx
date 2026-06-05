import { Metadata } from 'next'
import { getProductBySlug, getAiRecommendations } from '@/lib/api'
import ImageGallery from '@/components/product/ImageGallery'
import ProductSlider from '@/components/home/ProductSlider'
import AnimatedSection from '@/components/ui/AnimatedSection'
import ProductInteractiveSection from '@/components/product/ProductInteractiveSection'
import ChatModal from '@/components/product/ChatModal'
import ProductHighlights from '@/components/product/ProductHighlights'
import { Star, ShieldCheck, Truck, Shield, HeadphonesIcon } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug)
  if (!product) return { title: 'Product Not Found' }
  
  return {
    title: `${product.name} | MM Enterprises`,
    description: product.description,
  }
}

export default async function ProductPage({ params }: Props) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug)
  const recommendations = await getAiRecommendations(resolvedParams.slug)

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
        <p className="text-gray-500">This product might have been removed or doesn't exist.</p>
      </div>
    )
  }

  const images = product.product_images || []
  const activeDeal = product.deals?.find((d: any) => d.is_active !== false)
  const originalPrice = product.original_price || 0
  const sellingPrice = activeDeal?.deal_price || product.selling_price || 0
  
  // Calculate true discount if there's a deal, otherwise use DB generated discount
  const discountPercent = activeDeal 
    ? (originalPrice > 0 ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0)
    : (product.discount_percent || 0)

  return (
    <main className="bg-[#fbfbfd] min-h-screen pb-20 pt-4 md:pt-8">
      <div className="container max-w-[1200px] mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb */}
        <nav className="flex text-xs md:text-sm text-gray-500 mb-6 font-medium tracking-wide">
          <span className="hover:text-gray-900 cursor-pointer transition-colors">Home</span>
          <span className="mx-2">/</span>
          <span className="hover:text-gray-900 cursor-pointer transition-colors">{product.categories?.name || 'Category'}</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 truncate">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 mb-16 items-start relative">
          {/* Left: Image Gallery */}
          <div className="w-full lg:w-3/5 lg:sticky lg:top-8 h-fit z-10">
            <ImageGallery images={images} />
          </div>

          {/* Right: Product Info */}
          <div className="w-full lg:w-2/5 flex flex-col">
            <div className="mb-6 pb-6">
              {product.brands && (
                <div className="text-gray-500 font-semibold tracking-widest uppercase text-[11px] mb-3 flex items-center gap-2">
                  {product.brands.name}
                  {product.is_top_deal && (
                    <span className="bg-[#1d1d1f] text-white px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-bold">Top Deal</span>
                  )}
                </div>
              )}
              
              <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-medium text-[#1d1d1f] mb-4 tracking-tight leading-[1.1]">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center bg-gray-100/80 px-2 py-1 rounded-lg">
                    <Star className="w-3.5 h-3.5 fill-[#1d1d1f] text-[#1d1d1f]" />
                    <span className="font-semibold text-sm text-[#1d1d1f] ml-1">{product.rating || '4.8'}</span>
                  </div>
                  <span className="text-sm text-gray-500 hover:text-[#1d1d1f] cursor-pointer transition-colors font-medium underline decoration-gray-300 underline-offset-4">
                    {product.review_count || 120} Reviews
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing Area & Variants & Actions */}
            <ProductInteractiveSection 
              product={product} 
              initialSellingPrice={sellingPrice}
              initialOriginalPrice={originalPrice}
              initialDiscountPercent={discountPercent}
            />

            {/* Premium Trust Badges */}
            <div className="flex items-center justify-between gap-4 mb-10 py-6 border-y border-gray-200/60 overflow-x-auto hide-scrollbar">
              <div className="flex flex-col items-center gap-2 group min-w-[80px]">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors shrink-0">
                  <ShieldCheck className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-xs font-medium text-gray-500 leading-tight">100% Original</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 group min-w-[80px]">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors shrink-0">
                  <Shield className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-xs font-medium text-gray-500 leading-tight">1 Year Warranty</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 group min-w-[80px]">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors shrink-0">
                  <Truck className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-xs font-medium text-gray-500 leading-tight">Fast Delivery</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 group min-w-[80px]">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors shrink-0">
                  <HeadphonesIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-xs font-medium text-gray-500 leading-tight">24/7 Support</span>
                </div>
              </div>
            </div>

            {/* AI Description & Specs */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/60 shadow-sm mb-6">
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-6 tracking-tight">Highlights</h3>
              <ProductHighlights summary={product.ai_summary} description={product.description} />
            </div>

            {product.attributes && product.attributes.length > 0 && (
              <div className="bg-white rounded-2xl p-8 border border-gray-200/60 shadow-sm">
                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4 tracking-tight">Specifications</h3>
                <div className="space-y-3">
                  {product.attributes.map((attr: any) => (
                    <div key={attr.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 last:pb-0">
                      <span className="text-[13px] text-gray-500 font-medium">{attr.attribute_name}</span>
                      <span className="text-[13px] text-[#1d1d1f] font-semibold text-right max-w-[60%]">{attr.attribute_value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <ChatModal productId={product.id} productName={product.name} />
          </div>
        </div>

        {/* AI Recommendations Section */}
        {recommendations && recommendations.length > 0 && (
          <div className="mt-20 border-t border-slate-200 pt-16">
            <AnimatedSection>
              <ProductSlider 
                title="Recommended For You" 
                subtitle="Smart suggestions based on your interests powered by AI"
                products={recommendations} 
              />
            </AnimatedSection>
          </div>
        )}
      </div>
    </main>
  )
}
