const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors https://essentials.id https://essentials-tau.vercel.app",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
