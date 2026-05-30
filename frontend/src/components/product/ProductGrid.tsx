import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function ProductGrid({ children, className = "" }: Props) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${className}`}>
      {children}
    </div>
  );
}
