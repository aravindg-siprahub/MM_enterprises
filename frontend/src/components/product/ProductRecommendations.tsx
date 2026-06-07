import { getAiRecommendations } from '@/lib/api'
import ProductSlider from '@/components/home/ProductSlider'
import AnimatedSection from '@/components/ui/AnimatedSection'

export default async function ProductRecommendations({ slug }: { slug: string }) {
  const recommendations = await getAiRecommendations(slug)

  if (!recommendations || recommendations.length === 0) {
    return null
  }

  return (
    <div className="mt-20 border-t border-slate-200 pt-16">
      <AnimatedSection>
        <ProductSlider 
          title="Recommended For You" 
          subtitle="Smart suggestions based on your interests powered by AI"
          products={recommendations} 
        />
      </AnimatedSection>
    </div>
  )
}
