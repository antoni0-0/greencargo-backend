import { Request, Response } from 'express';
import { CreateEnvio } from '../../../application/usecases/CreateEnvio';
import { EnvioRepositoryImpl } from '../../db/repositories/EnvioRepositoryImpl';
import { DireccionRepositoryImpl } from '../../db/repositories/DireccionRepositoryImpl';
import { UsuarioRepositoryImpl } from '../../db/repositories/UsuarioRepositoryImpl';
import { CreateEnvioRequest } from '../../../domain/entities/Envio';
import { QueueService } from '../../queue/QueueService';
import { WebSocketService } from '../../websocket/WebSocketService';

export class EnvioController {
  private createEnvio: CreateEnvio;
  private webSocketService: WebSocketService;

  constructor(queueService: QueueService, webSocketService: WebSocketService) {
    this.webSocketService = webSocketService;
    
    const envioRepository = new EnvioRepositoryImpl();
    const direccionRepository = new DireccionRepositoryImpl();
    const usuarioRepository = new UsuarioRepositoryImpl();
    
    this.createEnvio = new CreateEnvio(
      envioRepository, 
      direccionRepository, 
      usuarioRepository, 
      queueService
    );
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const { direccion, peso, largo, ancho, alto, tipo_producto } = req.body;

      const request: CreateEnvioRequest = {
        id_usuario: userId,
        direccion,
        peso,
        largo,
        ancho,
        alto,
        tipo_producto
      };

      const envio = await this.createEnvio.execute(request);

      res.status(201).json({
        success: true,
        message: 'Envío creado exitosamente. Se enviará un correo de confirmación.',
        data: envio
      });
    } catch (error) {
      console.error('Error creating envio:', error);
      
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

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const envioRepository = new EnvioRepositoryImpl();
      
      const estadoId = req.query.estado ? parseInt(req.query.estado as string) : undefined;
      
      if (estadoId !== undefined && (isNaN(estadoId) || estadoId < 0 || estadoId > 2)) {
        res.status(400).json({
          success: false,
          message: 'Estado inválido. Los valores válidos son: 0 (En espera), 1 (En tránsito), 2 (Entregado)'
        });
        return;
      }
      
      const envios = await envioRepository.getAllEnvios(estadoId);
      
      let message = 'Envíos obtenidos exitosamente';
      if (estadoId !== undefined) {
        const estadoNames = ['En espera', 'En tránsito', 'Entregado'];
        message = `Envíos con estado "${estadoNames[estadoId]}" obtenidos exitosamente`;
      }

      res.status(200).json({
        success: true,
        message,
        data: envios,
        filters: {
          estado: estadoId !== undefined ? estadoId : 'todos'
        }
      });
    } catch (error) {
      console.error('Error getting shipments:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getByUsuario(req: Request, res: Response): Promise<void> {
    try {
      const envioRepository = new EnvioRepositoryImpl();
      const usuarioId = (req as any).user.userId;
      
      const envios = await envioRepository.findByUsuarioId(usuarioId);

      res.status(200).json({
        success: true,
        message: 'Envíos del usuario obtenidos exitosamente',
        data: envios
      });
    } catch (error) {
      console.error('Error getting user shipments:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async updateEnvioStatus(envioId: number, nuevoEstado: number): Promise<any> {
    try {
      const envioRepository = new EnvioRepositoryImpl();
      
      const envioActual = await envioRepository.findById(envioId);
      if (!envioActual) {
        throw new Error('Envío no encontrado');
      }

      if (envioActual.id_estado_actual === nuevoEstado) {
        throw new Error('El envío ya tiene este estado');
      }

      const actualizado = await envioRepository.updateEstado(envioId, nuevoEstado);
      
      if (!actualizado) {
        throw new Error('Error al actualizar el estado del envío');
      }

      const estadoNames = ['En espera', 'En tránsito', 'Entregado'];
      const descripcionAnterior = estadoNames[envioActual.id_estado_actual] || 'Desconocido';
      const descripcionNueva = estadoNames[nuevoEstado] || 'Desconocido';
      const comentario = `Cambio de estado: ${descripcionAnterior} → ${descripcionNueva}`;
      
      await envioRepository.saveEstadoEnvio(envioId, nuevoEstado, comentario);

      const envioActualizado = await envioRepository.findById(envioId);
      
      const update = {
        envioId: envioId,
        usuarioId: envioActual.id_usuario,
        estadoAnterior: {
          id: envioActual.id_estado_actual,
          descripcion: descripcionAnterior
        },
        estadoNuevo: {
          id: nuevoEstado,
          descripcion: descripcionNueva
        },
        fechaActualizacion: new Date().toISOString(),
        mensaje: `El envío ha cambiado de "${descripcionAnterior}" a "${descripcionNueva}"`
      };

      this.webSocketService.broadcastEnvioStatusUpdate(update);

      return {
        envio: envioActualizado,
        update
      };
    } catch (error) {
      throw error;
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      
      if (!id || isNaN(parseInt(id))) {
        res.status(400).json({
          success: false,
          message: 'ID de envío inválido'
        });
        return;
      }
      
      if (estado === undefined || isNaN(estado) || estado < 0 || estado > 2) {
        res.status(400).json({
          success: false,
          message: 'Estado inválido. Los valores válidos son: 0 (En espera), 1 (En tránsito), 2 (Entregado)'
        });
        return;
      }

      const envioId = parseInt(id);
      const result = await this.updateEnvioStatus(envioId, estado);

      res.status(200).json({
        success: true,
        message: 'Estado del envío actualizado exitosamente',
        data: result.envio,
        update: result.update
      });
    } catch (error) {
      console.error('Error updating shipment status:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Envío no encontrado') {
          res.status(404).json({
            success: false,
            message: error.message
          });
        } else if (error.message === 'El envío ya tiene este estado') {
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
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor'
        });
      }
    }
  }

  async getHistorial(req: Request, res: Response): Promise<void> {
    try {
      const envioRepository = new EnvioRepositoryImpl();
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        res.status(400).json({
          success: false,
          message: 'ID de envío inválido'
        });
        return;
      }

      const envioId = parseInt(id);
      
      const envio = await envioRepository.findById(envioId);
      if (!envio) {
        res.status(404).json({
          success: false,
          message: 'Envío no encontrado'
        });
        return;
      }

      const usuarioId = (req as any).user.userId;
      const userRole = (req as any).user.rol;
      
      if (userRole !== 'admin' && envio.id_usuario !== usuarioId) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver este envío'
        });
        return;
      }

      const historial = await envioRepository.getHistorialEstados(envioId);

      res.status(200).json({
        success: true,
        message: 'Historial de estados obtenido exitosamente',
        data: {
          envio: {
            id: envio.id,
            tipo_producto: envio.tipo_producto,
            peso: envio.peso,
            direccion: envio.direccion
          },
          historial
        }
      });
    } catch (error) {
      console.error('Error getting shipment history:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}