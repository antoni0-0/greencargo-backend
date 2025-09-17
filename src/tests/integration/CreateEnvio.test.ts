import { CreateEnvio } from '../../application/usecases/CreateEnvio';
import { EnvioRepository } from '../../domain/repositories/EnvioRepository';
import { DireccionRepository } from '../../domain/repositories/DireccionRepository';
import { UsuarioRepository } from '../../domain/repositories/UsuarioRepository';
import { QueueService } from '../../infrastructure/queue/QueueService';
import { CreateEnvioRequest, EnvioResponse } from '../../domain/entities/Envio';
import { Usuario } from '../../domain/entities/Usuario';
import { Direccion } from '../../domain/entities/Direccion';

const mockEnvioRepository: jest.Mocked<EnvioRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findByUsuarioId: jest.fn(),
  updateEstado: jest.fn(),
  getAllEnvios: jest.fn(),
  getHistorialEstados: jest.fn(),
  saveEstadoEnvio: jest.fn()
};

const mockDireccionRepository: jest.Mocked<DireccionRepository> = {
  create: jest.fn()
};

const mockUsuarioRepository: jest.Mocked<UsuarioRepository> = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn()
};

const mockQueueService = {
  addJob: jest.fn()
} as any;

describe('CreateEnvio Integration Tests', () => {
  let createEnvio: CreateEnvio;

  beforeEach(() => {
    jest.clearAllMocks();
    createEnvio = new CreateEnvio(
      mockEnvioRepository,
      mockDireccionRepository,
      mockUsuarioRepository,
      mockQueueService
    );
  });

  describe('execute', () => {
    const validRequest: CreateEnvioRequest = {
      id_usuario: 1,
      direccion: {
        direccion: 'Calle 85 #11-42',
        detalle: 'Apartamento 201',
        ciudad: 'Bogotá',
        departamento: 'Cundinamarca',
        codigo_postal: '110221',
        pais: 'Colombia'
      },
      peso: 2.5,
      largo: 30,
      ancho: 20,
      alto: 15,
      tipo_producto: 'Electrónicos'
    };

    const mockUsuario: Usuario = {
      id: 1,
      nombre: 'Test User',
      email: 'test@example.com',
      password_hash: 'hash',
      rol: 'cliente',
      fecha_registro: '2024-01-01'
    };

    const mockDireccion: Direccion = {
      id: 1,
      direccion: validRequest.direccion.direccion,
      detalle: validRequest.direccion.detalle,
      ciudad: validRequest.direccion.ciudad,
      departamento: validRequest.direccion.departamento,
      codigo_postal: validRequest.direccion.codigo_postal,
      pais: validRequest.direccion.pais
    };

    const mockEnvioResponse: EnvioResponse = {
      id: 1,
      id_usuario: 1,
      id_direccion: 1,
      id_estado_actual: 0,
      peso: 2.5,
      largo: 30,
      ancho: 20,
      alto: 15,
      volumen: 9000,
      tipo_producto: 'Electrónicos',
      fecha_creacion: '2024-01-01T10:00:00Z',
      direccion: {
        id: 1,
        direccion: 'Calle 85 #11-42',
        detalle: 'Apartamento 201',
        ciudad: 'Bogotá',
        departamento: 'Cundinamarca',
        codigo_postal: '110221',
        pais: 'Colombia'
      },
      estado: {
        id: 0,
        descripcion: 'Pendiente'
      }
    };

    it('should create an envio successfully', async () => {
      mockDireccionRepository.create.mockResolvedValue(mockDireccion);
      mockEnvioRepository.create.mockResolvedValue({
        id: 1,
        id_usuario: 1,
        id_direccion: 1,
        id_estado_actual: 0,
        peso: 2.5,
        largo: 30,
        ancho: 20,
        alto: 15,
        volumen: 9000,
        tipo_producto: 'Electrónicos',
        fecha_creacion: '2024-01-01T10:00:00Z'
      });
      mockEnvioRepository.findById.mockResolvedValue(mockEnvioResponse);
      mockUsuarioRepository.findById.mockResolvedValue(mockUsuario);

      const result = await createEnvio.execute(validRequest);

      expect(mockDireccionRepository.create).toHaveBeenCalled();
      expect(mockEnvioRepository.create).toHaveBeenCalled();
      expect(mockEnvioRepository.findById).toHaveBeenCalled();
      expect(mockUsuarioRepository.findById).toHaveBeenCalled();
      expect(mockQueueService.addJob).toHaveBeenCalledWith('email', 'envio_confirmation', expect.any(Object));
      expect(result).toEqual(mockEnvioResponse);
    });

    it('should calculate volume correctly', async () => {
      mockDireccionRepository.create.mockResolvedValue(mockDireccion);
      mockEnvioRepository.create.mockResolvedValue({
        id: 1,
        id_usuario: 1,
        id_direccion: 1,
        id_estado_actual: 0,
        peso: 2.5,
        largo: 30,
        ancho: 20,
        alto: 15,
        volumen: 9000,
        tipo_producto: 'Electrónicos',
        fecha_creacion: '2024-01-01T10:00:00Z'
      });
      mockEnvioRepository.findById.mockResolvedValue(mockEnvioResponse);
      mockUsuarioRepository.findById.mockResolvedValue(mockUsuario);

      await createEnvio.execute(validRequest);

      expect(mockEnvioRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          volumen: 9000
        })
      );
    });

    it('should throw error for invalid address format', async () => {
      const invalidRequest = {
        ...validRequest,
        direccion: {
          ...validRequest.direccion,
          direccion: 'Invalid Address Format'
        }
      };

      await expect(createEnvio.execute(invalidRequest)).rejects.toThrow(
        'La dirección debe seguir el formato colombiano'
      );
    });

    it('should throw error for invalid city', async () => {
      const invalidRequest = {
        ...validRequest,
        direccion: {
          ...validRequest.direccion,
          ciudad: 'Invalid City'
        }
      };

      await expect(createEnvio.execute(invalidRequest)).rejects.toThrow(
        'La ciudad debe ser una ciudad colombiana válida'
      );
    });

    it('should throw error for invalid department', async () => {
      const invalidRequest = {
        ...validRequest,
        direccion: {
          ...validRequest.direccion,
          departamento: 'Invalid Department'
        }
      };

      await expect(createEnvio.execute(invalidRequest)).rejects.toThrow(
        'El departamento debe ser un departamento colombiano válido'
      );
    });

    it('should throw error for negative dimensions', async () => {
      const invalidRequest = {
        ...validRequest,
        peso: -1,
        largo: 30,
        ancho: 20,
        alto: 15
      };

      await expect(createEnvio.execute(invalidRequest)).rejects.toThrow(
        'Peso y dimensiones deben ser mayores a 0'
      );
    });

    it('should throw error for missing required fields', async () => {
      const invalidRequest = {
        ...validRequest,
        peso: 0,
        largo: 0,
        ancho: 0,
        alto: 0
      };

      await expect(createEnvio.execute(invalidRequest)).rejects.toThrow(
        'Peso y dimensiones son requeridos'
      );
    });
  });
});
