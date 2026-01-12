/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Firebase Hosting
  output: 'export',
  trailingSlash: true,
  
  reactStrictMode: true,
  transpilePackages: ['@tdc/ui', '@tdc/firebase', '@tdc/schemas', '@tdc/types'],
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['firebase', 'undici'],
    optimizePackageImports: ['@tdc/ui', '@tdc/firebase', '@tdc/schemas'],
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'undici'];
    
    // Fix for canvas module not found (react-pdf dependency)
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    return config;
  },
  // Optimize production builds
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;
