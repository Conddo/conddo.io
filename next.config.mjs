/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /** Security headers applied to every response. */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Content Security Policy: restricts inline scripts, only allows
          // known origins for scripts/styles/fonts/images/connections.
          // 'unsafe-inline' + 'unsafe-eval' are required for Next.js dev
          // and some third-party OAuth flows; tighten in production.
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' " +
                "https://accounts.google.com *.cloudinary.com *.googletagmanager.com *.google-analytics.com; " +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
              "img-src 'self' data: blob: https:; " +
              "font-src 'self' https://fonts.gstatic.com data:; " +
              "connect-src 'self' https:; " +
              "frame-src 'self' https://accounts.google.com; " +
              "object-src 'none'; " +
              "base-uri 'self'; " +
              "form-action 'self'; " +
              "frame-ancestors 'none';",
          },
          // Prevent MIME-type sniffing (mitigates drive-by downloads)
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Disallow framing altogether (clickjacking defence)
          { key: "X-Frame-Options", value: "DENY" },
          // Enable browser XSS filter (legacy, CSP does the real job)
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Only send the origin in Referer for cross-origin requests
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Restrict what browser features this site can access
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          // Strict-Transport-Security: always use HTTPS for 2 years
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
