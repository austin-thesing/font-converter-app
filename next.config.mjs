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
};

const sentryWebpackPluginOptions = {
  // project: undefined, // No project provided
  telemetry: true, // Enable telemetry data
  org: "dxd-llc", // Organization slug
  project: "font-converter", // Project slug
  authToken: process.env.SENTRY_AUTH_TOKEN, // Auth token for Sentry
  dsn: process.env.SENTRY_DSN,
};

export default withSentryConfig(withBundleAnalyzer(nextConfig), sentryWebpackPluginOptions);