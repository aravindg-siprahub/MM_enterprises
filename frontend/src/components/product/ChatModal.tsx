'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import useSWR from 'swr';
import clsx from 'clsx';
import { format } from 'date-fns';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ChatModal({ productId, productName }: { productId: string, productName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [session, setSession] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: authListener } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => authListener.subscription.unsubscribe();
  }, []);

  // Hash-based open trigger
  useEffect(() => {
    const handleHash = async () => {
      if (window.location.hash === '#chat') {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!s) {
          window.location.hash = '#login';
          return;
        }
        setSession(s);
        setIsOpen(true);
        window.history.replaceState(null, '', window.location.pathname);
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const fetcher = async (url: string) => {
    const { data: { session: s } } = await supabase.auth.getSession();
    if (!s) throw new Error('Not authenticated');
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${s.access_token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  };

  // Single SWR call that handles both loading the chat initially and polling!
  const { data, mutate } = useSWR(
    isOpen && session ? `${API}/api/chat/product/${productId}` : null,
    fetcher,
    { refreshInterval: 2000 }
  );

  const activeConv = data?.conversation;
  const messages = data?.messages;

  // Mark messages as read when the chat is open and active
  useEffect(() => {
    if (isOpen && activeConv && session && messages) {
      const hasUnread = messages.some((m: any) => m.sender_type === 'admin' && !m.is_read);
      if (hasUnread) {
        fetch(`${API}/api/chat/conversations/${activeConv.id}/read`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${session.access_token}` }
        }).then(res => {
          if (res.ok) mutate();
        }).catch(console.error);
      }
    }
  }, [isOpen, activeConv, session, messages, mutate]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeConv || !session) return;

    const msgText = message;
    setMessage('');

    // Optimistic update
    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      message: msgText,
      sender_type: 'user',
      created_at: new Date().toISOString(),
      is_read: false,
    };
    
    mutate({ ...data, messages: [...(messages || []), optimisticMsg] }, false);

    try {
      const res = await fetch(`${API}/api/chat/conversations/${activeConv.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ message: msgText }),
      });
      if (res.ok) {
        mutate();
      }
    } catch (e) {
      console.error(e);
      setMessage(msgText);
      mutate(data, false); // Revert optimistic update
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full sm:w-[400px] h-[85vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-300">

        {/* Header */}
        <div className="bg-slate-900 px-4 py-3 flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white leading-tight">MM Enterprises</h3>
              <p className="text-xs text-slate-300">Typically replies in few mins</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 text-white/70 hover:text-white bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Context */}
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center gap-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inquiring about:</p>
          <p className="text-sm font-bold text-slate-800 truncate">{productName}</p>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 space-y-4">
          {!data ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : messages?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 opacity-50">
              <MessageCircle className="w-12 h-12 mb-3 text-slate-400" />
              <p className="text-slate-500 font-medium">Send a message to inquire about this product.</p>
            </div>
          ) : (
            messages?.map((msg: any) => (
              <div key={msg.id} className={clsx("flex flex-col max-w-[85%]", msg.sender_type === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
                <div className={clsx(
                  "px-4 py-2.5 rounded-2xl shadow-sm text-sm w-fit whitespace-pre-wrap break-words",
                  msg.sender_type === 'user' ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-white border border-slate-100 text-slate-800 rounded-bl-sm"
                )}>
                  {msg.message}
                </div>
                <span className="text-[10px] font-medium text-slate-400 mt-1 px-1">
                  {format(new Date(msg.created_at), 'HH:mm')} {msg.sender_type === 'user' && msg.is_read && '• Read'}
                </span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={sendMessage} className="p-3 bg-white border-t border-slate-100 flex items-end gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 max-h-32 min-h-[44px] bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
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
            disabled={!message.trim() || !activeConv}
            className="w-11 h-11 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
