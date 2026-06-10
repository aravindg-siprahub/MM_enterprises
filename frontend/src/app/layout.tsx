import type { Metadata, Viewport } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import StoreShell from "@/components/layout/StoreShell";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "MM Enterprises | Premium Electronics & Appliances",
  description:
    "MM Enterprises — your trusted local destination for premium mobile phones, electronics, and home appliances. Explore top brands at competitive prices.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
  },
  openGraph: {
    title: "MM Enterprises | Premium Electronics & Appliances",
    description: "Your trusted local destination for premium mobile phones, electronics, and home appliances.",
    url: "https://www.mmenterprises.store",
    siteName: "MM Enterprises",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MM Enterprises - Premium Electronics & Appliances",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MM Enterprises",
    description: "Premium mobile phones, electronics, and home appliances.",
    images: ["/twitter-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn(inter.variable, "font-sans", geist.variable)}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "MM Enterprises",
              url: "https://www.mmenterprises.store",
              logo: "https://www.mmenterprises.store/logo.png",
              sameAs: [
                "https://www.facebook.com/mmenterprises",
                "https://twitter.com/mmenterprises",
                "https://www.instagram.com/mmenterprises"
              ]
            })
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[var(--background)] antialiased">
        <StoreShell>{children}</StoreShell>
      </body>
    </html>
  );
}
