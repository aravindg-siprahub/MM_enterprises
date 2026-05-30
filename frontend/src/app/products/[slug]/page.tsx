import { Metadata } from 'next'
import { getProductBySlug, getAiRecommendations } from '@/lib/api'
import ImageGallery from '@/components/product/ImageGallery'
import ProductSlider from '@/components/home/ProductSlider'
import AnimatedSection from '@/components/ui/AnimatedSection'
import { Star, ShieldCheck, Truck, Shield, Heart, Share2, ShoppingCart } from 'lucide-react'

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
  const originalPrice = product.original_price || 0
  const sellingPrice = product.selling_price || 0
  const discountPercent = product.discount_percent || 0

  return (
    <main className="bg-slate-50 min-h-screen pb-20 pt-4 md:pt-8">
      <div className="container max-w-[1400px] mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb */}
        <nav className="flex text-sm text-gray-500 mb-6 font-medium">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span>{product.categories?.name || 'Category'}</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
          {/* Left: Image Gallery */}
          <div className="w-full">
            <ImageGallery images={images} />
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            <div className="mb-6 border-b border-gray-100 pb-6">
              {product.brands && (
                <div className="text-primary font-bold tracking-wider uppercase text-sm mb-2 flex items-center gap-2">
                  {product.brands.name}
                  {product.is_top_deal && (
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] uppercase tracking-bold">Top Deal</span>
                  )}
                </div>
              )}
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-amber-700">{product.rating || '4.8'}</span>
                </div>
                <span className="text-sm text-gray-500 hover:text-primary cursor-pointer transition-colors font-medium">
                  {product.review_count || 120} verified reviews
                </span>
              </div>
            </div>

            {/* Pricing Area */}
            <div className="mb-8">
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  ₹{sellingPrice.toLocaleString('en-IN')}
                </span>
                {originalPrice > sellingPrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through mb-1 font-medium">
                      ₹{originalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-lg font-bold text-green-600 mb-1">
                      {discountPercent}% off
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-500 font-medium">Inclusive of all taxes. Free shipping applied.</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button className="flex-1 bg-white border-2 border-slate-200 text-slate-900 hover:border-slate-800 font-bold py-4 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button className="flex-1 premium-gradient text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Buy Now
              </button>
              <div className="flex gap-2">
                <button className="p-4 rounded-2xl border-2 border-slate-200 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all">
                  <Heart className="w-6 h-6" />
                </button>
                <button className="p-4 rounded-2xl border-2 border-slate-200 text-gray-400 hover:text-blue-500 hover:border-blue-100 hover:bg-blue-50 transition-all hidden sm:block">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <ShieldCheck className="w-8 h-8 text-green-500" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">1 Year Warranty</h4>
                  <p className="text-xs text-gray-500">Brand authorized</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <Truck className="w-8 h-8 text-blue-500" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Fast Delivery</h4>
                  <p className="text-xs text-gray-500">By tomorrow, 9 PM</p>
                </div>
              </div>
            </div>

            {/* AI Description & Specs */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Product Highlights</h3>
              {product.ai_summary ? (
                <div 
                  className="prose prose-sm text-gray-600 leading-relaxed font-medium" 
                  dangerouslySetInnerHTML={{ __html: product.ai_summary }} 
                />
              ) : (
                <p className="text-gray-600 leading-relaxed font-medium">
                  {product.description}
                </p>
              )}
            </div>

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex flex-col border-b border-slate-50 pb-2">
                      <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">{key}</span>
                      <span className="text-sm text-slate-900 font-medium mt-1">{value as React.ReactNode}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
