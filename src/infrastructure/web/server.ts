import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { initDb } from '../db/database';
import usuarioRoutes from './routes/usuarioRoutes';
import createEnvioRoutes from './routes/envioRoutes';
import createRutaRoutes from './routes/rutaRoutes';
import { QueueService } from '../queue/QueueService';
import { EmailProcessor } from '../queue/processors/EmailProcessor';
import { WebSocketService } from '../websocket/WebSocketService';
import { EnvioController } from './controllers/EnvioController';

const app = express();
const server = createServer(app);

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

initDb();

const queueService = new QueueService();
const emailProcessor = new EmailProcessor();
queueService.registerProcessor('email', emailProcessor);

const webSocketService = new WebSocketService(server);

const envioController = new EnvioController(queueService, webSocketService);

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/envios', createEnvioRoutes(queueService, webSocketService));
app.use('/api/rutas', createRutaRoutes(envioController));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    queues: {
      email: queueService.getQueueStatus('email')
    },
    websocket: webSocketService.getConnectionStats()
  });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Email queue system initialized`);
    console.log(`SMTP configured: ${process.env.SMTP_USER ? 'Yes' : 'No'}`);
    console.log(`WebSocket server initialized`);
  });
}