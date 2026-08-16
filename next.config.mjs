/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
    serverActions: {
      // Gallery actions validate each image at 5 MB. Keep enough headroom for
      // multi-file FormData while retaining a bounded request size.
      bodySizeLimit: '25mb',
    },
  },
}

export default nextConfig
