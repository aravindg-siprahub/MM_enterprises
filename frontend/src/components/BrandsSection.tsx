"use client";

const brands = [
  { name: "Apple", emoji: "🍎", color: "#555" },
  { name: "Samsung", emoji: "🌀", color: "#1428a0" },
  { name: "OnePlus", emoji: "⚡", color: "#eb0029" },
  { name: "Sony", emoji: "🎵", color: "#0033cc" },
  { name: "LG", emoji: "🏠", color: "#a50034" },
  { name: "Philips", emoji: "💡", color: "#0b5ed7" },
  { name: "Bosch", emoji: "🔧", color: "#d40000" },
  { name: "Whirlpool", emoji: "🌊", color: "#003087" },
];

export default function BrandsSection() {
  return (
    <section
      style={{
        padding: "100px 24px",
        background: "var(--navy-900)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Gold divider at top */}
      <div className="divider-gold" style={{ width: "200px", marginBottom: "80px" }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <div className="section-label" style={{ justifyContent: "center" }}>
            Our Partners
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 700,
              color: "#f0f4ff",
              marginBottom: "16px",
            }}
          >
            Authorised Brands
          </h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>
            We carry authentic, warranty-backed products from the world's most trusted electronics and appliance brands.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: "16px",
          }}
        >
          {brands.map((brand, i) => (
            <div
              key={brand.name}
              className="glass-card"
              style={{
                padding: "28px 16px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
                animationDelay: `${i * 0.07}s`,
                animation: "fadeUp 0.5s ease forwards",
                opacity: 0,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.transform = "translateY(-6px) scale(1.03)";
                el.style.borderColor = "rgba(232,184,64,0.4)";
                el.style.boxShadow = "0 16px 40px rgba(0,0,0,0.3), 0 0 20px rgba(232,184,64,0.1)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.transform = "none";
                el.style.borderColor = "rgba(255,255,255,0.07)";
                el.style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>
                {brand.emoji}
              </div>
              <p
                style={{
                  color: "#f0f4ff",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  letterSpacing: "0.03em",
                }}
              >
                {brand.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
