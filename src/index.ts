import express from 'express';
import instructorRoutes from './routes/instructorRoutes';
import pacienteRoutes from './routes/pacienteRoutes';
import authRoutes from './routes/authRoutes';

const app = express();

app.use(express.json());

app.use('/api/instructores', instructorRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/pacientes', pacienteRoutes);

app.listen(3000, () => {
  console.log('Servidor corriendo en puerto 3000');
});
