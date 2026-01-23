const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors https://essentials.id",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
