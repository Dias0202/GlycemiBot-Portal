import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";

// When accessed via glycomind.com.br, the web-app proxies /portal/* to this
// service. basePath + assetPrefix ensure all routes and static assets are
// served from the /portal prefix so the proxy can route them correctly.
const nextConfig: NextConfig = {
  basePath: "/portal",
  assetPrefix: "/portal",
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: "/health",
        destination: `${backendUrl}/health`,
      },
    ];
  },
};

export default nextConfig;
