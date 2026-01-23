/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://essentials.id https://essentials-tau.vercel.app",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
