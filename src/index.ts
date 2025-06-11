// src/index.ts

import express from 'express';
import cors from 'cors'; 
import instructorRoutes from './routes/instructorRoutes';
import pacienteRoutes from './routes/pacienteRoutes';
import authRoutes from './routes/authRoutes';
import serieRoutes from './routes/serieRoutes';
import posturaRoutes from './routes/posturaRoutes';
import statsRoutes from './routes/statsRoutes';
import sesionRoutes from './routes/sesionRoutes';

const app = express();

const corsOptions = {
  origin: 'http://localhost:5173' // Permite solo peticiones desde frontend de Vite
};

app.use(cors(corsOptions));

app.use(express.json());

// El resto de tu configuración de rutas va después
app.use('/api/instructores', instructorRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/series', serieRoutes);
app.use('/api/posturas', posturaRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/sesiones', sesionRoutes);

app.listen(3000, () => {
  console.log('Servidor corriendo en puerto 3000');
});