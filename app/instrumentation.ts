import * as Sentry from "@sentry/nextjs";

export function register() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    // Add any other Sentry configuration options here
  });
}