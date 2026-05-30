import { HomepageData } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function getHomepage() {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/homepage`,
      { next: { revalidate: 30 } }
    )
    if (!res.ok) {
      console.error('Homepage API failed:', res.status)
      return null
    }
    return res.json()
  } catch (e) {
    console.error('Homepage fetch error:', e)
    return null
  }
}

export async function getCategories() {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/categories`,
      { next: { revalidate: 30 } }
    )
    if (!res.ok) return []
    return res.json()
  } catch (e) {
    return []
  }
}

export async function getCategoryProducts(
  categorySlug: string,
  params?: { brand?: string; sort?: string; page?: number; limit?: number }
) {
  const searchParams = new URLSearchParams({
    category: categorySlug,
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 24),
    ...(params?.brand && { brand: params.brand }),
    ...(params?.sort && { sort: params.sort }),
  })
  const res = await fetch(
    `${API_BASE_URL}/api/products?${searchParams}`,
    { next: { revalidate: 30 } }
  )
  if (!res.ok) return { data: [], total: 0, page: 1, limit: 24 }
  return res.json()
}

export async function getCategoryBanners(placement: string) {
  const res = await fetch(
    `${API_BASE_URL}/api/banners?placement=${placement}`,
    { next: { revalidate: 30 } }
  )
  if (!res.ok) return []
  return res.json()
}

export async function getProductBySlug(slug: string) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/products/${slug}`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return null
    return res.json()
  } catch (e) {
    return null
  }
}

export async function getSimilarProducts(slug: string) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/products/${slug}/similar`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return []
    return res.json()
  } catch (e) {
    return []
  }
}

export async function getAiRecommendations(slug: string) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/products/${slug}/recommendations`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    return res.json()
  } catch (e) {
    return []
  }
}
