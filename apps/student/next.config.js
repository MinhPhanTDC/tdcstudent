/** @type {import('next').NextConfig} */
const nextConfig = {
  // Note: Static export removed due to dynamic routes
  // Firebase Hosting configured for SPA mode with rewrites
  trailingSlash: true,
  
  reactStrictMode: true,
  transpilePackages: ['@tdc/ui', '@tdc/firebase', '@tdc/schemas', '@tdc/types'],
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
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
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Optimize production builds
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;
