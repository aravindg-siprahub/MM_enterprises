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
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn(inter.variable, "font-sans", geist.variable)}>
      <body className="min-h-screen flex flex-col bg-[var(--background)] antialiased">
        <StoreShell>{children}</StoreShell>
      </body>
    </html>
  );
}
