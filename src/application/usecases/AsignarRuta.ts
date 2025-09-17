import { AsignarRutaRequest, RutaEnvioResponse } from '../../domain/entities/AsignarRuta';
import { RutaEnvioRepository } from '../../domain/repositories/RutaEnvioRepository';
import { EnvioRepository } from '../../domain/repositories/EnvioRepository';

export class AsignarRuta {
  constructor(
    private rutaEnvioRepository: RutaEnvioRepository,
    private envioRepository: EnvioRepository
  ) {}

  async execute(request: AsignarRutaRequest): Promise<RutaEnvioResponse> {
    if (!request.id_envio || !request.id_ruta || !request.id_transportista) {
      throw new Error('ID de envío, ruta y transportista son requeridos');
    }

    const envio = await this.envioRepository.findById(request.id_envio);
    if (!envio) {
      throw new Error('Envío no encontrado');
    }

    const asignacionExistente = await this.rutaEnvioRepository.findByEnvioId(request.id_envio);
    if (asignacionExistente) {
      throw new Error('El envío ya está asignado a una ruta');
    }

    const transportistaDisponible = await this.rutaEnvioRepository.verificarDisponibilidadTransportista(request.id_transportista);
    if (!transportistaDisponible) {
      throw new Error('El transportista no está disponible');
    }

    const capacidadSuficiente = await this.rutaEnvioRepository.verificarCapacidadVehiculo(
      request.id_transportista, 
      envio.peso, 
      envio.volumen
    );
    if (!capacidadSuficiente) {
      throw new Error('El vehículo no tiene capacidad suficiente para este envío');
    }

    const rutaEnvio = await this.rutaEnvioRepository.create({
      id_envio: request.id_envio,
      id_ruta: request.id_ruta,
      id_transportista: request.id_transportista
    });

    await this.envioRepository.updateEstado(request.id_envio, 1);

    const rutaEnvioResponse = await this.rutaEnvioRepository.findById(rutaEnvio.id!);
    if (!rutaEnvioResponse) {
      throw new Error('Error al obtener la información de la asignación creada');
    }

    return rutaEnvioResponse;
  }
}
