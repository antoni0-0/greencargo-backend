import { Router } from 'express';
import { EnvioController } from '../controllers/EnvioController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { QueueService } from '../../queue/QueueService';
import { WebSocketService } from '../../websocket/WebSocketService';

export default function createEnvioRoutes(queueService: QueueService, webSocketService: WebSocketService) {
  const router = Router();
  const envioController = new EnvioController(queueService, webSocketService);

  router.use(authenticateToken);

  router.post('/', (req, res) => {
    envioController.create(req, res);
  });

  router.get('/', requireRole(['admin']), (req, res) => {
    envioController.getAll(req, res);
  });

  router.get('/mis-envios', (req, res) => {
    envioController.getByUsuario(req, res);
  });

  router.put('/:id/estado', requireRole(['admin']), (req, res) => {
    envioController.updateStatus(req, res);
  });

  router.get('/:id/historial', (req, res) => {
    envioController.getHistorial(req, res);
  });

  return router;
}