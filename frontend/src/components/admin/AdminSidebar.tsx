"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  Award, 
  Image as ImageIcon, 
  Zap,
  MessageSquare
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Messages", path: "/admin/messages", icon: MessageSquare },
  { name: "Products", path: "/admin/products", icon: Package },
  { name: "Categories", path: "/admin/categories", icon: Tags },
  { name: "Brands", path: "/admin/brands", icon: Award },
  { name: "Banners", path: "/admin/banners", icon: ImageIcon },
  { name: "Deals", path: "/admin/deals", icon: Zap },
];

import { useEffect } from "react";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (isOpen && onClose) {
      onClose();
    }
  }, [pathname]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[var(--primary)] text-white flex flex-col h-full
        transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-blue-400/30">
          <div>
            <span className="font-extrabold text-2xl tracking-tighter italic">MM</span>
            <span className="ml-1 font-medium text-yellow-400 tracking-wide">Admin</span>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors font-medium text-sm
                  ${isActive 
                    ? "bg-white text-[var(--primary)] shadow-sm" 
                    : "text-blue-100 hover:bg-blue-700/50 hover:text-white"
                  }
                `}
              >
                <Icon size={18} className={isActive ? "text-[var(--primary)]" : "text-blue-200"} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-blue-400/30 text-xs text-blue-200 mt-auto">
          MM Enterprises v1.0
        </div>
      </aside>
    </>
  );
}
