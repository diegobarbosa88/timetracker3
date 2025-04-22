/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración específica para Netlify
  output: 'export',
  
  // Desactivar optimización de imágenes (necesario para exportación estática)
  images: {
    unoptimized: true,
  },
  
  // Ignorar errores de TypeScript durante la compilación
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Ignorar errores de ESLint durante la compilación
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Desactivar prerenderizado estático
  experimental: {
    appDir: true,
  },
  
  // Desactivar modo estricto de React
  reactStrictMode: false,
  
  // Desactivar compresión minify
  swcMinify: false,
  
  // Desactivar generación de sourcemaps
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig
