"use client";

import { useEffect, useState } from "react";
import { Package, Tags, ImageIcon, Zap, Plus, ExternalLink } from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/config";

interface DashboardStats {
  products: number;
  banners: number;
  categories: number;
  active_deals: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
        const res = await fetch(`${API_BASE_URL}/api/admin/stats`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: "Total Products", value: stats?.products || 0, icon: Package, color: "bg-blue-50 text-blue-600", link: "/admin/products" },
    { title: "Categories", value: stats?.categories || 0, icon: Tags, color: "bg-blue-50 text-blue-600", link: "/admin/categories" },
    { title: "Banners", value: stats?.banners || 0, icon: ImageIcon, color: "bg-green-50 text-green-600", link: "/admin/banners" },
    { title: "Active Deals", value: stats?.active_deals || 0, icon: Zap, color: "bg-yellow-50 text-yellow-600", link: "/admin/deals" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard Overview</h1>
        <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" className="bg-[var(--primary)] hover:bg-[var(--secondary)] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm min-h-[44px]">
          <ExternalLink size={18} />
          View Live Site
        </a>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm p-6 mb-8">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/banners/new?placement=hero" className="flex items-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-4 py-2.5 rounded-lg font-medium transition-colors min-h-[44px]">
            <Plus size={18} /> Add Hero Banner
          </Link>
          <Link href="/admin/deals/new" className="flex items-center gap-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200 px-4 py-2.5 rounded-lg font-medium transition-colors min-h-[44px]">
            <Plus size={18} /> Add Top Deal
          </Link>
          <Link href="/admin/products/new" className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-4 py-2.5 rounded-lg font-medium transition-colors min-h-[44px]">
            <Plus size={18} /> Add Product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={index} href={stat.link} className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-[var(--text-primary)]">
                  {isLoading ? "..." : stat.value}
                </h3>
              </div>
              <div className={`p-4 rounded-full ${stat.color} group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm h-80 flex items-center justify-center">
          <p className="text-[var(--text-secondary)]">Recent Orders Chart (Coming Soon)</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm h-80 flex items-center justify-center">
          <p className="text-[var(--text-secondary)]">Sales Analytics (Coming Soon)</p>
        </div>
      </div>
    </div>
  );
}
