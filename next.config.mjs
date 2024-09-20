import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { withSentryConfig } from "@sentry/nextjs";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // ... other existing configurations ...
};

const sentryWebpackPluginOptions = {
  // ... existing Sentry options ...
};

export default withSentryConfig(withBundleAnalyzer(nextConfig), sentryWebpackPluginOptions);
