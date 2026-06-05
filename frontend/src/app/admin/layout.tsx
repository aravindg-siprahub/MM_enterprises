"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Login page: render children only — login page has its own Toaster
  if (isLoginPage) {
    return <>{children}</>;
  }

  // All other admin pages: full dashboard shell
  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden">
      <AdminSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
