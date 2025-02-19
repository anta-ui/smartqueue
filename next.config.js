/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour Webpack
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 8192,
          fallback: 'file-loader',
          publicPath: '/_next/static/media/',
          outputPath: 'static/media/',
          name: '[name].[hash].[ext]',
        }
      }
    });
    return config;
    
  },
  transpilePackages: ['leaflet', 'react-leaflet'],

  // Configuration pour Turbopack
  experimental: {
    turbo: {
      rules: {
        // Configuration équivalente pour Turbopack
        '*.woff': { loaders: ['url-loader'] },
        '*.woff2': { loaders: ['url-loader'] },
        '*.eot': { loaders: ['url-loader'] },
        '*.ttf': { loaders: ['url-loader'] },
        '*.otf': { loaders: ['url-loader'] },
      },
    },
  },
};

module.exports = nextConfig; 