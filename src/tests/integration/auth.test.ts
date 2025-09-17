import request from 'supertest';
import express from 'express';
import usuarioRoutes from '../../infrastructure/web/routes/usuarioRoutes';

jest.mock('../../infrastructure/db/repositories/UsuarioRepositoryImpl', () => {
  const mockUsuarioRepository = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn()
  };
  
  return {
    UsuarioRepositoryImpl: jest.fn().mockImplementation(() => mockUsuarioRepository)
  };
});

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true)
}));

describe('Auth Integration Tests', () => {
  let app: express.Application;
  let mockUsuarioRepository: any;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/usuarios', usuarioRoutes);
    
    const { UsuarioRepositoryImpl } = require('../../infrastructure/db/repositories/UsuarioRepositoryImpl');
    mockUsuarioRepository = new UsuarioRepositoryImpl();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUsuarioRepository.create.mockResolvedValue({
      id: 1,
      nombre: 'Test User',
      email: 'test@example.com',
      password_hash: 'hashed_password',
      rol: 'cliente',
      fecha_registro: '2024-01-01'
    });
    
    mockUsuarioRepository.findByEmail.mockResolvedValue({
      id: 1,
      nombre: 'Test User',
      email: 'test@example.com',
      password_hash: 'hashed_password',
      rol: 'cliente',
      fecha_registro: '2024-01-01'
    });
  });

  describe('POST /api/usuarios', () => {
    it('should create a new user successfully', async () => {
      mockUsuarioRepository.findByEmail.mockResolvedValue(null);
      
      const userData = {
        nombre: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        rol: 'cliente'
      };

      const response = await request(app)
        .post('/api/usuarios')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Usuario creado exitosamente');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.nombre).toBe(userData.nombre);
      expect(response.body.data.password_hash).toBeUndefined();
    });

    it('should return 400 for invalid email format', async () => {
      const userData = {
        nombre: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/usuarios')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Formato de email inválido');
    });

    it('should return 400 for short password', async () => {
      const userData = {
        nombre: 'Test User',
        email: 'test@example.com',
        password: '123'
      };

      const response = await request(app)
        .post('/api/usuarios')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('La contraseña debe tener al menos 6 caracteres');
    });

    it('should return 400 for missing required fields', async () => {
      const userData = {
        nombre: '',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/usuarios')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Nombre, email y password son requeridos');
    });
  });

  describe('POST /api/usuarios/login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/usuarios/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login exitoso');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.usuario).toBeDefined();
      expect(response.body.data.usuario.email).toBe(loginData.email);
    });

    it('should return 401 for invalid credentials', async () => {
      mockUsuarioRepository.findByEmail.mockResolvedValue(null);
      
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/usuarios/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Credenciales inválidas');
    });

    it('should return 401 for missing credentials', async () => {
      const loginData = {
        email: '',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/usuarios/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email y password son requeridos');
    });
  });
});
