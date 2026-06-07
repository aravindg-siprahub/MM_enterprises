import CategoryPage from '@/components/CategoryPage'
import { getCategoryProducts, getCategoryBrands } from '@/lib/api'

export default async function MobilesPage() {
  const productsResponse = await getCategoryProducts("mobiles", { page: 1, limit: 24 });
  const brandsResponse = await getCategoryBrands("mobiles");
  
  const initialProducts = productsResponse?.data || [];
  const initialTotal = productsResponse?.total || initialProducts.length;
  const initialBrands = brandsResponse?.map((b: any) => b.name) || [];

  return (
    <CategoryPage 
      categorySlug="mobiles" 
      title="Mobiles" 
      bannerPlacement="category_mobile"
      initialProducts={initialProducts}
      initialTotal={initialTotal}
      initialBrands={initialBrands}
    />
  )
}
