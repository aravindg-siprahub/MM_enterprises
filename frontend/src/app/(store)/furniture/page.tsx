import CategoryPage from '@/components/CategoryPage'
import { getCategoryProducts, getCategoryBrands } from '@/lib/api'

export default async function FurniturePage() {
  const productsResponse = await getCategoryProducts("furniture", { page: 1, limit: 24 });
  const brandsResponse = await getCategoryBrands("furniture");
  
  const initialProducts = productsResponse?.data || [];
  const initialTotal = productsResponse?.total || initialProducts.length;
  const initialBrands = brandsResponse?.map((b: any) => b.name) || [];

  return (
    <CategoryPage 
      categorySlug="furniture" 
      title="Furniture" 
      bannerPlacement="category_furniture"
      initialProducts={initialProducts}
      initialTotal={initialTotal}
      initialBrands={initialBrands}
    />
  )
}
