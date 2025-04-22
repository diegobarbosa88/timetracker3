// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exportar como sitio estático
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
  
  // Desactivar prerenderizado de páginas específicas
  exportPathMap: async function() {
    return {
      '/': { page: '/' },
      '/dashboard': { page: '/dashboard' },
      '/cronometro': { page: '/cronometro' },
      '/registro-manual': { page: '/registro-manual' },
      '/reports': { page: '/reports' },
      '/auth/login': { page: '/auth/login' },
      '/404': { page: '/404' },
    };
  },
  
  // Desactivar compresión minify
  swcMinify: false,
  
  // Desactivar generación de sourcemaps
  productionBrowserSourceMaps: false,
}
