/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: "loose",
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
  api: {
    bodyParser: {
      sizeLimit: "10mb", // Adjust this value as needed
    },
  },
};

export default nextConfig;

//updated
