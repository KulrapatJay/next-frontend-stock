import type { NextConfig } from "next";
import path from "node:path";

const backendUrl = (process.env.BACKEND_URL ?? "http://localhost:8080").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: path.resolve(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Entry: proxy.ts sends visitors without a session cookie on to /login
  async redirects() {
    return [{ source: "/", destination: "/dashboard", permanent: false }];
  },
  // Same-origin proxy to Go API
  async rewrites() {
    return [
      { source: "/api/v1/:path*", destination: `${backendUrl}/api/v1/:path*` },
      { source: "/docs/:path*", destination: `${backendUrl}/docs/:path*` },
      { source: "/swagger.json", destination: `${backendUrl}/swagger.json` },
      { source: "/swagger.yaml", destination: `${backendUrl}/swagger.yaml` },
    ];
  },
};

export default nextConfig;
