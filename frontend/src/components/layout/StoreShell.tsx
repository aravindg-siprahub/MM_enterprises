"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CategoryPills from "@/components/home/CategoryPills";
import AuthModal from "@/components/ui/AuthModal";

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
      <main className="flex-grow">{children}</main>
      <Footer />
      <AuthModal />
    </>
  );
}
