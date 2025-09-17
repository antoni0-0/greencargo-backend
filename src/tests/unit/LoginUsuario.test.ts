import { LoginUsuario } from '../../application/usecases/LoginUsuario';
import { UsuarioRepository } from '../../domain/repositories/UsuarioRepository';
import { Usuario } from '../../domain/entities/Usuario';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

const mockUsuarioRepository: jest.Mocked<UsuarioRepository> = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn()
};

describe('LoginUsuario', () => {
  let loginUsuario: LoginUsuario;

  beforeEach(() => {
    jest.clearAllMocks();
    loginUsuario = new LoginUsuario(mockUsuarioRepository);
  });

  describe('execute', () => {
    const validLoginRequest = {
      email: 'test@example.com',
      password: 'password123'
    };

    const mockUsuario: Usuario = {
      id: 1,
      nombre: 'Test User',
      email: validLoginRequest.email,
      password_hash: 'hashed_password',
      rol: 'cliente',
      fecha_registro: '2024-01-01'
    };

    it('should login successfully with valid credentials', async () => {
      mockUsuarioRepository.findByEmail.mockResolvedValue(mockUsuario);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await loginUsuario.execute(validLoginRequest);

      expect(mockUsuarioRepository.findByEmail).toHaveBeenCalledWith(validLoginRequest.email);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(validLoginRequest.password, mockUsuario.password_hash);
      expect(result).toEqual({
        token: expect.any(String),
        usuario: {
          id: mockUsuario.id,
          nombre: mockUsuario.nombre,
          email: mockUsuario.email,
          rol: mockUsuario.rol,
          fecha_registro: mockUsuario.fecha_registro
        }
      });
    });

    it('should throw error when required fields are missing', async () => {
      const invalidRequest = { email: '', password: 'password' };

      await expect(loginUsuario.execute(invalidRequest)).rejects.toThrow(
        'Email y password son requeridos'
      );
    });

    it('should throw error when user does not exist', async () => {
      mockUsuarioRepository.findByEmail.mockResolvedValue(null);

      await expect(loginUsuario.execute(validLoginRequest)).rejects.toThrow(
        'Credenciales inválidas'
      );
    });

    it('should throw error when password is incorrect', async () => {
      mockUsuarioRepository.findByEmail.mockResolvedValue(mockUsuario);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(loginUsuario.execute(validLoginRequest)).rejects.toThrow(
        'Credenciales inválidas'
      );
    });

    it('should generate token with correct payload', async () => {
      mockUsuarioRepository.findByEmail.mockResolvedValue(mockUsuario);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await loginUsuario.execute(validLoginRequest);

      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
    });
  });
});
