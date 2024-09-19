/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  // your existing config
};

module.exports = withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: "dxd-llc",
    project: "font-converter",
  },
  {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
    disableLogger: true,
  }
);