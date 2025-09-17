import { Request, Response } from 'express';
import { CreateUsuario } from '../../../application/usecases/CreateUsuario';
import { LoginUsuario } from '../../../application/usecases/LoginUsuario';
import { UsuarioRepositoryImpl } from '../../db/repositories/UsuarioRepositoryImpl';
import { CreateUsuarioRequest } from '../../../domain/entities/Usuario';

export class UsuarioController {
  private createUsuario: CreateUsuario;
  private loginUsuario: LoginUsuario;

  constructor() {
    const usuarioRepository = new UsuarioRepositoryImpl();
    this.createUsuario = new CreateUsuario(usuarioRepository);
    this.loginUsuario = new LoginUsuario(usuarioRepository);
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, email, password, rol } = req.body;

      const request: CreateUsuarioRequest = {
        nombre,
        email,
        password,
        rol
      };

      const usuario = await this.createUsuario.execute(request);

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: usuario
      });
    } catch (error) {
      console.error('Error creating usuario:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor'
        });
      }
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const loginResponse = await this.loginUsuario.execute({ email, password });

      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: loginResponse
      });
    } catch (error) {
      console.error('Error during login:', error);
      
      if (error instanceof Error) {
        res.status(401).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor'
        });
      }
    }
  }
}
