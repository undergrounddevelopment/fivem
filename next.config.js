/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");
const path = require("path");

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  outputFileTracingRoot: path.join(__dirname),
  webpack: (config, { dev }) => {
    if (!dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },
  experimental: {
    scrollRestoration: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

module.exports = withSentryConfig(nextConfig, {
  org: "fivem-tools",
  project: "fivem-tools-v7",
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
})