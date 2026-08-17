/** @type {import('next').NextConfig} */
const remotePatterns = []
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

if (supabaseUrl) {
  try {
    const url = new URL(supabaseUrl)
    remotePatterns.push({
      protocol: url.protocol.replace(':', ''),
      hostname: url.hostname,
      port: url.port,
      pathname: '/storage/v1/object/**',
    })
  } catch {
    // Supabase client creation will surface an invalid project URL separately.
  }
}

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
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
