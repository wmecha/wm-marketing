import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Marketing assets may be served from wallacemecha CDN or Vercel blob
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.wallacemecha.com' },
      { protocol: 'https', hostname: 'blob.vercel-storage.com' },
    ],
  },
}

export default nextConfig
