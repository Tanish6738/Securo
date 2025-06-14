/** @type {import('next').NextConfig} */
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer, webpack }) => {
    // Handle PDF.js and pdf-lib libraries
    if (!isServer) {
      // Add polyfills for Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: 'buffer',
        canvas: false,
        encoding: false,
        fs: false,
        path: false,
        stream: false,
        util: false,
        crypto: false,
        zlib: false,
        http: false,
        https: false,
        url: false,
      };
      
      // Add buffer global polyfill
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        })
      );
      
      // Improve chunk loading for dynamic imports
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            pdf: {
              test: /[\\/]node_modules[\\/](pdf-lib|pdfjs-dist|buffer|tesseract\.js)[\\/]/,
              name: 'pdf-libraries',
              chunks: 'all',
              priority: 10,
            },
          },
        },
      };
    }
    
    // Handle .mjs files properly
    config.module.rules.push({
      test: /\.mjs$/,
      type: 'javascript/auto',
    });
      return config;  },
  
  // Ensure static files are served properly
};

export default nextConfig;
