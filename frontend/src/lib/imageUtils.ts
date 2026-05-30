const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rvgbmufelqtcthjhfmii.supabase.co";

export function getImageUrl(path: string | undefined | null, bucket: string = 'products'): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}
