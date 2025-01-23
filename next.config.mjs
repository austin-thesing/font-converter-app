
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
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: `http://0.0.0.0:3000/:path*`
      }
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
