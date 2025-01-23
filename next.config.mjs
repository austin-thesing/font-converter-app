
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
  webSocketTimeout: 30000,
  experimental: {
    webpackBuildWorker: true,
  },
  // Required for Replit
  hostname: "0.0.0.0"
};

const sentryWebpackPluginOptions = {
  org: "dxd-llc",
  project: "font-converter",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
