import express from 'express';
import { initDb } from '../db/database';
import usuarioRoutes from './routes/usuarioRoutes';

const app = express();
app.use(express.json());

initDb();

app.use('/api/usuarios', usuarioRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});