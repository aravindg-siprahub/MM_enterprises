import CategoryPage from '@/components/CategoryPage'
import { getCategoryProducts, getCategoryBrands } from '@/lib/api'

export default async function AppliancesPage() {
  const productsResponse = await getCategoryProducts("appliances", { page: 1, limit: 24 });
  const brandsResponse = await getCategoryBrands("appliances");
  
  const initialProducts = productsResponse?.data || [];
  const initialTotal = productsResponse?.total || initialProducts.length;
  const initialBrands = brandsResponse?.map((b: any) => b.name) || [];

  return (
    <CategoryPage 
      categorySlug="appliances" 
      title="Appliances" 
      bannerPlacement="category_appliances"
      initialProducts={initialProducts}
      initialTotal={initialTotal}
      initialBrands={initialBrands}
    />
  )
}
