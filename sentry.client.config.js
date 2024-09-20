import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  org: "dxd-llc",
  project: "font-converter",
  // other configuration options
});