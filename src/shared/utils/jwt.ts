import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'screto-prueba';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface JwtPayload {
  userId: number;
  email: string;
  rol: string;
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string {
  if (!authHeader) {
    throw new Error('Token de autorización requerido');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new Error('Formato de token inválido. Use: Bearer <token>');
  }

  const token = parts[1];
  if (!token) {
    throw new Error('Token no encontrado en el header');
  }

  return token;
}
