import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

const sentryWebpackPluginOptions = {
  org: "dxd-llc", // Make sure this matches your Sentry organization slug
  project: "font-converter",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true, // Suppresses all logs
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);