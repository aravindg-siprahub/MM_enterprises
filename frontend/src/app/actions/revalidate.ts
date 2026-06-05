'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

export async function revalidateProduct(slug?: string) {
  if (slug) {
    revalidatePath(`/products/${slug}`)
  }
  revalidatePath('/products')
  // Revalidate the entire site cache since a product change affects
  // the homepage, categories, search, etc.
  revalidatePath('/', 'layout')
}

export async function revalidateAll() {
  revalidatePath('/', 'layout')
}
