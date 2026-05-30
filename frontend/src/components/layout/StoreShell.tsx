"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import CategoryPills from "@/components/home/CategoryPills";

export default function StoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    // Admin pages: render children directly — no store nav/footer
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <CategoryPills />
      <main className="flex-grow pb-28 md:pb-0">{children}</main>
      <Footer />
      <BottomNav />
    </>
  );
}
