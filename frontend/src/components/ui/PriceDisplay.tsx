interface Props {
  originalPrice: number;
  sellingPrice: number;
  discountPercent?: number | null;
  className?: string;
}

export default function PriceDisplay({ originalPrice, sellingPrice, discountPercent, className = "" }: Props) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // If no discount percent provided, calculate it
  const calcDiscount = discountPercent || Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-semibold text-lg text-[var(--text-primary)]">
        {formatPrice(sellingPrice)}
      </span>
      {originalPrice > sellingPrice && (
        <>
          <span className="text-sm text-[var(--text-secondary)] line-through">
            {formatPrice(originalPrice)}
          </span>
          {calcDiscount > 0 && (
            <span className="text-sm font-semibold text-[var(--success)]">
              {calcDiscount}% off
            </span>
          )}
        </>
      )}
    </div>
  );
}
