import type { NextConfig } from "next";
import path from "node:path";
const nextConfig: NextConfig = {
  transpilePackages: ["@athena/shared", "@athena/engine3d", "@athena/brand"],
  devIndicators: false,
  outputFileTracingRoot: path.resolve(__dirname, "../.."),
  async rewrites() {
    return process.env.NODE_ENV === "development"
      ? [{ source: "/api/:path*", destination: "http://127.0.0.1:4000/api/:path*" }]
      : [];
  },
};
export default nextConfig;
