import { Router } from 'express';
import { RutaController } from '../controllers/RutaController';
import { authenticateToken, requireRole } from '../middleware/auth';

export default function createRutaRoutes() {
  const router = Router();
  const rutaController = new RutaController();

  router.use(authenticateToken);

  router.post('/asignar', requireRole(['admin']), (req, res) => {
    rutaController.asignar(req, res);
  });

  router.get('/transportistas', requireRole(['admin']), (req, res) => {
    rutaController.getTransportistasDisponibles(req, res);
  });

  router.get('/disponibles', requireRole(['admin']), (req, res) => {
    rutaController.getRutasDisponibles(req, res);
  });

  return router;
}
