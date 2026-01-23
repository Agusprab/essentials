const nextConfig = {
  async headers() {
    // Only apply restrictive headers in production
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: "/(.*)",
          headers: [
            {
              key: "Content-Security-Policy",
              value: "frame-ancestors https://essentials.id https://essentials-tau.vercel.app",
            },
          ],
        },
      ];
    }
    // In development, allow all for easier testing
    return [];
  },
};

module.exports = nextConfig;
