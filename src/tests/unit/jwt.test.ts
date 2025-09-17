import { generateToken, verifyToken, extractTokenFromHeader, JwtPayload } from '../../shared/utils/jwt';

describe('JWT Utils', () => {
  const mockPayload: JwtPayload = {
    userId: 1,
    email: 'test@example.com',
    rol: 'cliente'
  };

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-key';
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should generate different tokens for different payloads', () => {
      const token1 = generateToken(mockPayload);
      const token2 = generateToken({ ...mockPayload, userId: 2 });
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return payload', () => {
      const token = generateToken(mockPayload);
      const decoded = verifyToken(token);
      
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.rol).toBe(mockPayload.rol);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyToken('invalid-token');
      }).toThrow('Token inválido o expirado');
    });

    it('should throw error for malformed token', () => {
      expect(() => {
        verifyToken('not.a.valid.jwt.token');
      }).toThrow('Token inválido o expirado');
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      const token = 'valid.jwt.token';
      const header = `Bearer ${token}`;
      
      const extracted = extractTokenFromHeader(header);
      expect(extracted).toBe(token);
    });

    it('should throw error for missing header', () => {
      expect(() => {
        extractTokenFromHeader(undefined);
      }).toThrow('Token de autorización requerido');
    });

    it('should throw error for invalid format', () => {
      expect(() => {
        extractTokenFromHeader('InvalidFormat token');
      }).toThrow('Formato de token inválido. Use: Bearer <token>');
    });

    it('should throw error for empty token', () => {
      expect(() => {
        extractTokenFromHeader('Bearer ');
      }).toThrow('Token no encontrado en el header');
    });
  });
});
