'use client';

import React from 'react';
import { Cpu, Camera, Smartphone, Battery, HardDrive, CheckCircle2 } from 'lucide-react';

interface Props {
  summary?: string;
  description?: string;
}

export default function ProductHighlights({ summary, description }: Props) {
  const content = summary || description || '';
  
  // Try to split by bullet point character
  let parts = content.split('•');
  
  // If no bullets, try splitting by HTML list items or line breaks
  if (parts.length === 1) {
    parts = content.split(/<li>|<br\s*\/?>|\n/i);
  }
  
  // If still no distinct parts, just render it as normal prose
  if (parts.length <= 1) {
    return (
      <div 
        className="prose prose-sm prose-slate max-w-none text-gray-600 leading-relaxed font-medium" 
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    );
  }

  // Clean HTML tags from the strings
  const cleanText = (html: string) => {
    return html.replace(/<\/?[^>]+(>|$)/g, "").trim();
  };

  const intro = cleanText(parts[0]);
  const bullets = parts.slice(1).map(p => cleanText(p)).filter(Boolean);

  const getIcon = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('camera') || lower.includes('lens') || lower.includes('mp') || lower.includes('megapixel')) return <Camera className="w-5 h-5 text-slate-700" />;
    if (lower.includes('processor') || lower.includes('chip') || lower.includes('core') || lower.includes('snapdragon') || lower.includes('bionic')) return <Cpu className="w-5 h-5 text-slate-700" />;
    if (lower.includes('display') || lower.includes('screen') || lower.includes('inch') || lower.includes('amoled') || lower.includes('retina') || lower.includes('oled')) return <Smartphone className="w-5 h-5 text-slate-700" />;
    if (lower.includes('battery') || lower.includes('mah') || lower.includes('charging') || lower.includes('charge')) return <Battery className="w-5 h-5 text-slate-700" />;
    if (lower.includes('ram') || lower.includes('rom') || lower.includes('storage') || lower.includes('gb') || lower.includes('memory')) return <HardDrive className="w-5 h-5 text-slate-700" />;
    return <CheckCircle2 className="w-5 h-5 text-slate-700" />;
  };

  // If there's an intro paragraph but no bullets (somehow filtered out), fallback
  if (bullets.length === 0) {
    return (
      <div 
        className="prose prose-sm prose-slate max-w-none text-gray-600 leading-relaxed font-medium" 
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    );
  }

  const [showFullIntro, setShowFullIntro] = React.useState(false);

  return (
    <div className="flex flex-col">
      {intro && (
        <div className="mb-6">
          <p className={`text-sm text-gray-600 leading-relaxed font-medium ${showFullIntro ? '' : 'line-clamp-3'}`}>
            {intro}
          </p>
          {intro.length > 150 && (
            <button 
              onClick={() => setShowFullIntro(!showFullIntro)}
              className="text-[#0066cc] text-sm font-semibold mt-1 hover:underline focus:outline-none"
            >
              {showFullIntro ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}
      <ul className="flex flex-col gap-4">
        {bullets.map((bullet, idx) => (
          <li key={idx} className="flex items-center gap-4 group">
            <div className="flex-shrink-0 w-11 h-11 rounded-[14px] bg-[#f0f5fa] group-hover:bg-[#e4eff8] transition-colors flex items-center justify-center">
              {getIcon(bullet)}
            </div>
            <span className="text-[14px] sm:text-[15px] text-slate-800 font-medium leading-snug">{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
