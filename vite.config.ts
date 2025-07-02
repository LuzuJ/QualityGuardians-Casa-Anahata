import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // La raíz de tu frontend sigue siendo la carpeta 'public'
  root: 'public',
  
  // La configuración de construcción ahora es para Múltiples Páginas (MPA)
  build: {
    outDir: '../dist/frontend',
    rollupOptions: {
      // Aquí definimos CADA PÁGINA de nuestra aplicación como un punto de entrada.
      // Esto le dice a Vite que no los ignore y los copie a la carpeta 'dist/frontend'.
      input: {
        main: resolve(__dirname, 'public/index.html'),
        inicioSesion: resolve(__dirname, 'public/inicioSesion.html'),
        registro: resolve(__dirname, 'public/registro.html'),
        activarCuenta: resolve(__dirname, 'public/activarCuenta.html'),
        dashboard: resolve(__dirname, 'public/dashboard.html'),
        gestionPacientes: resolve(__dirname, 'public/gestionPacientes.html'),
        gestionSeries: resolve(__dirname, 'public/gestionSeries.html'),
        crearSerie: resolve(__dirname, 'public/crearSerie.html'),
        editarSerie: resolve(__dirname, 'public/editarSerie.html'),
        asignarSerie: resolve(__dirname, 'public/asignarSerie.html'),
        ejecutarSesion: resolve(__dirname, 'public/ejecutarSesion.html'),
        ejecucionSerie: resolve(__dirname, 'public/ejecucionSerie.html'),
        registroSesion: resolve(__dirname, 'public/registroSesion.html'),
        detalleSesion: resolve(__dirname, 'public/detalleSesion.html'),
        vistaPacienteInstructor: resolve(__dirname, 'public/vistaPacienteInstructor.html'),
        visualizarPosturas: resolve(__dirname, 'public/visualizarPosturas.html'),
      }
    }
  },

  // La configuración del servidor de desarrollo no cambia
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})