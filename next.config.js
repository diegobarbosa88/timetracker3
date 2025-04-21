// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Desactivar prerenderizado para evitar errores con hooks de autenticación
  // que no están disponibles durante la compilación
  images: {
    unoptimized: true,
  },
  // Configuración para despliegue estático
  trailingSlash: true,
  // Desactivar comprobación de tipos estricta durante la compilación
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
