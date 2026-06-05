"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import NotificationBell from '@/components/ui/NotificationBell';

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Catalog", href: "/catalog" },
  { label: "Brands", href: "/#brands" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 24px",
        height: "72px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "all 0.4s ease",
        background: scrolled
          ? "rgba(5,13,26,0.92)"
          : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,0.07)"
          : "none",
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ textDecoration: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              background: "linear-gradient(135deg, #e8b840, #c99a28)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: "18px",
              color: "#050d1a",
            }}
          >
            M
          </div>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 600,
              fontSize: "1.15rem",
              color: "#f0f4ff",
              letterSpacing: "0.02em",
            }}
          >
            MM <span style={{ color: "#e8b840" }}>Enterprises</span>
          </span>
        </div>
      </Link>

      {/* Desktop Nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "32px",
        }}
        className="desktop-nav"
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              color: "#9ab0cc",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
              letterSpacing: "0.04em",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "#e8b840")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "#9ab0cc")
            }
          >
            {link.label}
          </Link>
        ))}
        <NotificationBell />
        <Link href="/#contact" className="btn-gold" style={{ padding: "10px 20px", fontSize: "0.8rem" }}>
          Get Quote
        </Link>
      </div>

      {/* Mobile Hamburger */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="mobile-menu-btn"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "none",
          flexDirection: "column",
          gap: "5px",
          padding: "4px",
        }}
        aria-label="Toggle menu"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              display: "block",
              width: "24px",
              height: "2px",
              background: "#e8b840",
              borderRadius: "2px",
              transition: "all 0.3s",
              transform:
                menuOpen
                  ? i === 0
                    ? "rotate(45deg) translateY(7px)"
                    : i === 1
                    ? "scaleX(0)"
                    : "rotate(-45deg) translateY(-7px)"
                  : "none",
            }}
          />
        ))}
      </button>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          style={{
            position: "absolute",
            top: "72px",
            left: 0,
            right: 0,
            background: "rgba(9,21,40,0.98)",
            backdropFilter: "blur(20px)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                color: "#9ab0cc",
                textDecoration: "none",
                fontSize: "1rem",
                fontWeight: 500,
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/#contact" className="btn-gold" onClick={() => setMenuOpen(false)} style={{ textAlign: "center" }}>
            Get Quote
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
