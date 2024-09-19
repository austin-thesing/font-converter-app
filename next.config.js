/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... other config
  experimental: {
    instrumentationHook: true,
  },
}

module.exports = nextConfig