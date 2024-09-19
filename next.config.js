/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... other config
  experimental: {
    instrumentationHook: false,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    config.ignoreWarnings = [
      { message: /Critical dependency: the request of a dependency is an expression/ }
    ];

    return config;
  },
};

module.exports = nextConfig