import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: "loose",
  },
  env: {
    CLOUDFLARE_ENDPOINT: process.env.CLOUDFLARE_ENDPOINT,
    CLOUDFLARE_ACCESS_KEY_ID: process.env.CLOUDFLARE_ACCESS_KEY_ID,
    CLOUDFLARE_SECRET_ACCESS_KEY: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
    CLOUDFLARE_BUCKET_NAME: process.env.CLOUDFLARE_BUCKET_NAME,
    PUBLIC_BUCKET_URL: process.env.CLOUDFLARE_PUBLIC_URL,
  },
  transpilePackages: ["opentype.js", "wawoff2", "@aws-sdk/client-s3", "@aws-sdk/s3-request-presigner"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    // Add rule for .wasm files
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });
    return config;
  },
};

export default nextConfig;
