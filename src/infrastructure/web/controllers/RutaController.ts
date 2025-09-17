import { Request, Response } from 'express';
import { AsignarRuta } from '../../../application/usecases/AsignarRuta';
import { RutaEnvioRepositoryImpl } from '../../db/repositories/RutaEnvioRepositoryImpl';
import { EnvioRepositoryImpl } from '../../db/repositories/EnvioRepositoryImpl';
import { AsignarRutaRequest } from '../../../domain/entities/AsignarRuta';

export class RutaController {
  private asignarRuta: AsignarRuta;
  private rutaEnvioRepository: RutaEnvioRepositoryImpl;

  constructor() {
    const rutaEnvioRepository = new RutaEnvioRepositoryImpl();
    const envioRepository = new EnvioRepositoryImpl();
    
    this.asignarRuta = new AsignarRuta(rutaEnvioRepository, envioRepository);
    this.rutaEnvioRepository = rutaEnvioRepository;
  }

  async asignar(req: Request, res: Response): Promise<void> {
    try {
      const { id_envio, id_ruta, id_transportista } = req.body;

      const request: AsignarRutaRequest = {
        id_envio,
        id_ruta,
        id_transportista
      };

      const asignacion = await this.asignarRuta.execute(request);

      res.status(201).json({
        success: true,
        message: 'Ruta asignada exitosamente al envío',
        data: asignacion
      });
    } catch (error) {
      console.error('Error assigning route:', error);
      
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

  async getTransportistasDisponibles(req: Request, res: Response): Promise<void> {
    try {
      const transportistas = await this.rutaEnvioRepository.getTransportistasDisponibles();

      res.status(200).json({
        success: true,
        message: 'Transportistas disponibles obtenidos exitosamente',
        data: transportistas
      });
    } catch (error) {
      console.error('Error getting available transporters:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getRutasDisponibles(req: Request, res: Response): Promise<void> {
    try {
      const rutas = await this.rutaEnvioRepository.getRutasDisponibles();

      res.status(200).json({
        success: true,
        message: 'Rutas disponibles obtenidas exitosamente',
        data: rutas
      });
    } catch (error) {
      console.error('Error getting available routes:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
