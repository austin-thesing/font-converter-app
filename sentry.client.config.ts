import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  autoSessionTracking: false,
  enabled: process.env.NODE_ENV === "production",
});
