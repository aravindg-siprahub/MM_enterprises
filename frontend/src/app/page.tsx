import { getHomepage } from "@/lib/api";
import HeroCarousel from "@/components/home/HeroCarousel";
import ProductSlider from "@/components/home/ProductSlider";
import ProductGrid from "@/components/ProductGrid";
import BrandSpotlight from "@/components/home/BrandSpotlight";
import MidBanner from "@/components/home/MidBanner";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default async function Home() {
  const data = await getHomepage();

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-red-500 font-bold">
        Failed to load homepage data. Is the backend running?
      </div>
    );
  }

  // Extract products from deals
  const topDealsProducts = data.top_deals?.map((d: any) => ({
    ...d.products,
    price: d.deal_price,
    original_price: d.products?.original_price,
    discount_percentage: Math.round(((d.products?.original_price - d.deal_price) / d.products?.original_price) * 100),
    deal_type: d.deal_type,
    ends_at: d.ends_at
  })) || [];

  const grabOrGoneProducts = data.grab_or_gone?.map((d: any) => ({
    ...d.products,
    price: d.deal_price,
    original_price: d.products?.original_price,
    discount_percentage: Math.round(((d.products?.original_price - d.deal_price) / d.products?.original_price) * 100),
    deal_type: d.deal_type,
    ends_at: d.ends_at
  })) || [];

  return (
    <main className="bg-background min-h-screen pb-16">
      
      {/* Hero Section */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 pt-3 pb-6">
        <AnimatedSection>
          <HeroCarousel banners={data.hero_banners} />
        </AnimatedSection>
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 space-y-10 sm:space-y-16">
        
        {/* For You / Top Deals - Horizontal Slider */}
        {topDealsProducts.length > 0 && (
          <AnimatedSection>
            <ProductSlider 
              title="Personalized For You" 
              subtitle="Recommended products based on your trends"
              products={topDealsProducts} 
              viewAllLink="/deals"
            />
          </AnimatedSection>
        )}

        {/* Grab Or Gone / Trending Mobiles */}
        {grabOrGoneProducts.length > 0 && (
          <AnimatedSection>
            <ProductSlider 
              title="Trending Mobiles" 
              subtitle="Grab these limited time offers before they're gone"
              products={grabOrGoneProducts} 
              viewAllLink="/mobiles"
            />
          </AnimatedSection>
        )}

        {/* Appliances Banner */}
        {data.mid_banner_appliances && (
          <AnimatedSection>
            <div className="rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <MidBanner banner={data.mid_banner_appliances} />
            </div>
          </AnimatedSection>
        )}

        {/* Smart Appliances Grid */}
        {data.appliances_featured?.length > 0 && (
          <AnimatedSection>
            <ProductGrid 
              title="Smart Home Appliances"
              subtitle="Upgrade your home with next-gen technology"
              staticProducts={data.appliances_featured}
              viewAllLink="/appliances"
              featured={true}
            />
          </AnimatedSection>
        )}

        {/* Brand Showcase */}
        {data.brand_spotlight?.length > 0 && (
          <AnimatedSection>
            <BrandSpotlight brands={data.brand_spotlight} />
          </AnimatedSection>
        )}

        {/* Furniture Banner */}
        {data.mid_banner_furniture && (
          <AnimatedSection>
            <div className="rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <MidBanner banner={data.mid_banner_furniture} />
            </div>
          </AnimatedSection>
        )}

        {/* Premium Furniture Grid */}
        {data.furniture_featured?.length > 0 && (
          <AnimatedSection>
            <ProductGrid 
              title="Premium Furniture"
              subtitle="Transform your living spaces with luxury collections"
              staticProducts={data.furniture_featured}
              viewAllLink="/furniture"
            />
          </AnimatedSection>
        )}

      </div>
      


    </main>
  );
}
