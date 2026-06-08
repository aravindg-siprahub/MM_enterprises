'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MessageCircle, X, Bell, ChevronRight, Package } from 'lucide-react';
import { getImageUrl } from '@/lib/imageUtils';

interface Conversation {
  id: string;
  product_name: string;
  product_image: string | null;
  product_slug: string | null;
  last_message: string | null;
  unread_count: number;
  updated_at: string;
}

interface Toast {
  id: string;
  message: string;
  productName: string;
  productSlug: string | null;
  productImage: string | null;
}

export default function NotificationBell() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [open, setOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const prevUnreadRef = useRef<Record<string, number>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch(`${API}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) return;
      const data: Conversation[] = await res.json();
      setConversations(data);

      // Detect NEW unread admin messages → show toast
      data.forEach((conv) => {
        const prev = prevUnreadRef.current[conv.id] ?? conv.unread_count;
        if (conv.unread_count > prev && conv.last_message) {
          const toast: Toast = {
            id: `${conv.id}-${Date.now()}`,
            message: conv.last_message,
            productName: conv.product_name,
            productSlug: conv.product_slug,
            productImage: conv.product_image,
          };
          setToasts((t) => [...t.slice(-2), toast]); // max 3 toasts
          // Auto-dismiss after 6 seconds
          setTimeout(() => {
            setToasts((t) => t.filter((x) => x.id !== toast.id));
          }, 6000);
        }
        prevUnreadRef.current[conv.id] = conv.unread_count;
      });
    } catch (_) {}
  }, [session, API]);

  // Poll every 2s
  useEffect(() => {
    if (!session) return;
    fetchConversations();
    const interval = setInterval(fetchConversations, 2000);
    return () => clearInterval(interval);
  }, [session, fetchConversations]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const totalUnread = conversations.reduce((s, c) => s + (c.unread_count || 0), 0);

  const handleOpenChat = (slug: string) => {
    const targetPath = `/products/${slug}`;
    if (window.location.pathname === targetPath) {
      // Same page: force hash and dispatch event manually
      window.location.hash = 'chat';
      setTimeout(() => window.dispatchEvent(new HashChangeEvent('hashchange')), 50);
    } else {
      // Different page: use Next.js router
      router.push(`${targetPath}#chat`);
    }
  };

  const openChat = (conv: Conversation) => {
    setOpen(false);
    if (conv.product_slug) {
      handleOpenChat(conv.product_slug);
    }
  };

  const dismissToast = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  // Don't render if not logged in
  if (!session) return null;

  return (
    <>
      {/* Bell Button */}
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Message notifications"
          className="relative p-2 text-foreground/80 hover:text-primary transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          {totalUnread > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 animate-pulse">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[200] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <span className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <Bell className="w-4 h-4 text-primary" />
                Messages
                {totalUnread > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {totalUnread} unread
                  </span>
                )}
              </span>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conversation List */}
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                <MessageCircle className="w-8 h-8 opacity-30" />
                <p className="text-xs">No conversations yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                {conversations.map((conv) => (
                  <li key={conv.id}>
                    <button
                      onClick={() => openChat(conv)}
                      className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group"
                    >
                      {/* Product image */}
                      {conv.product_image ? (
                        <img
                          src={getImageUrl(conv.product_image, "products")}
                          alt={conv.product_name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-slate-400" />
                        </div>
                      )}

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{conv.product_name}</p>
                        {conv.last_message ? (
                          <p className={`text-xs truncate mt-0.5 ${conv.unread_count > 0 ? 'text-slate-700 font-semibold' : 'text-slate-400'}`}>
                            {conv.last_message}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400 mt-0.5 italic">No messages yet</p>
                        )}
                      </div>

                      {/* Unread badge + arrow */}
                      <div className="flex items-center gap-1 shrink-0">
                        {conv.unread_count > 0 && (
                          <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {conv.unread_count}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-4 z-[300] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 bg-slate-900 text-white rounded-2xl shadow-2xl px-4 py-3 max-w-[320px] w-[320px] border border-slate-700 animate-in slide-in-from-right-8 duration-300"
          >
            {/* Product thumb */}
            {toast.productImage ? (
              <img
                src={getImageUrl(toast.productImage, "products")}
                alt={toast.productName}
                className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0 mt-0.5"
              />
            ) : (
              <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <MessageCircle className="w-5 h-5 text-slate-400" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                MM Enterprises · {toast.productName}
              </p>
              <p className="text-sm font-medium text-white leading-snug line-clamp-2">{toast.message}</p>
              {toast.productSlug && (
                <button
                  onClick={() => {
                    dismissToast(toast.id);
                    handleOpenChat(toast.productSlug!);
                  }}
                  className="mt-2 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                >
                  Open Chat <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-500 hover:text-white transition-colors shrink-0 mt-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
