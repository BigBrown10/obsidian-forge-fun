import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://4.180.228.169:3001/api/:path*', // Proxy to Backend on VM
      },
    ]
  },
};

export default nextConfig;
