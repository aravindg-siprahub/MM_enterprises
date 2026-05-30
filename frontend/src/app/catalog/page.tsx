import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ProductGrid from "@/components/ProductGrid";
import FilterSidebar from "@/components/FilterSidebar";
import Footer from "@/components/Footer";

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
      <Navbar />
      <main style={{ paddingTop: "72px" }}>
        {/* Page Header */}
        <div
          style={{
            background: "var(--navy-900)",
            padding: "64px 24px 48px",
            textAlign: "center",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="section-label" style={{ justifyContent: "center" }}>
            Our Collection
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 700,
              color: "#f0f4ff",
              marginBottom: "16px",
            }}
          >
            {search ? `Search Results for "${search}"` : "Product Catalog"}
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1rem",
              lineHeight: 1.7,
              maxWidth: "520px",
              margin: "0 auto",
            }}
          >
            Browse our complete range of premium electronics and home appliances.
            Click "Inquire" on any product to get the best price via WhatsApp.
          </p>
        </div>

        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", gap: "32px", alignItems: "flex-start", padding: "40px 24px" }}>
          <FilterSidebar />
          <div style={{ flexGrow: 1 }}>
            <ProductGrid featured={false} category={category} brand={brand} search={search} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
