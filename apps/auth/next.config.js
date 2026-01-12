/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@tdc/ui', '@tdc/firebase', '@tdc/schemas', '@tdc/types'],
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['firebase', 'undici'],
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'undici'];
    
    // Fix for canvas module not found (react-pdf dependency)
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    return config;
  },
};

module.exports = nextConfig;
