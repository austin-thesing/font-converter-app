import posthog from "posthog-js";

if (typeof window !== "undefined") {
  posthog.init("phc_nhPYPOxT9jz1oqujirV0zdAsNq2kTPQYQ0xY8231hvX", {
    api_host: "https://us.i.posthog.com", // usually 'https://app.posthog.com' or your self-hosted URL
  });
}

export default posthog;
