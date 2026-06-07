import { getHomepage } from "@/lib/api";
import HeroCarousel from "@/components/home/HeroCarousel";
import ProductSlider from "@/components/home/ProductSlider";
import BrandSpotlight from "@/components/home/BrandSpotlight";
import MidBanner from "@/components/home/MidBanner";
import AnimatedSection from "@/components/ui/AnimatedSection";

export const revalidate = 60;

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

  const latestMobiles = data.latest_mobiles || [];
  console.log("HOMEPAGE DATA LATEST MOBILES TYPE:", typeof data.latest_mobiles);
  console.log("HOMEPAGE DATA LATEST MOBILES LENGTH:", data.latest_mobiles?.length);

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
        


        {/* Trending Mobiles (Latest Added) */}
        {latestMobiles.length > 0 && (
          <AnimatedSection>
            <ProductSlider 
              title="Trending Mobiles" 
              subtitle="Check out the latest arrivals"
              products={latestMobiles} 
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

        {/* Smart Appliances Slider */}
        {data.appliances_featured?.length > 0 && (
          <AnimatedSection>
            <ProductSlider 
              title="Smart Home Appliances"
              subtitle="Upgrade your home with next-gen technology"
              products={data.appliances_featured}
              viewAllLink="/appliances"
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

        {/* Premium Furniture Slider */}
        {data.furniture_featured?.length > 0 && (
          <AnimatedSection>
            <ProductSlider 
              title="Premium Furniture"
              subtitle="Transform your living spaces with luxury collections"
              products={data.furniture_featured}
              viewAllLink="/furniture"
            />
          </AnimatedSection>
        )}

      </div>
      
    </main>
  );
}
