import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'export',

  images: {
    unoptimized: true, // Easiest way to use next/image with static export
  },
};

export default nextConfig;
