export interface Category {
  id: string;
  name: string;
  slug: string;
  icon_url: string | null;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string;
  brand_id: string;
  original_price: number;
  selling_price: number;
  discount_percent: number | null;
  stock_qty: number;
  is_active: boolean;
  is_featured: boolean;
  is_top_deal: boolean;
  warranty_info: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  images: ProductImage[] | null;
  category: Category | null;
  brand: Brand | null;
}

export interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  cta_text: string | null;
  category_id: string | null;
  placement: string | null;
  is_active: boolean;
  sort_order: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

export interface Deal {
  id: string;
  product_id: string;
  deal_type: string | null;
  deal_price: number | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
  product: Product | null;
}

export interface HomepageData {
  hero_banners: Banner[];
  categories: Category[];
  featured_products: Product[];
  top_deals: Deal[];
  grab_or_gone: Deal[];
  brand_spotlight: Deal[];
  mid_banners: Banner[];
  mobiles_top_deals: Product[];
  appliances_featured: Product[];
  furniture_featured: Product[];
}
