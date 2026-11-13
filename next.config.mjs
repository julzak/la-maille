/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async redirects() {
    return [
      // Redirection de confort (temporaire, volontairement PAS permanente) : un
      // visiteur dont le cookie indique déjà une préférence FR et qui arrive
      // sur la racine EN est renvoyé vers la home FR. Jamais basé sur
      // Accept-Language : un crawler (Googlebot) sans cookie n'est jamais
      // redirigé, la racine sert l'EN. Faite ici et non dans le middleware
      // pour que la home reste servie par le CDN sans invoquer de fonction.
      {
        source: "/",
        has: [{ type: "cookie", key: "lamaille-lang", value: "fr" }],
        destination: "/fr",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
