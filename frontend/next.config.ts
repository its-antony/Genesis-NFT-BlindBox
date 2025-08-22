import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 禁用严格模式以避免hydration问题
  reactStrictMode: false,
  // 实验性功能
  experimental: {
    // 禁用部分预渲染以避免hydration问题
    ppr: false,
  },
};

export default nextConfig;
