import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';

const router = Router();
const usuarioController = new UsuarioController();

router.post('/', (req, res) => {
  usuarioController.create(req, res);
});

router.post('/login', (req, res) => {
  usuarioController.login(req, res);
});

export default router;
