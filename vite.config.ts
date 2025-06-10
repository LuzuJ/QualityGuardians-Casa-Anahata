import { defineConfig } from 'vite';

export default defineConfig({
  // La carpeta 'public' será la raíz de nuestro servidor de desarrollo
  root: 'public', 
  server: {
    port: 5173, // Puerto para el servidor de desarrollo del frontend
    proxy: {
      // Redirige las peticiones de /api a tu backend en el puerto 3000
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Le decimos a Vite que el punto de salida estará en la carpeta 'dist' principal
    outDir: '../dist/frontend',
  },
});