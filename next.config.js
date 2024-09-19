const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
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

    // Enable module concatenation
    config.optimization.concatenateModules = true;

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);