/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.wasm/,
      type: 'asset/resource'
    });
    return config;
  }
}

module.exports = nextConfig
