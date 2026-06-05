"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export interface WishlistItem {
  id: string;
  name: string;
  slug: string;
  selling_price: number;
  original_price: number;
  image_url: string;
  discount_percent: number | null;
}

interface WishlistContextType {
  items: WishlistItem[];
  toggleWishlist: (item: WishlistItem) => void;
  isWishlisted: (id: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("mm_wishlist");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse wishlist from local storage");
      }
    }
  }, []);

  // Save to local storage whenever items change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("mm_wishlist", JSON.stringify(items));
    }
  }, [items, isMounted]);

  const toggleWishlist = (item: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        toast.success("Removed from wishlist");
        return prev.filter((i) => i.id !== item.id);
      } else {
        toast.success("Added to wishlist");
        return [...prev, item];
      }
    });
  };

  const isWishlisted = (id: string) => {
    return items.some((item) => item.id === id);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        toggleWishlist,
        isWishlisted,
        wishlistCount: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
