/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  images: {
    domains: ['localhost', 'minio', 's3.amazonaws.com'],
    formats: ['image/webp', 'image/avif'],
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },

  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

module.exports = nextConfig;