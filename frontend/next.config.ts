/** @type {import('next').NextConfig} */
const nextConfig = {
    
    webpack: (config:any) => {
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
      
  }
};

module.exports = nextConfig;