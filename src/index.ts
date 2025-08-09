import 'dotenv/config';
import express from 'express';
import cors from 'cors'; 
import instructorRoutes from './routes/instructorRoutes';
import pacienteRoutes from './routes/pacienteRoutes';
import authRoutes from './routes/authRoutes';
import serieRoutes from './routes/serieRoutes';
import posturaRoutes from './routes/posturaRoutes';
import sesionRoutes from './routes/sesionRoutes';
import statsRoutes from './routes/statsRoutes';

const app = express();
app.disable('x-powered-by');

const corsOptions = {
  origin: 'http://localhost:5173'
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/instructores', instructorRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/series', serieRoutes);
app.use('/api/posturas', posturaRoutes);
app.use('/api/sesiones', sesionRoutes);
app.use('/api/stats', statsRoutes);

app.listen(3000, () => {
  console.log('Servidor corriendo en puerto 3000');
});