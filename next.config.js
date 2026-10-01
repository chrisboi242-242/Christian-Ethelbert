// Every browser request to /api/... is forwarded to the FastAPI server.
// The browser only ever talks to this site, so the login cookie stays first-party and safe.
module.exports = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${process.env.BACKEND_URL || "http://localhost:8000"}/:path*` }];
  },
};
