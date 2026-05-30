interface Props {
  discount: number;
  className?: string;
}

export default function DiscountBadge({ discount, className = "" }: Props) {
  if (discount <= 0) return null;
  
  return (
    <div className={`absolute top-2 left-2 bg-[var(--success)] text-white text-xs font-bold px-2 py-1 rounded shadow-sm z-10 ${className}`}>
      {discount}% OFF
    </div>
  );
}
