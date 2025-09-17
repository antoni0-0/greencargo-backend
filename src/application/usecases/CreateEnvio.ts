import { CreateEnvioRequest, EnvioResponse } from '../../domain/entities/Envio';
import { CreateDireccionRequest } from '../../domain/entities/Direccion';
import { EnvioRepository } from '../../domain/repositories/EnvioRepository';
import { DireccionRepository } from '../../domain/repositories/DireccionRepository';
import { UsuarioRepository } from '../../domain/repositories/UsuarioRepository';
import { validateColombianAddress, validateColombianCity, validateColombianDepartment } from '../../shared/utils/addressValidation';
import { QueueService } from '../../infrastructure/queue/QueueService';
import { EnvioEmailData } from '../../infrastructure/templates/EmailTemplates';

export class CreateEnvio {
  constructor(
    private envioRepository: EnvioRepository,
    private direccionRepository: DireccionRepository,
    private usuarioRepository: UsuarioRepository,
    private queueService: QueueService
  ) {}

  async execute(request: CreateEnvioRequest): Promise<EnvioResponse> {
    if (!request.id_usuario) {
      throw new Error('ID de usuario es requerido');
    }

    if (!request.direccion.direccion || !request.direccion.ciudad || !request.direccion.departamento) {
      throw new Error('Dirección, ciudad y departamento son requeridos');
    }

    if (!validateColombianAddress(request.direccion.direccion)) {
      throw new Error('La dirección debe seguir el formato colombiano: Calle/Carrera Número #Número-Número (ej: Calle 85 #11-42)');
    }

    if (!validateColombianCity(request.direccion.ciudad)) {
      throw new Error('La ciudad debe ser una ciudad colombiana válida');
    }

    if (!validateColombianDepartment(request.direccion.departamento)) {
      throw new Error('El departamento debe ser un departamento colombiano válido');
    }

    if (!request.peso || !request.largo || !request.ancho || !request.alto) {
      throw new Error('Peso y dimensiones son requeridos');
    }

    if (request.peso <= 0 || request.largo <= 0 || request.ancho <= 0 || request.alto <= 0) {
      throw new Error('Peso y dimensiones deben ser mayores a 0');
    }

    if (!request.tipo_producto) {
      throw new Error('Tipo de producto es requerido');
    }

    const volumen = request.largo * request.ancho * request.alto;

    const direccionRequest: CreateDireccionRequest = {
      direccion: request.direccion.direccion,
      detalle: request.direccion.detalle,
      ciudad: request.direccion.ciudad,
      departamento: request.direccion.departamento,
      codigo_postal: request.direccion.codigo_postal,
      pais: request.direccion.pais || 'Colombia'
    };

    const direccion = await this.direccionRepository.create(direccionRequest);

    const envio = await this.envioRepository.create({
      id_usuario: request.id_usuario,
      id_direccion: direccion.id!,
      id_estado_actual: 0,
      peso: request.peso,
      largo: request.largo,
      ancho: request.ancho,
      alto: request.alto,
      volumen: volumen,
      tipo_producto: request.tipo_producto
    });

    const envioResponse = await this.envioRepository.findById(envio.id!);
    if (!envioResponse) {
      throw new Error('Error al obtener la información del envío creado');
    }

    const usuario = await this.usuarioRepository.findById(request.id_usuario);
    if (usuario) {
      const emailData: EnvioEmailData = {
        usuarioNombre: usuario.nombre,
        usuarioEmail: usuario.email,
        envioId: envioResponse.id,
        direccion: envioResponse.direccion.direccion,
        ciudad: envioResponse.direccion.ciudad,
        departamento: envioResponse.direccion.departamento,
        peso: envioResponse.peso,
        dimensiones: `${envioResponse.largo} x ${envioResponse.ancho} x ${envioResponse.alto} cm`,
        tipoProducto: envioResponse.tipo_producto,
        fechaCreacion: new Date(envioResponse.fecha_creacion).toLocaleDateString('es-CO'),
        estado: envioResponse.estado.descripcion
      };

      this.queueService.addJob('email', 'envio_confirmation', emailData);
    }

    return envioResponse;
  }
}