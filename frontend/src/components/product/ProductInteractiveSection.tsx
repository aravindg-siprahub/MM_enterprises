"use client";

import React, { useState, useEffect } from 'react';
import { ProductVariant } from '@/lib/types';
import ProductActions from './ProductActions';

interface Props {
  product: any;
  initialSellingPrice: number;
  initialOriginalPrice: number;
  initialDiscountPercent: number;
}

export default function ProductInteractiveSection({ product, initialSellingPrice, initialOriginalPrice, initialDiscountPercent }: Props) {
  const variants: ProductVariant[] = product.variants || [];
  
  // Group variants by type
  const variantGroups: Record<string, ProductVariant[]> = {};
  variants.forEach(v => {
    if (!variantGroups[v.variant_type]) {
      variantGroups[v.variant_type] = [];
    }
    variantGroups[v.variant_type].push(v);
  });

  // Default selection
  const defaultSelections: Record<string, string> = {};
  Object.keys(variantGroups).forEach(type => {
    const defaultVar = variantGroups[type].find(v => v.is_default);
    if (defaultVar) {
      defaultSelections[type] = defaultVar.id;
    } else if (variantGroups[type].length > 0) {
      defaultSelections[type] = variantGroups[type][0].id;
    }
  });

  const [selections, setSelections] = useState<Record<string, string>>(defaultSelections);

  // Find if a selected variant has a price override
  let currentPrice = initialSellingPrice;
  let currentOriginal = initialOriginalPrice;
  let currentDiscount = initialDiscountPercent;
  let currentStock = product.stock_qty;

  // For simplicity, if multiple variants have price overrides, we take the highest one or just the first one.
  // Usually, price overrides are absolute. Let's find the first selected variant that has a price override.
  for (const type in selections) {
    const selectedVariantId = selections[type];
    const variant = variantGroups[type]?.find(v => v.id === selectedVariantId);
    if (variant) {
      if (variant.price_override != null && variant.price_override > 0) {
        currentPrice = variant.price_override;
        // If there's an override, we might not know the new original price. 
        // We'll assume the discount percent remains the same, or we just remove the original price.
        // For now, let's keep it simple: just show the override price, no original price.
        currentOriginal = variant.price_override;
        currentDiscount = 0;
      }
      if (variant.stock_quantity !== undefined) {
         // Stock might be managed per variant
      }
    }
  }

  const handleSelect = (type: string, variantId: string) => {
    setSelections(prev => ({
      ...prev,
      [type]: variantId
    }));
  };

  return (
    <>
      {Object.keys(variantGroups).length > 0 && (
        <div className="mb-6 space-y-5">
          {Object.entries(variantGroups).map(([type, options]) => (
            <div key={type}>
              <h3 className="text-sm font-medium text-gray-900 mb-2">{type}</h3>
              <div className="flex flex-wrap gap-2">
                {options.map(opt => {
                  const isSelected = selections[type] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelect(type, opt.id)}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[13px] sm:text-sm rounded-lg border transition-all ${
                        isSelected 
                          ? 'border-[#2874f0] text-[#2874f0] bg-blue-50 font-medium' 
                          : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {opt.variant_value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pricing Area */}
      <div className="mb-8 p-4 sm:p-6 bg-white rounded-2xl border border-gray-200/60 shadow-sm">
        <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 mb-1">
          <span className="text-2xl sm:text-3xl font-medium text-[#1d1d1f] tracking-tight">
            ₹{currentPrice.toLocaleString('en-IN')}
          </span>
          {currentOriginal > currentPrice && (
            <>
              <span className="text-base sm:text-lg text-gray-400 line-through font-medium">
                ₹{currentOriginal.toLocaleString('en-IN')}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[#0066cc] bg-[#0066cc]/10 px-2 py-0.5 rounded-md">
                Save {currentDiscount}%
              </span>
            </>
          )}
        </div>
        <p className="text-[13px] text-gray-500 font-medium">MRP incl. of all taxes. Free shipping applied.</p>
      </div>

      <ProductActions product={product} />
    </>
  );
}
