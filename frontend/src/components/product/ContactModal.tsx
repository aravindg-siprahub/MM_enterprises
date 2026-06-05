'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Phone, Mail, MessageCircle, Camera, MapPin, Star, ShieldCheck, Package, Users, Store } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
}

const STORE = {
  name: 'MM Enterprises',
  subtitle: 'Trusted Electronics Store',
  location: 'Kalikiri, Annamayya Dist., AP',
  address: '#6-477/1, T.B. Road, Kalikiri, AP - 517234',
  phone1: '9032320255',
  phone1Display: '+91 90323 20255',
  phone2: '8919572478',
  phone2Display: '+91 89195 72478',
  email: 'aravindkumar21a@gmail.com',
  instagram: 'm_m_enterprises_11',
  instagramUrl: 'https://www.instagram.com/m_m_enterprises_11/',
};

const TRUST = [
  { icon: ShieldCheck, label: 'Genuine Products' },
  { icon: Package,     label: 'Warranty Available' },
  { icon: Users,       label: 'Direct Owner Support' },
  { icon: Store,       label: 'Store Pickup Available' },
];

export default function ContactModal({ isOpen, onClose, productName }: ContactModalProps) {
  const [chatClicked, setChatClicked] = useState(false);

  const whatsappMsg = encodeURIComponent(
    `Hi MM Enterprises! I'm interested in: *${productName}*. Please share the best price and availability.`
  );

  const contactRows = [
    {
      id: 'call',
      icon: Phone,
      label: 'Call Now',
      value: STORE.phone1Display,
      href: `tel:+91${STORE.phone1}`,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      external: false,
    },
    {
      id: 'whatsapp',
      icon: MessageCircle,
      label: 'WhatsApp',
      value: STORE.phone1Display,
      href: `https://wa.me/91${STORE.phone1}?text=${whatsappMsg}`,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      external: true,
    },
    {
      id: 'email',
      icon: Mail,
      label: 'Email',
      value: STORE.email,
      href: `mailto:${STORE.email}?subject=Inquiry: ${encodeURIComponent(productName)}`,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      external: false,
    },
    {
      id: 'instagram',
      icon: Camera,
      label: 'Instagram',
      value: `@${STORE.instagram}`,
      href: STORE.instagramUrl,
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600',
      external: true,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 gap-0 border-0 shadow-2xl rounded-3xl overflow-hidden max-w-sm w-[calc(100%-2rem)] max-h-[90dvh] overflow-y-auto">

        {/* ── Seller Card ── */}
        <div className="px-5 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-white font-black text-2xl tracking-tighter leading-none">M</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="font-extrabold text-base text-slate-900 tracking-tight leading-tight">{STORE.name}</h2>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                <span className="text-xs text-slate-500 font-medium">{STORE.subtitle}</span>
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-500 truncate">{STORE.location}</span>
              </div>
            </div>

            {/* Availability pill */}
            <div className="flex-shrink-0 flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-full px-3 py-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 animate-pulse" />
              <span className="text-[11px] font-bold text-green-700 whitespace-nowrap">Open</span>
            </div>
          </div>
        </div>

        {/* ── Product Inquiry Banner ── */}
        <div className="mx-4 mt-4 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Interested In</p>
          <p className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug">{productName}</p>
        </div>

        {/* ── Contact Action Rows ── */}
        <div className="px-4 pt-4 space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Contact Seller</p>
          {contactRows.map((row) => (
            <a
              key={row.id}
              href={row.href}
              target={row.external ? '_blank' : undefined}
              rel={row.external ? 'noopener noreferrer' : undefined}
              className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200 active:scale-[0.99] transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl ${row.iconBg} flex items-center justify-center flex-shrink-0`}>
                <row.icon className={`w-5 h-5 ${row.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs text-slate-400 font-semibold leading-none mb-1">{row.label}</p>
                <p className="text-sm font-bold text-slate-900 truncate">{row.value}</p>
              </div>
              <svg className="w-4 h-4 text-slate-300 group-hover:text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}

          {/* ── Alternate Number ── */}
          <a
            href={`tel:+91${STORE.phone2}`}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 active:scale-[0.99] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs text-slate-400 font-semibold leading-none mb-1">Alternate Number</p>
              <p className="text-sm font-bold text-slate-700">{STORE.phone2Display}</p>
            </div>
            <svg className="w-4 h-4 text-slate-300 group-hover:text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>

          {/* ── Chat Placeholder ── */}
          <button
            onClick={() => setChatClicked(true)}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 active:scale-[0.99] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-violet-500" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs text-slate-400 font-semibold leading-none mb-1">Chat with Seller</p>
              <p className="text-sm font-bold text-slate-900">
                {chatClicked ? '🚧 Coming Soon — Stay tuned!' : 'Start a conversation'}
              </p>
            </div>
            <span className="text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-1 rounded-full flex-shrink-0">
              Soon
            </span>
          </button>
        </div>

        {/* ── Trust Indicators ── */}
        <div className="mx-4 mt-4 mb-5 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 grid grid-cols-2 gap-y-2 gap-x-3">
          {TRUST.map((t) => (
            <div key={t.label} className="flex items-center gap-2">
              <t.icon className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              <span className="text-xs text-slate-600 font-medium leading-tight">{t.label}</span>
            </div>
          ))}
        </div>

      </DialogContent>
    </Dialog>
  );
}
