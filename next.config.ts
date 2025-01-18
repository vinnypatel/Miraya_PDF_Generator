import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Disables ESLint checks during builds
  },
  // output: 'export',
  // images: {
  //   unoptimized: true,
  // },
  // basePath: '/NextJS_PdfGenerator', // Replace with your GitHub repository name
  // assetPrefix: '/NextJS_PdfGenerator', 
};

export default nextConfig;
