import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cache successfully optimized images for 24 hours — prevents re-hitting the optimizer on every request
    minimumCacheTTL: 86400,
    // Supabase Storage already serves WebP/AVIF via its own CDN, so we don't need Next.js to re-encode them.
    // By skipping unrecognized formats, we avoid the Turbopack image-worker DATA_CLONE_ERR crash.
    formats: ['image/webp'],
    remotePatterns: [
      { protocol: 'http', hostname: '127.0.0.1' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'rukminim2.flixcart.com' },
      { protocol: 'https', hostname: 'static-assets-web.flixcart.com' },
      { protocol: 'https', hostname: 'cdn.britannica.com' },
      { protocol: 'https', hostname: 'www.durian.in' },
      { protocol: 'https', hostname: 'fdn2.gsmarena.com' },
      { protocol: 'https', hostname: 'www.lg.com' },
      { protocol: 'https', hostname: 'images.samsung.com' },
      { protocol: 'https', hostname: 'whirlpoolindia.vtexassets.com' },
      { protocol: 'https', hostname: 'd3juy0z6sbe84.cloudfront.net' },
      { protocol: 'https', hostname: 'www.haier.com' },
      { protocol: 'https', hostname: 'www.wakefit.co' },
    ],
  },
};

export default nextConfig;
