import { CreateUsuario } from '../../application/usecases/CreateUsuario';
import { UsuarioRepository } from '../../domain/repositories/UsuarioRepository';
import { CreateUsuarioRequest, Usuario } from '../../domain/entities/Usuario';

const mockUsuarioRepository: jest.Mocked<UsuarioRepository> = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn()
};

describe('CreateUsuario', () => {
  let createUsuario: CreateUsuario;

  beforeEach(() => {
    jest.clearAllMocks();
    createUsuario = new CreateUsuario(mockUsuarioRepository);
  });

  describe('execute', () => {
    const validRequest: CreateUsuarioRequest = {
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'password123',
      rol: 'cliente'
    };

    it('should create a user successfully', async () => {
      const mockUsuario: Usuario = {
        id: 1,
        nombre: validRequest.nombre,
        email: validRequest.email,
        password_hash: 'hashed_password',
        rol: validRequest.rol || 'cliente',
        fecha_registro: '2024-01-01'
      };

      mockUsuarioRepository.findByEmail.mockResolvedValue(null);
      mockUsuarioRepository.create.mockResolvedValue(mockUsuario);

      const result = await createUsuario.execute(validRequest);

      expect(mockUsuarioRepository.findByEmail).toHaveBeenCalledWith(validRequest.email);
      expect(mockUsuarioRepository.create).toHaveBeenCalled();
      expect(result).toEqual({
        id: 1,
        nombre: validRequest.nombre,
        email: validRequest.email,
        rol: validRequest.rol,
        fecha_registro: '2024-01-01'
      });
    });

    it('should throw error when required fields are missing', async () => {
      const invalidRequest = { ...validRequest, nombre: '' };

      await expect(createUsuario.execute(invalidRequest)).rejects.toThrow(
        'Nombre, email y password son requeridos'
      );
    });

    it('should throw error for invalid email format', async () => {
      const invalidRequest = { ...validRequest, email: 'invalid-email' };

      await expect(createUsuario.execute(invalidRequest)).rejects.toThrow(
        'Formato de email inválido'
      );
    });

    it('should throw error for short password', async () => {
      const invalidRequest = { ...validRequest, password: '123' };

      await expect(createUsuario.execute(invalidRequest)).rejects.toThrow(
        'La contraseña debe tener al menos 6 caracteres'
      );
    });

    it('should throw error when user already exists', async () => {
      const existingUser: Usuario = {
        id: 1,
        nombre: 'Existing User',
        email: validRequest.email,
        password_hash: 'hash',
        rol: 'cliente'
      };

      mockUsuarioRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(createUsuario.execute(validRequest)).rejects.toThrow(
        'Ya existe un usuario con este email'
      );
    });

    it('should use default role when not provided', async () => {
      const requestWithoutRole = { ...validRequest };
      delete requestWithoutRole.rol;

      const mockUsuario: Usuario = {
        id: 1,
        nombre: validRequest.nombre,
        email: validRequest.email,
        password_hash: 'hashed_password',
        rol: 'cliente',
        fecha_registro: '2024-01-01'
      };

      mockUsuarioRepository.findByEmail.mockResolvedValue(null);
      mockUsuarioRepository.create.mockResolvedValue(mockUsuario);

      await createUsuario.execute(requestWithoutRole);

      expect(mockUsuarioRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          rol: 'cliente'
        })
      );
    });
  });
});
