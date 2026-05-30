"use client";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        background: "var(--navy-950)",
      }}
    >
      {/* Background Gradient Orbs */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(26,58,110,0.5) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          left: "-10%",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(232,184,64,0.06) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      {/* Grid pattern overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "120px 24px 80px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "80px",
          alignItems: "center",
          position: "relative",
          zIndex: 2,
          width: "100%",
        }}
        className="hero-grid"
      >
        {/* Left Content */}
        <div style={{ animation: "fadeUp 0.8s ease forwards" }}>
          <div className="section-label" style={{ marginBottom: "24px" }}>
            Premium Electronics Since 2010
          </div>

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.5rem, 5vw, 4.2rem)",
              fontWeight: 700,
              lineHeight: 1.15,
              color: "#f0f4ff",
              marginBottom: "24px",
            }}
          >
            Discover{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #f5d060, #c99a28)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Premium
            </span>{" "}
            Electronics & Appliances
          </h1>

          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1.1rem",
              lineHeight: 1.8,
              marginBottom: "40px",
              maxWidth: "480px",
            }}
          >
            Your trusted local destination for top-brand mobile phones, laptops, home appliances, and more — at unbeatable prices with expert service.
          </p>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <Link href="/catalog" className="btn-gold">
              Browse Catalog
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <a href="#contact" className="btn-outline">
              Get a Quote
            </a>
          </div>

          {/* Stats Row */}
          <div
            style={{
              display: "flex",
              gap: "40px",
              marginTop: "56px",
              paddingTop: "40px",
              borderTop: "1px solid var(--border)",
              flexWrap: "wrap",
            }}
          >
            {[
              { value: "10+", label: "Years in Business" },
              { value: "500+", label: "Products" },
              { value: "50+", label: "Top Brands" },
              { value: "10K+", label: "Happy Customers" },
            ].map((stat) => (
              <div key={stat.label}>
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    color: "#e8b840",
                    marginBottom: "4px",
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", letterSpacing: "0.05em" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Visual */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            animation: "float 5s ease-in-out infinite",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "380px",
              height: "480px",
            }}
          >
            {/* Main card */}
            <div
              className="glass-card gold-border"
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "20px",
                padding: "40px",
                boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 40px rgba(232,184,64,0.1)",
              }}
            >
              <div
                style={{
                  fontSize: "5rem",
                  lineHeight: 1,
                  filter: "drop-shadow(0 0 20px rgba(232,184,64,0.3))",
                }}
              >
                📱
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
                  Featured Product
                </p>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.4rem",
                    color: "#f0f4ff",
                    marginBottom: "8px",
                  }}
                >
                  iPhone 15 Pro
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "16px" }}>
                  A17 Pro · 256GB · Titanium
                </p>
                <div
                  style={{
                    display: "inline-block",
                    background: "linear-gradient(135deg, rgba(232,184,64,0.15), rgba(232,184,64,0.05))",
                    border: "1px solid var(--border-gold)",
                    borderRadius: "8px",
                    padding: "8px 20px",
                    color: "#e8b840",
                    fontWeight: 700,
                    fontSize: "1.2rem",
                  }}
                >
                  ₹99,999
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div
              style={{
                position: "absolute",
                top: "-16px",
                right: "-16px",
                background: "linear-gradient(135deg, #e8b840, #c99a28)",
                color: "#050d1a",
                borderRadius: "50px",
                padding: "6px 14px",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                boxShadow: "0 8px 24px rgba(232,184,64,0.4)",
              }}
            >
              New Arrival
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "40px",
                left: "-24px",
                background: "rgba(15,31,56,0.95)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "12px 16px",
                fontSize: "0.8rem",
                color: "#f0f4ff",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              ✅ 1 Year Warranty
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: "absolute",
          bottom: "32px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          color: "var(--text-muted)",
          fontSize: "0.75rem",
          letterSpacing: "0.1em",
        }}
      >
        <span>SCROLL</span>
        <div
          style={{
            width: "1px",
            height: "40px",
            background: "linear-gradient(to bottom, var(--gold-500), transparent)",
            animation: "float 2s ease-in-out infinite",
          }}
        />
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hero-grid > div:last-child { display: none !important; }
        }
      `}</style>
    </section>
  );
}
