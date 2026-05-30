import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { API_BASE_URL } from "@/lib/config";

// We re-use the Product type from ProductCard for simplicity, 
// but define it here to make it self-contained if needed.
type ProductDetails = {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  specifications: Record<string, string>;
  category_id: string;
  brand_id: string;
  is_featured: boolean;
  in_stock: boolean;
  emi_available: boolean;
  brand?: { name: string; logo: string };
  category?: { name: string };
};

async function getProduct(id: string): Promise<ProductDetails | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, { cache: "no-store" });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error("Failed to fetch product");
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);

  if (!product) {
    notFound();
  }

  const mainImage = product.images?.[0] || "https://placehold.co/600x400/122240/f0f4ff?text=No+Image";

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "100px", minHeight: "80vh" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
          <Link href="/catalog" style={{ color: "var(--text-muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "32px" }} className="hover:text-[var(--gold-400)] transition-colors">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Back to Catalog
          </Link>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "64px" }}>
            {/* Left: Images */}
            <div>
              <div className="glass-card" style={{ padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", background: "white", borderRadius: "16px", overflow: "hidden" }}>
                <img src={mainImage} alt={product.title} style={{ width: "100%", height: "auto", objectFit: "contain", maxHeight: "500px" }} />
              </div>
              {/* Thumbnail Gallery (Mock) */}
              <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
                {product.images?.map((img, i) => (
                  <div key={i} className="glass-card" style={{ width: "80px", height: "80px", background: "white", padding: "8px", cursor: "pointer", border: i === 0 ? "2px solid var(--gold-500)" : "1px solid var(--border)" }}>
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Info */}
            <div>
              {product.brand && (
                <div style={{ color: "var(--gold-500)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.85rem", marginBottom: "8px" }}>
                  {product.brand.name}
                </div>
              )}
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", color: "#f0f4ff", marginBottom: "16px", lineHeight: 1.2 }}>
                {product.title}
              </h1>
              
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
                <span style={{ fontSize: "2rem", fontWeight: 700, color: "var(--gold-400)" }}>
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.emi_available && (
                  <span style={{ padding: "4px 12px", background: "rgba(232,184,64,0.1)", color: "var(--gold-500)", fontSize: "0.8rem", borderRadius: "100px", fontWeight: 600, border: "1px solid var(--border-gold)" }}>
                    EMI Available
                  </span>
                )}
                <span style={{ padding: "4px 12px", background: product.in_stock ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: product.in_stock ? "#10b981" : "#ef4444", fontSize: "0.8rem", borderRadius: "100px", fontWeight: 600 }}>
                  {product.in_stock ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "40px" }}>
                {product.description || "No description available for this product. Contact us for more details."}
              </p>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "16px", marginBottom: "48px", flexWrap: "wrap" }}>
                <a href={`https://wa.me/911234567890?text=I'm interested in ${product.title}`} target="_blank" rel="noreferrer" className="btn-gold" style={{ flexGrow: 1, justifyContent: "center", padding: "16px 32px" }}>
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                  WhatsApp Inquiry
                </a>
                <a href="tel:+1234567890" className="btn-outline" style={{ flexGrow: 1, justifyContent: "center", padding: "16px 32px" }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  Call Store
                </a>
              </div>

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#f0f4ff", marginBottom: "24px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
                    Specifications
                  </h3>
                  <div style={{ display: "grid", gap: "16px" }}>
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "16px", borderBottom: "1px solid var(--border)" }}>
                        <span style={{ color: "var(--text-secondary)" }}>{key}</span>
                        <span style={{ color: "#f0f4ff", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{value as React.ReactNode}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
