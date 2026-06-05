"use client";

import { useEffect, useState } from "react";
import { Package, Tags, ImageIcon, Zap, Plus, ExternalLink, MessageSquare, User, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/config";
import { formatDistanceToNow } from "date-fns";

interface DashboardStats {
  total_products: number;
  active_banners: number;
  total_categories: number;
  active_deals: number;
}

interface Inquiry {
  id: string;
  customer_name: string | null;
  product_name: string | null;
  product_image: string | null;
  product_price: number | null;
  last_message: string | null;
  unread_count: number;
  updated_at: string;
}

function RecentInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("admin_token="))
          ?.split("=")[1];
        const res = await fetch(
          `${API_BASE_URL}/api/chat/admin/conversations?limit=8`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setInquiries(data);
        }
      } catch (err) {
        console.warn("Failed to fetch inquiries", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, []);

  return (
    <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm mt-8 overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-slate-50/50">
        <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
          <MessageSquare size={20} className="text-[var(--primary)]" />
          Recent Inquiries
        </h2>
        <Link
          href="/admin/messages"
          className="text-sm text-[var(--primary)] hover:underline font-medium flex items-center gap-1"
        >
          View All <ChevronRight size={16} />
        </Link>
      </div>

      {/* Panel Body */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-7 h-7 animate-spin text-slate-400" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
          <MessageSquare size={36} className="opacity-30" />
          <p className="text-sm">No customer inquiries yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {inquiries.map((inq) => (
            <li key={inq.id}>
              <Link
                href={`/admin/messages?id=${inq.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
              >
                {/* Product Thumbnail */}
                {inq.product_image ? (
                  <img
                    src={inq.product_image}
                    alt={inq.product_name ?? "Product"}
                    className="w-11 h-11 rounded-lg object-cover border border-slate-200 shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 shrink-0">
                    <Package size={20} className="text-slate-400" />
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <User size={13} className="text-slate-400 shrink-0" />
                    <span className="text-sm font-semibold text-slate-800 truncate">
                      {inq.customer_name || "Customer"}
                    </span>
                    {inq.unread_count > 0 && (
                      <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                        {inq.unread_count} new
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    <span className="font-medium text-slate-700">
                      {inq.product_name || "Unknown Product"}
                    </span>
                    {inq.product_price && (
                      <span className="ml-2 text-green-600 font-bold">
                        ₹{inq.product_price.toLocaleString("en-IN")}
                      </span>
                    )}
                  </p>
                  {inq.last_message && (
                    <p className="text-xs text-slate-400 truncate mt-0.5 italic">
                      &ldquo;{inq.last_message}&rdquo;
                    </p>
                  )}
                </div>

                {/* Time + Arrow */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:block">
                    {inq.updated_at
                      ? formatDistanceToNow(new Date(inq.updated_at), {
                          addSuffix: true,
                        })
                      : ""}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[var(--primary)] group-hover:text-white flex items-center justify-center transition-colors text-slate-400">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("admin_token="))
          ?.split("=")[1];
        const res = await fetch(`${API_BASE_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.warn("Failed to fetch stats (backend might be offline)", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Products",
      value: stats?.total_products || 0,
      icon: Package,
      color: "bg-blue-50 text-blue-600",
      link: "/admin/products",
    },
    {
      title: "Categories",
      value: stats?.total_categories || 0,
      icon: Tags,
      color: "bg-blue-50 text-blue-600",
      link: "/admin/categories",
    },
    {
      title: "Banners",
      value: stats?.active_banners || 0,
      icon: ImageIcon,
      color: "bg-green-50 text-green-600",
      link: "/admin/banners",
    },
    {
      title: "Active Deals",
      value: stats?.active_deals || 0,
      icon: Zap,
      color: "bg-yellow-50 text-yellow-600",
      link: "/admin/deals",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Dashboard Overview
        </h1>
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[var(--primary)] hover:bg-[var(--secondary)] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm min-h-[44px]"
        >
          <ExternalLink size={18} />
          View Live Site
        </a>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm p-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/banners/new?placement=hero"
            className="flex items-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-4 py-2.5 rounded-lg font-medium transition-colors min-h-[44px]"
          >
            <Plus size={18} /> Add Hero Banner
          </Link>
          <Link
            href="/admin/deals/new"
            className="flex items-center gap-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200 px-4 py-2.5 rounded-lg font-medium transition-colors min-h-[44px]"
          >
            <Plus size={18} /> Add Top Deal
          </Link>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-4 py-2.5 rounded-lg font-medium transition-colors min-h-[44px]"
          >
            <Plus size={18} /> Add Product
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              href={stat.link}
              className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group"
            >
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">
                  {stat.title}
                </p>
                <h3 className="text-3xl font-bold text-[var(--text-primary)]">
                  {isLoading ? "..." : stat.value}
                </h3>
              </div>
              <div
                className={`p-4 rounded-full ${stat.color} group-hover:scale-110 transition-transform`}
              >
                <Icon size={24} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Inquiries */}
      <RecentInquiries />
    </div>
  );
}
