import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false, // Enable TypeScript checking in production
  },
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint checking in production
  },
  
  // Production optimization
  productionBrowserSourceMaps: false,
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Performance optimizations
  reactStrictMode: true,
  
  // Output configuration - static export untuk Cloudflare Pages
  output: 'export',
  generateEtags: false,
  trailingSlash: true,
  
  // Disable Image Optimization untuk static export
  images: {
    unoptimized: true,
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;