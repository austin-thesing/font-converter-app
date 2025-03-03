
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    return config;
  },
  experimental: {
    webpackBuildWorker: true
  },
  output: 'standalone',
  // Make sure routing works properly
  trailingSlash: false,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  }
};

const sentryWebpackPluginOptions = {
  org: "dxd-llc",
  project: "font-converter",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
