/** @type {import('next').NextConfig} */
const nextConfig = {
  // This will build a standalone output
  output: 'standalone',
  experimental: {
    // Generate standalone with middleware
    instrumentationHook: true,
  },
}

module.exports = nextConfig 