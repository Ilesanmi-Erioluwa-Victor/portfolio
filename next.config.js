/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["@prisma/adapter-pg", "@prisma/client", "pg", "pg-connection-string"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        "@prisma/adapter-pg": "commonjs @prisma/adapter-pg",
        "@prisma/client": "commonjs @prisma/client",
        "pg": "commonjs pg",
        "pg-connection-string": "commonjs pg-connection-string",
      });
    }
    // Fix for pg/pg-connection-string requiring Node.js built-ins
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
      dns: false,
      util: false,
      "util/types": false,
    };
    return config;
  },
};

module.exports = nextConfig;