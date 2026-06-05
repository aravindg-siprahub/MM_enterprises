'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { MessageSquare, Loader2, Send, ChevronRight, Package, User, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

const getAdminToken = () =>
  document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1] ?? '';

const fetcher = async (url: string) => {
  const token = getAdminToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export default function AdminMessages() {
  const [ready, setReady] = useState(false);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReady(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      if (id) setSelectedConvId(id);
    }
  }, []);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const { data: conversations, mutate: mutateConvs } = useSWR(
    ready ? `${API}/api/chat/admin/conversations` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  const { data: messages, mutate: mutateMsgs } = useSWR(
    selectedConvId && ready ? `${API}/api/chat/admin/conversations/${selectedConvId}/messages` : null,
    fetcher,
    { refreshInterval: 3000 }
  );

  // Mark as read when opening conversation or receiving new messages
  useEffect(() => {
    if (selectedConvId && ready && messages && messages.some((m: any) => m.sender_type === 'user' && !m.is_read)) {
      fetch(`${API}/api/chat/admin/conversations/${selectedConvId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getAdminToken()}` }
      }).then(() => mutateConvs());
    }
  }, [selectedConvId, messages, ready, mutateConvs]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => scrollToBottom(), [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedConvId) return;
    
    const msgText = message;
    setMessage('');
    
    // Optimistic UI update
    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      message: msgText,
      sender_type: 'admin',
      created_at: new Date().toISOString(),
      is_read: false
    };
    
    // Mutate local data immediately without revalidation
    mutateMsgs([...(messages || []), optimisticMsg], false);
    
    try {
      await fetch(`${API}/api/chat/admin/conversations/${selectedConvId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({ message: msgText })
      });
      mutateMsgs();
      mutateConvs();
    } catch (e) {
      console.error(e);
      setMessage(msgText);
      // Revert optimistic update
      mutateMsgs(messages, false);
    }
  };

  const selectedConv = conversations?.find((c: any) => c.id === selectedConvId);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white rounded-lg shadow-sm border border-slate-200">
      
      {/* Sidebar: Conversations List */}
      <div className={clsx(
        "border-r border-slate-200 flex flex-col bg-slate-50 transition-all",
        selectedConvId ? "hidden md:flex md:w-1/3 lg:w-1/4" : "w-full md:w-1/3 lg:w-1/4"
      )}>
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Messages
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {!conversations ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No conversations yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {conversations.map((conv: any) => {
                const unreadCount = conv.unread_count || 0;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={clsx(
                      "w-full text-left p-4 hover:bg-slate-100 transition-colors flex flex-col gap-2 relative",
                      selectedConvId === conv.id ? "bg-blue-50/50 hover:bg-blue-50" : ""
                    )}
                  >
                    {selectedConvId === conv.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary hidden md:block" />
                    )}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 truncate">
                        <User className="w-4 h-4 text-slate-400" />
                        {conv.customer_name || 'Customer'}
                      </div>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 w-full">
                      {conv.product_image ? (
                        <img src={conv.product_image} alt={conv.product_name} className="w-8 h-8 object-cover rounded shadow-sm shrink-0" />
                      ) : (
                        <div className="w-8 h-8 bg-slate-100 flex items-center justify-center rounded shrink-0">
                          <Package className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                      <div className="flex flex-col overflow-hidden w-full">
                         <span className="text-xs text-slate-600 truncate font-medium w-full">{conv.product_name || 'Unknown Product'}</span>
                         {conv.product_price && <span className="text-[10px] text-green-600 font-bold">₹{conv.product_price.toLocaleString('en-IN')}</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Area: Chat Window */}
      <div className={clsx(
        "flex-1 flex flex-col bg-white",
        selectedConvId ? "flex" : "hidden md:flex"
      )}>
        {!selectedConvId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a conversation to start chatting</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm z-10 flex-wrap gap-2">
              <div className="flex items-center gap-2 sm:gap-4 max-w-full">
                <button 
                  onClick={() => setSelectedConvId(null)}
                  className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors shrink-0"
                >
                  <ArrowLeft size={20} />
                </button>
                {selectedConv?.product_image ? (
                  <img src={selectedConv.product_image} alt="Product" className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-slate-200 shadow-sm shrink-0" />
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 shrink-0">
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0" />
                    <span className="truncate">{selectedConv?.customer_name || 'Customer'}</span>
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1 mt-0.5 sm:mt-1 truncate">
                    <span className="font-medium text-slate-700 truncate">{selectedConv?.product_name || 'Unknown Product'}</span>
                    {selectedConv?.product_price && (
                      <span className="ml-1 sm:ml-2 px-1.5 py-0.5 bg-green-50 text-green-700 rounded-full font-bold whitespace-nowrap">
                        ₹{selectedConv.product_price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {selectedConv?.product_slug && (
                <a href={`/products/${selectedConv.product_slug}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs sm:text-sm flex items-center gap-1 ml-auto">
                  <span className="hidden sm:inline">View Product</span>
                  <span className="sm:hidden">View</span>
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </a>
              )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 space-y-4 sm:space-y-6">
              {!messages ? (
                <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : messages.length === 0 ? (
                <div className="text-center text-slate-500 my-8">No messages in this conversation.</div>
              ) : (
                messages.map((msg: any) => {
                  const isAdmin = msg.sender_type === 'admin';
                  return (
                    <div key={msg.id} className={clsx("flex flex-col max-w-[85%] sm:max-w-[70%]", isAdmin ? "ml-auto items-end" : "mr-auto items-start")}>
                      <div className={clsx(
                        "px-3 sm:px-4 py-2 sm:py-3 shadow-sm text-sm whitespace-pre-wrap",
                        isAdmin 
                          ? "bg-slate-800 text-white rounded-2xl rounded-tr-sm" 
                          : "bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm"
                      )}>
                        {msg.message}
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-1 sm:mt-1.5 px-1">
                        {format(new Date(msg.created_at), 'MMM d, HH:mm')} {isAdmin && msg.is_read && '• Read'}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-3 sm:p-4 bg-white border-t border-slate-200">
              <div className="flex gap-2 sm:gap-3">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 min-h-[40px] sm:min-h-[48px] max-h-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-primary text-white rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
                </button>
              </div>
              <p className="hidden sm:block text-[10px] text-slate-400 mt-2 text-center">Press Enter to send, Shift+Enter for new line.</p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
