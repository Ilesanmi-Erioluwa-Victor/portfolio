/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["@prisma/adapter-pg", "@prisma/client", "pg", "pg-connection-string"],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) return config;
    // Always externalize pg-related packages for both server and client
    config.externals = config.externals || [];
    const pgExternals = {
      "@prisma/adapter-pg": "commonjs @prisma/adapter-pg",
      "@prisma/client": "commonjs @prisma/client",
      "pg": "commonjs pg",
      "pg-connection-string": "commonjs pg-connection-string",
    };
    
    if (Array.isArray(config.externals)) {
      config.externals.push(pgExternals);
    } else if (typeof config.externals === 'function') {
      const originalExternals = config.externals;
      config.externals = (context, request, callback) => {
        if (pgExternals[request]) {
          return callback(null, pgExternals[request]);
        }
        return originalExternals(context, request, callback);
      };
    } else {
      config.externals = { ...config.externals, ...pgExternals };
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
      child_process: false,
      "pg-native": false,
    };

    return config;
  },
};

module.exports = nextConfig;