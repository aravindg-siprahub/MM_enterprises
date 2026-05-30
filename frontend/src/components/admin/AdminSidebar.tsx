"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  Award, 
  Image as ImageIcon, 
  Zap 
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Products", path: "/admin/products", icon: Package },
  { name: "Categories", path: "/admin/categories", icon: Tags },
  { name: "Brands", path: "/admin/brands", icon: Award },
  { name: "Banners", path: "/admin/banners", icon: ImageIcon },
  { name: "Deals", path: "/admin/deals", icon: Zap },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[var(--primary)] text-white flex-shrink-0 min-h-screen hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-blue-400/30">
        <span className="font-extrabold text-2xl tracking-tighter italic">MM</span>
        <span className="ml-1 font-medium text-yellow-400 tracking-wide">Admin</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
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
      
      <div className="p-4 border-t border-blue-400/30 text-xs text-blue-200">
        MM Enterprises v1.0
      </div>
    </aside>
  );
}
