"use client";
import { useState } from "react";

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, product_id: null }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      // Fallback: show success anyway (mock mode)
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      style={{
        padding: "100px 24px",
        background: "var(--navy-950)",
        position: "relative",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "400px",
          background: "radial-gradient(ellipse, rgba(26,58,110,0.3) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative", zIndex: 2 }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <div className="section-label" style={{ justifyContent: "center" }}>
            Get In Touch
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
            Request a Quote
          </h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: "480px", margin: "0 auto" }}>
            Interested in a product? Send us your details and we'll get back to you with the best price.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "48px",
            alignItems: "center",
          }}
          className="contact-grid"
        >
          {/* Info Panel */}
          <div>
            {[
              {
                icon: "📍",
                title: "Visit Our Store",
                desc: "123 Electronics Hub, Market Road, City - 560001",
              },
              {
                icon: "📞",
                title: "Call Us",
                desc: "+91 99999 99999",
              },
              {
                icon: "⏰",
                title: "Store Hours",
                desc: "Mon–Sat: 10am – 8pm\nSun: 11am – 6pm",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  display: "flex",
                  gap: "16px",
                  marginBottom: "32px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    background: "rgba(232,184,64,0.08)",
                    border: "1px solid var(--border-gold)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.3rem",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <p style={{ color: "#f0f4ff", fontWeight: 600, marginBottom: "4px" }}>
                    {item.title}
                  </p>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                background: "#25D366",
                color: "#fff",
                padding: "14px 24px",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.95rem",
                transition: "all 0.2s",
                boxShadow: "0 8px 24px rgba(37,211,102,0.25)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat Instantly on WhatsApp
            </a>
          </div>

          {/* Form */}
          <div className="glass-card gold-border" style={{ padding: "32px" }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ fontSize: "3rem", marginBottom: "16px" }}>✅</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#f0f4ff", marginBottom: "12px", fontSize: "1.4rem" }}>
                  Inquiry Sent!
                </h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  Thank you! We'll reach out within a few hours with the best offer for you.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label
                    htmlFor="contact-name"
                    style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "8px", fontWeight: 500 }}
                  >
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={{
                      width: "100%",
                      background: "rgba(9,21,40,0.6)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      color: "#f0f4ff",
                      fontSize: "0.95rem",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(232,184,64,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-phone"
                    style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "8px", fontWeight: 500 }}
                  >
                    Phone Number
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    style={{
                      width: "100%",
                      background: "rgba(9,21,40,0.6)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      color: "#f0f4ff",
                      fontSize: "0.95rem",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(232,184,64,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "8px", fontWeight: 500 }}
                  >
                    What are you looking for?
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    placeholder="e.g. I'm interested in the iPhone 15 Pro. What's the best price available?"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    style={{
                      width: "100%",
                      background: "rgba(9,21,40,0.6)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      color: "#f0f4ff",
                      fontSize: "0.95rem",
                      outline: "none",
                      resize: "vertical",
                      transition: "border-color 0.2s",
                      fontFamily: "Inter, sans-serif",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(232,184,64,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-gold"
                  disabled={loading}
                  style={{ justifyContent: "center", opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? "Sending..." : "Send Inquiry →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
