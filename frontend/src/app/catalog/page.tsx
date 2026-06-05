import type { Metadata } from "next";
import ProductGrid from "@/components/ProductGrid";
import FilterSidebar from "@/components/FilterSidebar";

export const metadata: Metadata = {
  title: "Product Catalog | MM Enterprises",
  description:
    "Browse our full catalog of premium mobile phones, laptops, home appliances, and accessories from the world's top brands.",
};

export default async function CatalogPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined }
}) {
  // Support for both synchronous (Next 14) and asynchronous (Next 15+) searchParams
  const resolvedParams = await searchParams;
  const category = typeof resolvedParams?.category === 'string' ? resolvedParams.category : undefined;
  const brand = typeof resolvedParams?.brand === 'string' ? resolvedParams.brand : undefined;
  const search = typeof resolvedParams?.search === 'string' ? resolvedParams.search : undefined;

  return (
    <>
      <main>
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row gap-8 items-start px-4 md:px-6 py-8">
          <FilterSidebar />
          <div className="flex-grow w-full">
            <ProductGrid featured={false} category={category} brand={brand} search={search} />
          </div>
        </div>
      </main>
    </>
  );
}
