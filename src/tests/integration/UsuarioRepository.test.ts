import { UsuarioRepositoryImpl } from '../../infrastructure/db/repositories/UsuarioRepositoryImpl';
import { Usuario } from '../../domain/entities/Usuario';

const mockDb = {
  prepare: jest.fn(() => ({
    run: jest.fn(() => ({ lastInsertRowid: 1 })),
    get: jest.fn()
  })),
  exec: jest.fn()
};

jest.mock('../../infrastructure/db/database', () => ({
  openDb: jest.fn(() => mockDb)
}));

describe('UsuarioRepository Integration Tests', () => {
  let repository: UsuarioRepositoryImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new UsuarioRepositoryImpl();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const usuario: Usuario = {
        nombre: 'Test User',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        rol: 'cliente'
      };

      const mockGet = jest.fn().mockReturnValue({
        id: 1,
        nombre: usuario.nombre,
        email: usuario.email,
        password_hash: usuario.password_hash,
        rol: usuario.rol,
        fecha_registro: '2024-01-01'
      });
      
      mockDb.prepare.mockReturnValue({
        run: jest.fn().mockReturnValue({ lastInsertRowid: 1 }),
        get: mockGet
      });

      const result = await repository.create(usuario);

      expect(result.id).toBeDefined();
      expect(result.nombre).toBe(usuario.nombre);
      expect(result.email).toBe(usuario.email);
      expect(result.password_hash).toBe(usuario.password_hash);
      expect(result.rol).toBe(usuario.rol);
      expect(result.fecha_registro).toBeDefined();
    });
  });
  
  describe('findById', () => {
    it('should find user by id', async () => {
      const mockGet = jest.fn().mockReturnValue({
        id: 1,
        nombre: 'Test User',
        email: 'findbyid@example.com',
        password_hash: 'hashed_password',
        rol: 'cliente',
        fecha_registro: '2024-01-01'
      });
      
      mockDb.prepare.mockReturnValue({
        run: jest.fn().mockReturnValue({ lastInsertRowid: 1 }),
        get: mockGet
      });

      const found = await repository.findById(1);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(1);
      expect(found?.email).toBe('findbyid@example.com');
    });

    it('should return null when user not found by id', async () => {
      const mockGet = jest.fn().mockReturnValue(null);
      
      mockDb.prepare.mockReturnValue({
        run: jest.fn().mockReturnValue({ lastInsertRowid: 1 }),
        get: mockGet
      });

      const found = await repository.findById(999);
      expect(found).toBeNull();
    });
  });
});
